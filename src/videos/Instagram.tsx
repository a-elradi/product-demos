import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GalleryHorizontal, Send } from "lucide-react";
import { siClaude, siInstagram, siShopify } from "simple-icons";
import { C, F } from "../theme";
import { BrandIcon, Captions, Sfx } from "../ui/core";
import { ChatScreen, IPhone, Msg, Photo, PromoArt } from "../ui/phone";
import { Flow, Hook, LogoOpen, Outro, Stage } from "../scenes/common";
import { T, Timeline } from "../ui/timeline";
import { CS, Product, channelChips, ellipsis } from "./shared";

// Instagram "generic template" card.
const IgCard: React.FC<{
  media: React.ReactNode;
  title: string;
  subtitle: string;
  button: string;
  width?: number;
}> = ({ media, title, subtitle, button, width = 230 }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #DBDBDB",
      borderRadius: 18,
      overflow: "hidden",
      flexShrink: 0,
      fontFamily: F.ui,
    }}
  >
    {media}
    <div style={{ padding: "10px 13px 9px" }}>
      <div style={{ fontWeight: 700, fontSize: 15, ...ellipsis }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#737373", marginTop: 2, whiteSpace: "pre-line", lineHeight: 1.35 }}>
        {subtitle}
      </div>
    </div>
    <div
      style={{
        borderTop: "1px solid #DBDBDB",
        padding: "10px 0",
        textAlign: "center",
        color: "#0095F6",
        fontWeight: 700,
        fontSize: 15,
      }}
    >
      {button}
    </div>
  </div>
);

const msgs: Msg[] = [
  { at: 22, side: "me", text: "Hi! Do you have any black bags?", h: 60 },
  { at: 72, side: "them", text: "Hi there! Yes, these are our favourites right now:", h: 80 },
  {
    at: 96,
    side: "them",
    typing: false,
    bare: true,
    h: 340,
    content: (
      <div style={{ display: "flex", gap: 8, width: 720 }}>
        {[Product.alaia, Product.zmBlack, Product.zmNatural].map((p) => (
          <IgCard key={p.img} media={<Photo src={p.img} w={230} h={200} />} title={p.name} subtitle={p.price} button="View product" />
        ))}
      </div>
    ),
  },
  { at: 178, side: "me", text: "Where's my order #1052?", h: 60 },
  { at: 218, side: "them", text: "It's on its way with DHL Express, arriving 26 Sep:", h: 80 },
  {
    at: 240,
    side: "them",
    typing: false,
    bare: true,
    h: 340,
    content: (
      <IgCard
        width={260}
        media={<Photo src={Product.alaia.img} w={260} h={170} />}
        title="Order #1052 · Shipped"
        subtitle={"DHL Express · arriving 26 Sep\nAlaïa Le Click × 1 · KWD 803.190"}
        button="Track shipment"
      />
    ),
  },
  { at: 312, side: "me", text: "Any discount for me?", h: 60 },
  {
    at: 350,
    side: "them",
    bare: true,
    h: 300,
    content: (
      <IgCard
        width={260}
        media={<PromoArt h={130} />}
        title="A gift for you: 10% off"
        subtitle="Use code CHAT10 at checkout"
        button="Apply discount"
      />
    ),
  },
  { at: 420, side: "me", text: "Perfect, thank you!", h: 60 },
  { at: 454, side: "them", text: "Anytime! Our team is here if you need anything.", h: 80 },
];

const Demo: React.FC = () => (
  <>
    <Stage
      device={
        <IPhone>
          <ChatScreen skin="instagram" title="GLAM MODA" subtitle="glammoda" msgs={msgs} />
        </IPhone>
      }
      captions={
        <Captions
          items={[
            { from: 18, eyebrow: "01 · All 4 accounts", text: "Every DM answered in seconds, on every account", hl: ["seconds"] },
            { from: 96, eyebrow: "02 · Carousels", text: "Swipeable product cards with real photos", hl: ["real", "photos"] },
            { from: 212, eyebrow: "03 · Order tracking", text: "Order status and tracking, right in the DM", hl: ["tracking"] },
            { from: 345, eyebrow: "04 · Discounts", text: "A discount that applies in one tap", hl: ["one", "tap"] },
            { from: 415, eyebrow: "05 · Human backup", text: "Your team can step in anytime", hl: ["anytime"] },
          ]}
        />
      }
    />
    {msgs.map((m) => (
      <Sfx key={m.at} at={m.at} name={m.side === "me" ? "send" : "pop"} volume={0.5} />
    ))}
  </>
);

export const InstagramVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.maroon }}>
    <Audio src={staticFile("audio/music-cs.wav")} volume={0.55} />
    <Timeline
      total={CS.total}
      shots={[
        { start: CS.logo, node: <LogoOpen label="Instagram DM care" icon={<BrandIcon icon={siInstagram} size={30} color="#fff" />} /> },
        {
          start: CS.hook,
          enter: T.up,
          node: (
            <Hook
              lines={[
                { text: "Every DM.", at: 6, size: 190, color: C.maroon },
                { text: "Every account. Answered.", at: 14, size: 92 },
              ]}
            />
          ),
        },
        { start: CS.demo, enter: T.left, node: <Demo /> },
        {
          start: CS.flow,
          enter: T.wipeL,
          node: (
            <Flow
              title="From DM to answer, without waiting."
              nodes={[
                { icon: <BrandIcon icon={siInstagram} size={72} />, label: "A DM arrives on any of 4 accounts" },
                { icon: <BrandIcon icon={siClaude} size={72} />, label: "Claude AI agent reads it" },
                { icon: <BrandIcon icon={siShopify} size={72} />, label: "Checks Shopify orders & products" },
                { icon: <GalleryHorizontal size={64} color={C.maroon} />, label: "Builds a photo carousel" },
                { icon: <Send size={60} color={C.maroon} />, label: "Replies in the DM" },
              ]}
              chips={["Take over anytime with /own in Telegram", "Team alerted when a chat needs a person"]}
            />
          ),
        },
        {
          start: CS.outro,
          enter: T.up,
          node: <Outro headline="Every DM, answered in seconds." hl={["seconds"]} chips={channelChips} />,
        },
      ]}
    />
  </AbsoluteFill>
);
