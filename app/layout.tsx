import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iobserver-web",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
