import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const proxy = NextAuth(authConfig).auth;

export const config = {
  // Ignoramos rutas estáticas, API, e imágenes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
