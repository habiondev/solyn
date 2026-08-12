"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0b0a30",
              color: "#eef2ff",
              border: "1px solid rgba(120,140,255,.14)",
              borderRadius: 12,
              fontSize: 14,
            },
            success: { iconTheme: { primary: "#33e07d", secondary: "#04331c" } },
          }}
        />
      </CartProvider>
    </SessionProvider>
  );
}
