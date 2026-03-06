import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner"
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Library",
  description: "A high performance knowledge archive",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Toaster position="bottom-right" richColors />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}