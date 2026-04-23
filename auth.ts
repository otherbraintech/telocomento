import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        
        const identifier = credentials.identifier as string;
        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: identifier },
              { username: identifier }
            ]
          },
        });

        if (user && user.password) {
          const { compare } = await import("bcryptjs");
          const isValid = await compare(credentials.password as string, user.password);
          if (isValid) return user;
        }

        return null;
      },
    }),
  ],
});
