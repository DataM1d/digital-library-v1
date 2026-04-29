// app/layout.tsx
import { Sidebar } from "@/components/navigation/sidebar";
import QueryProvider from "@/components/providers/QueryProvider";

//@ts-ignore
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] antialiased">
        <QueryProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
