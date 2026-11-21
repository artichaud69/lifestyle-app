import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { getCurrentUser } from "@/server/auth/current";
import { db } from "@/server/db";

export const metadata: Metadata = {
  title: { default: "LIFE OS", template: "%s · LIFE OS" },
  description: "A private, AI-native personal operating system.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const settings = user ? await db.userSettings.findUnique({ where: { userId: user.id }, select: { theme: true } }) : null;
  const theme = settings?.theme === "DARK" ? "dark" : settings?.theme === "LIGHT" ? "light" : undefined;
  return (
    <html lang="en" data-theme={theme}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
