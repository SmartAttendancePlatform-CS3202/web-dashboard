import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "directX",
  description: "Advanced classroom attendance, live geofencing, and AI vision verification management platform for university lecturers.",
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingBubblesBackground } from "@/components/layout/FloatingBubblesBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FloatingBubblesBackground />
          <div className="relative z-0">
            <AuthProvider>{children}</AuthProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
