import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Optimize",
  description: "A calm life assistant for planning, meals, nudges, and reflection.",
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
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <AppShell currentPath={currentPath} userName={session?.user?.name ?? "Optimize user"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
