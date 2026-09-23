import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

// Playfair is the display face for the marketing site; Geist carries body,
// UI and labels.
const playfair = Playfair_Display({
  // Regular only. Heavier cuts read too thick at display sizes.
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const fonts = cn(
  GeistSans.variable,
  GeistMono.variable,
  playfair.variable,
  "touch-manipulation font-sans antialiased"
);
