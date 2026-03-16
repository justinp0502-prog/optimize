import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Optimize",
  description: "A calm life assistant for planning, meals, nudges, and reflection.",
  applicationName: "Optimize",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Optimize",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? "/";
  const session = await auth();
  const isPublicPath = currentPath === "/login" || currentPath === "/signup";

  if (!session?.user?.id && !isPublicPath) {
    redirect("/login");
  }

  if (session?.user?.id && isPublicPath) {
    redirect("/");
  }

  if (isPublicPath) {
    return (
      <html lang="en">
        <body>
          <PwaRegister />
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <AppShell currentPath={currentPath} userName={session?.user?.name ?? "Optimize user"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
