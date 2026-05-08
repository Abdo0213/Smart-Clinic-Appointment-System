import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/app/providers/query-provider";
import { RefineProvider } from "@/app/providers/refine-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Clinic",
  description: "Smart Clinic Appointment System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <RefineProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </RefineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
