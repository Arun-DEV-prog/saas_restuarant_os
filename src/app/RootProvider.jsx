"use client";

import { ThemeProvider } from "@/components/Dashboard/theme-provider";
import AOSProvider from "./AOSProvider";
import { Toaster } from "sonner";

export default function RootProvider({ children }) {
  return (
    <ThemeProvider>
      <AOSProvider>{children}</AOSProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
