import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadArabic } from "@remotion/google-fonts/IBMPlexSansArabic";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Same palette as the GLAM MODA ops dashboard.
export const C = {
  maroon: "#800000",
  maroonDeep: "#5C0000",
  maroon50: "#FBF4F4",
  maroon100: "#F2E2E2",
  maroon200: "#E4C6C6",
  ink: "#111111",
  ink2: "#4B4646",
  ink3: "#847C7C",
  line: "#E8E3E1",
  line2: "#F1EDEB",
  paper: "#F7F5F3",
  white: "#FFFFFF",
  gold: "#B8963E",
  good: "#2E6B3E",
  goodBg: "#E7F1E9",
  warn: "#8A6516",
  warnBg: "#FAF1DB",
  critBg: "#F9E9E9",
};

export const F = {
  display: loadMontserrat("normal", {
    weights: ["500", "600", "700", "800", "900"],
    subsets: ["latin"],
  }).fontFamily,
  ui: loadManrope("normal", {
    weights: ["400", "500", "600", "700", "800"],
    subsets: ["latin"],
  }).fontFamily,
  serif: loadCormorant("normal", {
    weights: ["500", "600", "700"],
    subsets: ["latin"],
  }).fontFamily,
  ar: loadArabic("normal", {
    weights: ["400", "500", "600", "700"],
    subsets: ["arabic", "latin"],
  }).fontFamily,
  mono: loadMono("normal", {
    weights: ["400", "500", "700"],
    subsets: ["latin"],
  }).fontFamily,
};

// 120 BPM at 30 fps: every cut lands on the music grid.
export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;
export const TR = 15; // transition length = one beat
