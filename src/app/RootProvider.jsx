"use client";

import { ThemeProvider } from "@/components/Dashboard/theme-provider";
import AOSProvider from "./AOSProvider";

export default function RootProvider({ children }) {
  return (
    <ThemeProvider>
      <AOSProvider>{children}</AOSProvider>
    </ThemeProvider>
  );
}
