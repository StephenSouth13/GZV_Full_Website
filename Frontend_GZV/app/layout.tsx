import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // 1. Import Montserrat
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/contexts/auth-context";
import ExtensionCleanup from "@/components/ExtensionCleanup";
import SiteShell from "@/components/SiteShell";
// 2. Khởi tạo font Montserrat
const montserrat = Montserrat({
  subsets: ["vietnamese"], // Hỗ trợ tiếng Việt
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Đủ các độ đậm nhạt
  display: "swap",
});
// Metadata này sẽ được tự động đưa vào thẻ <head>
// Nó cũng sẽ được sử dụng để tạo các thẻ OpenGraph và Twitter Card
export const metadata: Metadata = {
  title: {
    default: "GZV LTD - The Voice of GenZ",
    template: "%s | GZV LTD",
  },
  description: "GZV LTD - The Voice of GenZ. Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
  keywords: "gzv Center, đào tạo, coaching, mentoring, kỹ năng mềm, phát triển bản thân, life long learning, Viện Đào tạo Kỹ năng cho sinh viên và người đi làm",
  authors: [{ name: "gzv Center", url: "https://gzv.one" }],
  creator: "GZV LTD",
  publisher: "GZV LTD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://gzv.one"),
  openGraph: {
    title: "GZV LTD - The Voice of GenZ",
    description: "Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
    url: "https://www.gzv.one",
    siteName: "GZV LTD",
    images: [
      {
        url: "/og-image.jpg",
        width: 2000,
        height: 2000,
        alt: "GZV LTD - The Voice of GenZ",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GZV LTD - The Voice of GenZ",
    description: "Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
    images: ["/og-image.jpg"],
    creator: "@gzvcenter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo/favicon.ico",
  },
  manifest: "/logo/site.webmanifest",
  generator: "gzv-IT Department",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
     <body suppressHydrationWarning className={`${montserrat.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <ExtensionCleanup />
              <SiteShell>{children}</SiteShell>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
