import { AuthProvider } from "@/context/AuthContext";
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}