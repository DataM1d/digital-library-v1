import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./global.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} ${serif.variable} bg-[#08080a] text-[#f8f9fa] antialiased min-h-screen`}
      >
        <QueryProvider>
          <AuthProvider>
            <main className="w-full min-h-screen pt-0">{children}</main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
