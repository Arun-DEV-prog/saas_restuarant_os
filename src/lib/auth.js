// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          console.log("🔍 Auth attempt:", { email: credentials.email });

          const db = await getDb();
          console.log("📦 Database connection established");

          const user = await db.collection("users").findOne({
            email: credentials.email.toLowerCase(),
          });

          console.log("👤 User found:", user ? "Yes" : "No");

          if (!user) {
            console.log("❌ No user found with email:", credentials.email);
            throw new Error("No user found with this email");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          console.log("🔐 Password valid:", isValidPassword);

          if (!isValidPassword) {
            console.log("❌ Password mismatch for user:", credentials.email);
            throw new Error("Invalid password");
          }

          console.log("✅ Auth successful for:", credentials.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user", // Default role is 'user'
            restaurantId: user.restaurantId?.toString(),
          };
        } catch (error) {
          console.error("🚨 Auth error:", error.message);
          console.error("Stack:", error.stack);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.restaurantId = token.restaurantId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
