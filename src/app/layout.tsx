import type { Metadata } from "next";
import { AppToasts } from "@/components/toast/AppToasts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SV Live | Super Admin Panel",
  description: "SV Live streaming platform super admin panel",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full antialiased"
        style={{
          fontFamily:
            '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        <AppToasts>{children}</AppToasts>
      </body>
    </html>
  );
}
