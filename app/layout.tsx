import type { Metadata } from "next";
import "./globals.css";
import { montserrat } from "./fonts";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kdm",
  description: "A platform for managing Umrah bookings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" data-arp="">
      <SessionProvider session={session}>
        <body className={montserrat.className}>
          <ModalProvider />
          <Toaster richColors />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
