import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/common/JsonLd";
import SmoothScroll from "@/components/common/SmoothScroll";
import { organizationJsonLd, seo, siteUrl, siteVerification, websiteJsonLd } from "@/helper/seo";
import { appInfo } from "./(view)/(pview)/home/content/homeContent";

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide defaults. Public pages add their own title, description and canonical URL with
// pageMetadata (helper/seo.ts); the share image is app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.description,
  applicationName: appInfo.name,
  keywords: seo.keywords,
  authors: [{ name: appInfo.name, url: siteUrl() }],
  creator: appInfo.name,
  publisher: appInfo.name,
  category: "technology",
  openGraph: {
    type: "website",
    siteName: appInfo.name,
    locale: seo.locale,
    title: seo.defaultTitle,
    description: seo.description,
  },
  twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { email: false, telephone: false, address: false },
  verification: siteVerification(),
};

export const viewport: Viewport = {
  themeColor: seo.themeColor,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivoNarrow.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
