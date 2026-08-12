import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  // На Vercel next-auth сам определяет host из заголовков при trustHost:true.
  // NEXTAUTH_URL всё ещё нужен, но NextAuth не падает если он пуст — есть fallback.
  session: { strategy: "jwt" },
  // БЕЗ pages.signIn: пусть NextAuth использует свой дефолт (/api/auth/signin).
  // Редирект на попап делает наш кастомный middleware для /login, /register,
  // и AuthContext слушает ?auth=login в URL. Раньше здесь было
  // pages: { signIn: "/?auth=login" } — query-параметр ломал NextAuth flow.
  providers: [
    Credentials({
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase().trim();
        const password = String(creds?.password || "");
        console.log("[auth] authorize() called with email:", email, "pw length:", password.length);
        if (!email || !password) {
          console.log("[auth] ✗ empty email or password");
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log("[auth] ✗ user not found:", email);
          return null;
        }
        if (!user.passwordHash) {
          console.log("[auth] ✗ user has no passwordHash");
          return null;
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        console.log("[auth] bcrypt.compare →", ok, "for", email);
        if (!ok) return null;
        console.log("[auth] ✓ login OK, returning user");
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      // Принудительно подтянуть актуальную роль при update сессии
      if (trigger === "update" && token.id) {
        const u = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } });
        if (u) token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Всегда подтягиваем роль из БД — иначе после смены роли в админке изменения не видны
        try {
          const u = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          (session.user as any).id = token.id;
          (session.user as any).role = u?.role ?? token.role ?? "USER";
        } catch {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role ?? "USER";
        }
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
