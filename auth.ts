import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

// OIDC_ISSUER is the canonical issuer URL (must match token `iss` claim)
// OIDC_ISSUER_INTERNAL overrides server-to-server calls in Docker
// (where localhost isn't reachable from the app container)
const issuer = process.env.OIDC_ISSUER?.replace(/\/+$/, "")
const internal = (process.env.OIDC_ISSUER_INTERNAL || process.env.OIDC_ISSUER)?.replace(/\/+$/, "")
// Keep the raw issuer for token validation (must match iss claim exactly)
const issuerRaw = process.env.OIDC_ISSUER

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    {
      id: "mathauth",
      name: "MathAuth",
      type: "oidc",
      issuer: issuerRaw,
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      authorization: {
        url: `${issuer}/connect/authorize`,
        params: {
          scope: "openid profile offline_access",
        },
      },
      token: {
        url: `${internal}/connect/token`,
      },
      userinfo: {
        url: `${internal}/connect/userinfo`,
      },
      // Discovery endpoint also needs to be reachable from the server
      wellKnown: `${internal}/.well-known/openid-configuration`,
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
