import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { HeroModule } from "@/components/layout/hero/HeroModule";
import { Toaster } from "sonner";
import Providers from "@/components/providers/Providers";

//@ts-ignore
import "./global.css"; // Ensure this matches your filename

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Matched to your global.css
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono", // Matched to your global.css
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Digital Archive | System Core",
    template: "%s | Archive",
  },
  description: "High-fidelity archival system for digital artifacts.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Toaster
            position="bottom-right"
            theme="light"
            toastOptions={{
              className: "industrial-card !p-4 !rounded-none !border-zinc-900 !font-mono !text-[9px] !uppercase !tracking-widest",
            }}
            richColors
          />

          <div className="flex min-h-screen">
            {/* Sidebar - Persistent Navigation */}
            <aside className="w-64 shrink-0 border-r border-zinc-900 bg-white">
              <Sidebar />
            </aside>

            {/* Main Interface Area */}
            <main className="flex-1 min-w-0 bg-transparent relative">
              <HeroModule 
                categories={["WebDev", "History", "MachineLearning", "Photography", "Documents", "AudioLogs"]} 
              />

              <div className="max-w-[100rem] mx-auto p-6 md:p-10">
                {children}
              </div>

              {/* Technical Footer - Anchored to the main content area */}
              <footer className="p-6 border-t border-zinc-200 mt-20">
                <span className="mono-label !text-zinc-400">
                  [SYSTEM_VER: 04.13.26] // [NODE: STOCKHOLM_HQ] // [TRACE: ARCHIVE_V1]
                </span>
              </footer>
            </main>

            {/* Background Architecture */}
            <div className="system-grid fixed inset-0 pointer-events-none z-[-1]" />
          </div>
        </Providers>
      </body>
    </html>
  );
}