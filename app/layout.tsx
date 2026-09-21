import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fonts } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Control Health — Measure what matters.",
  description:
    "Build a more complete picture of your health with personalized testing.",
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={cn(fonts, "scroll-smooth")} lang="en">
    <body className="flex w-full flex-col items-center overflow-x-hidden bg-background font-sans text-foreground antialiased">
      {children}
    </body>
  </html>
);

export default RootLayout;
