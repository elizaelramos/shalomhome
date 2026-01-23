import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/cadastro");
  const isPublicPage = req.nextUrl.pathname === "/";

  // Se está logado e tenta acessar login/cadastro, redireciona para /familias
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/familias", req.nextUrl));
  }

  // Se não está logado e tenta acessar página protegida
  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|.*\\.png$).*)"],
};
