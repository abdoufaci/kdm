import type { Metadata } from "next";
import "./globals.css";
import { tajawal } from "./fonts";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Omratec",
  description: "A platform for managing Umrah bookings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="ar" data-arp="">
      <SessionProvider session={session}>
        <body className={tajawal.className}>
          <ModalProvider />
          <Toaster richColors />
          <NextTopLoader
            color="#D45847"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={true}
            easing="ease"
            speed={200}
            shadow="0 0 10px #D45847,0 0 5px #D45847"
          />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
