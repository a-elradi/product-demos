import React from "react";
import { Mail } from "lucide-react";
import { siInstagram, siWhatsapp } from "simple-icons";
import { BrandIcon } from "../ui/core";
import { C } from "../theme";

// Shot starts for every customer-service video (120 BPM grid, 28 s).
export const CS = { logo: 0, hook: 60, demo: 120, flow: 600, outro: 720, total: 840 };

export const OutlookIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: "#0F6CBD",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Mail size={size * 0.62} color="#fff" strokeWidth={2.2} />
  </div>
);

export const channelChips = [
  <>
    <BrandIcon icon={siWhatsapp} size={28} /> WhatsApp
  </>,
  <>
    <BrandIcon icon={siInstagram} size={28} /> Instagram
  </>,
  <>
    <OutlookIcon size={28} /> Email
  </>,
];

export const Product = {
  alaia: { img: "alaia.jpg", name: "Alaïa Le Click East West Bag", price: "KWD 803.190" },
  zmBlack: { img: "zm-black.jpg", name: "Zuhair Murad Shopping Bag, Black", price: "KWD 52.920" },
  zmNatural: { img: "zm-natural.jpg", name: "Zuhair Murad Shopping Bag, Natural", price: "KWD 52.920" },
  rhode: { img: "rhode.jpg", name: "Rhode Bubble Bag", price: "KWD 26.540" },
  miumiu: { img: "miumiu.jpg", name: "Miu Miu Leather Micro Trick", price: "KWD 97.190" },
};

export const ellipsis: React.CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const brandMaroon = C.maroon;
