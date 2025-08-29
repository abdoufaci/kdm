import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

export type ExtendedUser = {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  image: {
    id: string;
    type: string;
  } | null;
} & DefaultSession["user"];

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  }
}
