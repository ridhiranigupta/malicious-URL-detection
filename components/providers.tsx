"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "!bg-slate-900/90 !text-slate-100 !border !border-cyan-500/40",
        }}
      />
    </SessionProvider>
  );
}
