import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";
import Providers from "@/components/providers/Providers"; 

import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Digital Archive | Knowledge Repository",
    template: "%s | Digital Archive"
  },
  description: "A high-performance archival system for digital artifacts and architectural discovery.",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-black selection:bg-white selection:text-black`}>
        <Providers>
          <Toaster 
            position="bottom-right" 
            theme="dark"
            toastOptions={{
              className: "bg-black border border-zinc-800 text-white font-mono text-[10px] uppercase tracking-widest rounded-none",
              style: {
                background: '#000000',
                border: '1px solid #18181b',
              }
            }}
            richColors 
          />
          
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            
            <main className="flex-1 pt-20">
              {children}
            </main>

            <div className="system-grid fixed inset-0 pointer-events-none z-[-1]" />
          </div>
        </Providers>
      </body>
    </html>
  );
}