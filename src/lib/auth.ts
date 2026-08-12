import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

/**
 * Resolve the canonical URL for NextAuth.
 * - Development  : http://localhost:3000
 * - Vercel (no custom domain): https://<random>.vercel.app  (via VERCEL_URL)
 * - Production with custom domain: value of NEXTAUTH_URL env var
 */
function resolveUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

const isProduction = process.env.NODE_ENV === 'production'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // trustHost: true is REQUIRED on Vercel.
  // Without it, NextAuth compares the request origin against NEXTAUTH_URL.
  // On Vercel, VERCEL_URL is the deployment-specific URL (e.g. ads-sponsa-abc.vercel.app)
  // but users access the production alias (e.g. ads-sponsa.vercel.app).
  // This mismatch causes CSRF validation to silently reject every login attempt.
  trustHost: true,

  secret: process.env.NEXTAUTH_SECRET,

  // ── Cookie configuration ──────────────────────────────────────────────────
  // Vercel production runs over HTTPS; we need the __Secure- prefix and
  // secure=true so the browser actually stores the session cookie.
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: isProduction,
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) return null

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isPasswordValid) return null

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          // Log the real error for Vercel Functions logs, return null to
          // trigger a CredentialsSignin error in the UI instead of hanging.
          console.error('[NextAuth] authorize — DB error:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Explicitly persist id and role into the JWT token
        token.id = user.id
        token.role = (user as { id: string; name: string; email: string; role: Role }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Forward id and role from token into the session object
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // Redirect auth errors back to /login?error=<code>
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

// ── Type augmentation ─────────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
    }
  }
}

// Export resolved URL so other modules can reference it if needed
export const authUrl = resolveUrl()
