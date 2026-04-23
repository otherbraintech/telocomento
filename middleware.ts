import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Ignoramos rutas estáticas, API, e imágenes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
