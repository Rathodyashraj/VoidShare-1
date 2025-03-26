import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { keywordsForMetaData } from "@/utils/constants";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FileDrop",
  description:
    "FileDrop: Swift P2P file sharing and real-time chat. Experience seamless, secure data exchange with our WebRTC-powered Next.js app. Join us for instant messaging and efficient file transfer in a modern, user-friendly environment.",
  authors: [
    {
      name: "Yug Bhanushali",
      url: "https://github.com/YugBhanushali",
    },
  ],
  keywords: keywordsForMetaData,
  icons: {
    icon: "./fastdroplight.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
