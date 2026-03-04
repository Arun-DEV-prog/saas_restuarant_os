import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/db";

console.log("📋 [NextAuth Route] Loading auth configuration...");

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        try {
          console.log("🔍 [NextAuth] Auth attempt:", {
            email: credentials.email,
          });

          const db = await getDb();
          console.log("✅ [NextAuth] Database connected");

          const user = await db.collection("users").findOne({
            email: credentials.email.toLowerCase(),
          });

          console.log("👤 [NextAuth] User found:", user ? "YES" : "NO");
          if (!user) {
            console.log("❌ [NextAuth] No user with email:", credentials.email);
            throw new Error("No user found");
          }

          console.log("🔐 [NextAuth] Checking password...");
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          console.log("🔐 [NextAuth] Password valid:", isValid);

          if (!isValid) {
            console.log("❌ [NextAuth] Invalid password");
            throw new Error("Invalid password");
          }

          console.log("✅ [NextAuth] Auth success!");
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId?.toString() || null,
          };
        } catch (error) {
          console.error("🚨 [NextAuth] Error:", error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId; // ✅ now exists
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.restaurantId = token.restaurantId; // ✅ now exists
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
