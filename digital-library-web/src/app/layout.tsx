// app/layout.tsx
import { Sidebar } from "@/components/navigation/sidebar";

//@ts-ignore
import './global.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050505] antialiased">
        <div className="flex">
          <Sidebar />

          <main className="flex-1 ml-64 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}