// Lightweight middleware: только редиректы, БЕЗ NextAuth-обёртки.
// Раньше здесь была `authMiddleware(...)` — она сама проверяла сессию и редиректила
// на `pages.signIn`, что ломало flow: после успешного signIn cookie не успевал
// "зацепиться" и middleware снова выкидывал на логин. Сервер-компоненты
// (/admin/layout.tsx, /account/page.tsx) сами делают `redirect(...)` при отсутствии
// сессии, так что дополнительная проверка в middleware не нужна.
import { NextResponse } from "next/server";

export default function middleware(req: Request & { nextUrl: URL }) {
  const url = (req as any).nextUrl as URL;
  const path = url.pathname;

  // /catalog → /#products (каталог перенесён на главную)
  if (path === "/catalog" || path.startsWith("/catalog/")) {
    const u = new URL("/", url);
    u.hash = "products";
    return NextResponse.redirect(u, 308);
  }

  // /login и /register → /?auth=login|register (откроет попап)
  if (path === "/login" || path === "/register") {
    const u = new URL("/", url);
    u.search = "";
    u.searchParams.set("auth", path === "/login" ? "login" : "register");
    const next = url.searchParams.get("next");
    if (next) u.searchParams.set("next", next);
    return NextResponse.redirect(u, 308);
  }

  return NextResponse.next();
}

export const config = {
  // ВАЖНО: НЕ матчим /api/*, чтобы middleware не висел на каждом auth-запросе.
  // Server-компоненты (/admin, /account) сами делают redirect если нет сессии.
  matcher: ["/catalog", "/catalog/:path*", "/login", "/register"],
};
