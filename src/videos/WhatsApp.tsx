import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { BookOpenCheck, Copy, ExternalLink, Reply, Send } from "lucide-react";
import { siClaude, siShopify, siWhatsapp } from "simple-icons";
import { C, F } from "../theme";
import { BrandIcon, Captions, Sfx } from "../ui/core";
import { ChatScreen, IPhone, Msg, Photo, PromoArt, WaButtons } from "../ui/phone";
import { Flow, Hook, LogoOpen, Outro, Stage } from "../scenes/common";
import { T, Timeline } from "../ui/timeline";
import { CS, Product, channelChips, ellipsis } from "./shared";

const ar: React.CSSProperties = { direction: "rtl", fontFamily: F.ar };

const TrackingCard: React.FC = () => (
  <div style={{ width: 300 }}>
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      <Photo src={Product.alaia.img} w={300} h={160} />
    </div>
    <div style={{ ...ar, padding: "10px 8px 2px", fontSize: 15.5, lineHeight: 1.65 }}>
      <div style={{ fontWeight: 700, fontSize: 17 }}>طلبك رقم 1052 في الطريق</div>
      <div>
        الحالة: <b>تم الشحن · DHL Express</b>
      </div>
      <div>تاريخ الطلب: 21 سبتمبر</div>
      <div>
        التوصيل المتوقع: <b>26 سبتمبر</b>
      </div>
      <div style={{ color: "#555" }}>Alaïa Le Click × 1</div>
      <div style={{ fontWeight: 700 }}>الإجمالي: 803.190 د.ك</div>
    </div>
  </div>
);

const CarouselCard: React.FC<{ p: { img: string; name: string; price: string } }> = ({ p }) => (
  <div
    style={{
      width: 200,
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 0.6px rgba(0,0,0,0.13)",
      flexShrink: 0,
    }}
  >
    <Photo src={p.img} w={200} h={190} />
    <div style={{ padding: "9px 11px 8px" }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, ...ellipsis }}>{p.name}</div>
      <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>{p.price}</div>
    </div>
    <div
      style={{
        ...ar,
        borderTop: "1px solid #eee",
        padding: "9px 0",
        textAlign: "center",
        color: "#00A884",
        fontWeight: 700,
        fontSize: 15,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
      }}
    >
      <ExternalLink size={15} /> عرض المنتج
    </div>
  </div>
);

const DiscountCard: React.FC = () => (
  <div style={{ width: 300 }}>
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      <PromoArt h={124} />
    </div>
    <div style={{ ...ar, padding: "10px 8px 4px", fontSize: 16, lineHeight: 1.6 }}>
      هدية منّا لك: خصم 10% على طلبك
      <div
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: `1.5px dashed ${C.maroon}`,
          borderRadius: 8,
          padding: "4px 12px",
          fontFamily: F.mono,
          fontWeight: 700,
          color: C.maroon,
          direction: "ltr",
        }}
      >
        CHAT10 <Copy size={15} />
      </div>
    </div>
  </div>
);

const msgs: Msg[] = [
  { at: 22, side: "me", text: "مساء الخير، وين وصل طلبي؟", rtl: true, time: "2:04 AM", h: 70 },
  {
    at: 72,
    side: "them",
    text: "مساء النور! لقيت طلبك من رقم جوالك، وهو الحين في الطريق:",
    rtl: true,
    time: "2:04 AM",
    h: 90,
  },
  {
    at: 100,
    side: "them",
    typing: false,
    content: <TrackingCard />,
    time: "2:04 AM",
    below: <WaButtons rtl labels={[{ icon: <ExternalLink size={16} />, text: "تتبّع الشحنة" }]} />,
    h: 420,
  },
  { at: 178, side: "me", text: "عندكم شنط سوداء؟", rtl: true, time: "2:05 AM", h: 70 },
  { at: 218, side: "them", text: "أكيد! هذي من أحلى القطع عندنا:", rtl: true, time: "2:05 AM", h: 70 },
  {
    at: 240,
    side: "them",
    typing: false,
    bare: true,
    h: 320,
    content: (
      <div style={{ display: "flex", gap: 8, width: 700 }}>
        <CarouselCard p={Product.alaia} />
        <CarouselCard p={Product.zmBlack} />
        <CarouselCard p={Product.zmNatural} />
      </div>
    ),
  },
  {
    at: 302,
    side: "them",
    content: <DiscountCard />,
    time: "2:05 AM",
    below: <WaButtons rtl labels={[{ icon: <ExternalLink size={16} />, text: "تطبيق الخصم" }]} />,
    h: 330,
  },
  {
    at: 366,
    side: "them",
    text: "كيف كانت تجربتك معنا اليوم؟",
    rtl: true,
    time: "2:06 AM",
    h: 230,
    below: (
      <WaButtons
        rtl
        pressed={0}
        pressAt={414}
        labels={[
          { icon: <Reply size={16} />, text: "ممتازة" },
          { icon: <Reply size={16} />, text: "جيدة" },
          { icon: <Reply size={16} />, text: "تحتاج تحسين" },
        ]}
      />
    ),
  },
  { at: 422, side: "me", text: "ممتازة", rtl: true, time: "2:06 AM", h: 60 },
  { at: 456, side: "them", text: "شكراً لك! يسعدنا نخدمك دائماً", rtl: true, time: "2:06 AM", h: 70 },
];

const Demo: React.FC = () => (
  <>
    <Stage
      device={
        <IPhone statusBg="#F7F7F7">
          <ChatScreen skin="whatsapp" title="GLAM MODA" subtitle="Business account" msgs={msgs} />
        </IPhone>
      }
      captions={
        <Captions
          items={[
            { from: 18, eyebrow: "01 · Instant replies", text: "Answers every customer in seconds, even at 2 AM", hl: ["seconds", "2", "AM"] },
            { from: 96, eyebrow: "02 · Order tracking", text: "Finds the order and sends live tracking", hl: ["live", "tracking"] },
            { from: 206, eyebrow: "03 · Product cards", text: "Recommends real products from Shopify", hl: ["real", "products"] },
            { from: 292, eyebrow: "04 · Discounts", text: "Sends the CHAT10 discount, ready to apply", hl: ["CHAT10"] },
            { from: 360, eyebrow: "05 · Feedback", text: "Asks every customer to rate the chat", hl: ["rate"] },
          ]}
        />
      }
    />
    {msgs.map((m) => (
      <Sfx key={m.at} at={m.at} name={m.side === "me" ? "send" : "pop"} volume={0.5} />
    ))}
    <Sfx at={414} name="click" volume={0.6} />
  </>
);

export const WhatsAppVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.maroon }}>
    <Audio src={staticFile("audio/music-cs.wav")} volume={0.55} />
    <Timeline
      total={CS.total}
      shots={[
        { start: CS.logo, node: <LogoOpen label="WhatsApp customer care" icon={<BrandIcon icon={siWhatsapp} size={30} color="#fff" />} /> },
        {
          start: CS.hook,
          enter: T.up,
          node: (
            <Hook
              lines={[
                { text: "2:04 AM.", at: 6, size: 200, color: C.maroon },
                { text: "A customer has a question.", at: 14, size: 92 },
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
              title="One message in. The right answer out."
              nodes={[
                { icon: <BrandIcon icon={siWhatsapp} size={72} />, label: "Customer sends a WhatsApp" },
                { icon: <BrandIcon icon={siClaude} size={72} />, label: "Claude AI agent reads it" },
                { icon: <BrandIcon icon={siShopify} size={72} />, label: "Checks Shopify orders & products" },
                { icon: <BookOpenCheck size={66} color={C.maroon} />, label: "Uses team-approved answers" },
                { icon: <Send size={60} color={C.maroon} />, label: "Replies with cards & buttons" },
              ]}
              chips={["Your team can take over from Telegram", "Unanswered questions go to the team at 21:00"]}
            />
          ),
        },
        {
          start: CS.outro,
          enter: T.up,
          node: <Outro headline="Customer care that never sleeps." hl={["never", "sleeps"]} chips={channelChips} />,
        },
      ]}
    />
  </AbsoluteFill>
);
