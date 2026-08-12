import type { Metadata } from "next";
import { Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { FloatingConstructor } from "@/components/FloatingConstructor";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Solyn Studio — светильники, постеры, картины ручной работы",
  description:
    "Светильники и картины с подсветкой, постеры и авторский арт. Создаём свой дизайн из вашего фото. Доставка по Баку и Азербайджану.",
  openGraph: {
    title: "Solyn Studio",
    description: "Светильники ручной работы · постеры · картины по вашему фото",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06061c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b0a30'/%3E%3Ctext x='32' y='44' font-family='Arial' font-size='40' font-weight='bold' fill='%2333e07d' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-navy-950 text-ink">
        <Providers>
          <AuthShell>
            <Nav />
            <main>{children}</main>
            <Footer />
            <FloatingConstructor />
            <FloatingContact />
          </AuthShell>
        </Providers>
      </body>
    </html>
  );
}
