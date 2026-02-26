import { Providers } from "@/components/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata = {
  title: {
    default: "Deal Management System",
    template: "%s | Deal Management System",
  },
  description: "Manage your deals and organizations",
};
