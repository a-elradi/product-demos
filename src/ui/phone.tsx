import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import {
  BadgeCheck,
  BatteryFull,
  Camera,
  CheckCheck,
  ChevronLeft,
  Image as ImageIcon,
  Mic,
  Phone as PhoneIcon,
  Plus,
  Search,
  Signal,
  Smile,
  Video,
  Wifi,
} from "lucide-react";
import { C, F } from "../theme";
import { clamp, useSpr } from "./core";
import { interpolate } from "remotion";

export type Skin = "whatsapp" | "instagram" | "telegram";

export type Msg = {
  at: number;
  side: "me" | "them";
  text?: string;
  rtl?: boolean;
  time?: string;
  content?: React.ReactNode; // rich block inside the bubble (after text)
  bare?: boolean; // render content without a bubble (carousels, cards)
  below?: React.ReactNode; // buttons attached under the bubble
  typing?: boolean; // default: true for "them"
  h?: number; // rough height for the smooth grow-in
  bold?: string; // bold first line (Telegram reports)
};

export const Logo: React.FC<{ size: number; radius?: string }> = ({ size, radius = "50%" }) => (
  <Img
    src={staticFile("logo.jpg")}
    style={{ width: size, height: size, borderRadius: radius, display: "block", flexShrink: 0 }}
  />
);

// ---------- device ----------

export const IPhone: React.FC<{
  children: React.ReactNode;
  time?: string;
  dark?: boolean;
  statusBg?: string;
}> = ({ children, time = "2:04", dark = false, statusBg = "transparent" }) => {
  const fg = dark ? "#fff" : "#000";
  return (
    <div
      style={{
        width: 430,
        height: 900,
        borderRadius: 70,
        background: "#0B0B0B",
        padding: 13,
        boxShadow:
          "0 0 0 2px #2a2a2a, 0 0 0 5px #151515, 0 60px 120px -30px rgba(40,0,0,0.55), 0 30px 60px -30px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 57,
          overflow: "hidden",
          position: "relative",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          fontFamily: F.ui,
        }}
      >
        <div
          style={{
            height: 54,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 34px 0 42px",
            background: statusBg,
            color: fg,
            fontWeight: 700,
            fontSize: 17,
            position: "relative",
            zIndex: 2,
          }}
        >
          <span>{time}</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Signal size={17} strokeWidth={2.6} />
            <Wifi size={17} strokeWidth={2.6} />
            <BatteryFull size={24} strokeWidth={2} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            transform: "translateX(-50%)",
            width: 122,
            height: 35,
            borderRadius: 20,
            background: "#000",
            zIndex: 3,
          }}
        />
        {children}
      </div>
    </div>
  );
};

// ---------- skins ----------

const SK = {
  whatsapp: {
    chatBg: "#EFEAE2",
    me: "#D9FDD3",
    them: "#FFFFFF",
    meText: "#111",
    themText: "#111",
    radius: 16,
    accent: "#00A884",
  },
  instagram: {
    chatBg: "#FFFFFF",
    me: "linear-gradient(160deg,#A033FF 0%,#6A4BFF 55%,#3D7BFF 100%)",
    them: "#EFEFEF",
    meText: "#fff",
    themText: "#111",
    radius: 22,
    accent: "#0095F6",
  },
  telegram: {
    chatBg: "linear-gradient(165deg,#CFE3B8 0%,#A9CF9C 45%,#8FC1AE 100%)",
    me: "#E1FFC7",
    them: "#FFFFFF",
    meText: "#111",
    themText: "#111",
    radius: 18,
    accent: "#3A8AD6",
  },
};

export const skinAccent = (s: Skin) => SK[s].accent;

const Header: React.FC<{ skin: Skin; title: string; subtitle: string; avatar?: React.ReactNode }> = ({
  skin,
  title,
  subtitle,
  avatar,
}) => {
  const accent = SK[skin].accent;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px 12px 8px",
        background: skin === "whatsapp" ? "#F7F7F7" : "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      <ChevronLeft size={32} color={skin === "instagram" ? "#111" : accent} strokeWidth={2.4} />
      {avatar ?? <Logo size={42} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700, fontSize: 18, color: "#111" }}>
          {title}
          {skin !== "telegram" ? (
            <BadgeCheck size={18} color="#fff" fill={skin === "whatsapp" ? "#25D366" : "#0095F6"} />
          ) : null}
        </div>
        <div style={{ fontSize: 13.5, color: "#777", marginTop: 1 }}>{subtitle}</div>
      </div>
      {skin === "telegram" ? (
        <Search size={24} color={accent} />
      ) : (
        <div style={{ display: "flex", gap: 20, color: skin === "instagram" ? "#111" : accent }}>
          <PhoneIcon size={23} />
          <Video size={26} />
        </div>
      )}
    </div>
  );
};

const InputBar: React.FC<{ skin: Skin; draft?: string }> = ({ skin, draft }) => {
  if (skin === "instagram") {
    return (
      <div style={{ padding: "8px 12px 30px", background: "#fff" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#EFEFEF",
            borderRadius: 24,
            padding: "7px 14px 7px 7px",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#3D7BFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Camera size={19} color="#fff" />
          </div>
          <div style={{ flex: 1, color: draft ? "#111" : "#8e8e8e", fontSize: 16 }}>{draft || "Message..."}</div>
          <Mic size={22} color="#111" />
          <ImageIcon size={22} color="#111" />
          <Smile size={22} color="#111" />
        </div>
      </div>
    );
  }
  const accent = SK[skin].accent;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px 30px",
        background: "#F7F7F7",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Plus size={26} color={accent} />
      <div
        style={{
          flex: 1,
          height: 36,
          borderRadius: 18,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          color: draft ? "#111" : "#999",
          fontSize: 16,
          fontFamily: draft && draft.startsWith("/") ? F.mono : F.ui,
        }}
      >
        {draft || (skin === "telegram" ? "Message" : "")}
      </div>
      {skin === "whatsapp" ? <Camera size={24} color={accent} /> : null}
      <Mic size={24} color={accent} />
    </div>
  );
};

const Typing: React.FC<{ bg: string }> = ({ bg }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ background: bg, borderRadius: 18, padding: "13px 16px", display: "flex", gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#8a8a8a",
            opacity: 0.35 + 0.65 * Math.abs(Math.sin((f + i * 5) / 6)),
          }}
        />
      ))}
    </div>
  );
};

// One message that grows in smoothly so older messages glide upward.
const MsgRow: React.FC<{ m: Msg; skin: Skin }> = ({ m, skin }) => {
  const p = useSpr(m.at, 200, 16);
  const s = SK[skin];
  const me = m.side === "me";
  const h = m.h ?? 90;
  const bubble = !m.bare ? (
    <div
      style={{
        background: me ? s.me : s.them,
        color: me ? s.meText : s.themText,
        borderRadius: s.radius,
        borderTopRightRadius: me && skin !== "instagram" ? 5 : s.radius,
        borderTopLeftRadius: !me && skin !== "instagram" ? 5 : s.radius,
        padding: m.text || m.bold ? "8px 12px 7px" : 4,
        fontSize: 17,
        lineHeight: 1.4,
        boxShadow: skin === "instagram" ? "none" : "0 1px 0.6px rgba(0,0,0,0.13)",
        direction: m.rtl ? "rtl" : "ltr",
        fontFamily: m.rtl ? F.ar : F.ui,
        overflow: "hidden",
        whiteSpace: "pre-line",
      }}
    >
      {m.bold ? <div style={{ fontWeight: 800 }}>{m.bold}</div> : null}
      {m.text}
      {m.content ? <div style={{ marginTop: m.text || m.bold ? 8 : 0 }}>{m.content}</div> : null}
      {m.time && skin !== "instagram" ? (
        <div
          style={{
            fontSize: 11.5,
            color: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            direction: "ltr",
            marginTop: 2,
            fontFamily: F.ui,
            paddingRight: m.text ? 0 : 6,
          }}
        >
          {m.time}
          {me ? <CheckCheck size={15} color="#53BDEB" strokeWidth={2.6} /> : null}
        </div>
      ) : null}
    </div>
  ) : (
    m.content
  );
  return (
    <div
      style={{
        maxHeight: p * h * 1.6 + (p >= 0.999 ? 2000 : 0),
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px) scale(${0.94 + p * 0.06})`,
        transformOrigin: me ? "bottom right" : "bottom left",
        display: "flex",
        flexDirection: "column",
        alignItems: me ? "flex-end" : "flex-start",
        overflow: m.bare ? "visible" : "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: m.bare ? "none" : "84%" }}>{bubble}</div>
      {m.below ? <div style={{ width: m.bare ? undefined : "84%", maxWidth: 330 }}>{m.below}</div> : null}
    </div>
  );
};

export const ChatScreen: React.FC<{
  skin: Skin;
  title: string;
  subtitle: string;
  msgs: Msg[];
  avatar?: React.ReactNode;
  draft?: string;
  offset?: number; // extra upward scroll in px
}> = ({ skin, title, subtitle, msgs, avatar, draft, offset = 0 }) => {
  const f = useCurrentFrame();
  const s = SK[skin];
  const typingFor = msgs.find((m) => (m.typing ?? m.side === "them") && f >= m.at - 24 && f < m.at);
  const tp = typingFor ? interpolate(f, [typingFor.at - 24, typingFor.at - 18], [0, 1], clamp) : 0;
  return (
    <>
      <Header skin={skin} title={title} subtitle={subtitle} avatar={avatar} />
      <div
        style={{
          flex: 1,
          background: s.chatBg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 8,
          padding: "12px 12px 10px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transform: `translateY(${-offset}px)`,
          }}
        >
          {msgs
            .filter((m) => f >= m.at)
            .map((m, i) => (
              <MsgRow key={i} m={m} skin={skin} />
            ))}
          {typingFor ? (
            <div
              style={{
                alignSelf: typingFor.side === "me" ? "flex-end" : "flex-start",
                opacity: tp,
                maxHeight: tp * 60,
              }}
            >
              <Typing bg={typingFor.side === "me" ? "#D9FDD3" : s.them} />
            </div>
          ) : null}
        </div>
      </div>
      <InputBar skin={skin} draft={draft} />
    </>
  );
};

// ---------- shared rich blocks ----------

export const Photo: React.FC<{ src: string; w: number | string; h: number; radius?: number }> = ({
  src,
  w,
  h,
  radius = 0,
}) => (
  <Img
    src={staticFile(`products/${src}`)}
    style={{
      width: w,
      height: h,
      objectFit: "cover",
      objectPosition: "center 55%",
      display: "block",
      borderRadius: radius,
      background: "#f4f4f4",
    }}
  />
);

// WhatsApp-style reply / URL buttons under an interactive message.
export const WaButtons: React.FC<{
  labels: { icon?: React.ReactNode; text: string }[];
  rtl?: boolean;
  pressed?: number; // index that flashes when tapped
  pressAt?: number;
}> = ({ labels, rtl, pressed, pressAt = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 3 }}>
      {labels.map((l, i) => {
        const flash = pressed === i && f >= pressAt && f < pressAt + 10;
        return (
          <div
            key={i}
            style={{
              background: flash ? "#DDF3EC" : "#fff",
              borderRadius: 12,
              padding: "10px 0",
              textAlign: "center",
              color: "#00A884",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              direction: rtl ? "rtl" : "ltr",
              fontFamily: rtl ? F.ar : F.ui,
              boxShadow: "0 1px 0.6px rgba(0,0,0,0.13)",
            }}
          >
            {l.icon}
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

// Telegram inline keyboard.
export const TgButtons: React.FC<{ labels: string[]; pressed?: number; pressAt?: number }> = ({
  labels,
  pressed,
  pressAt = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
      {labels.map((l, i) => {
        const flash = pressed === i && f >= pressAt && f < pressAt + 10;
        return (
          <div
            key={l}
            style={{
              flex: 1,
              background: flash ? "rgba(40,80,40,0.55)" : "rgba(52,94,60,0.32)",
              color: "#fff",
              borderRadius: 10,
              padding: "9px 6px",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

// Maroon promo "image" used as the discount card header.
export const PromoArt: React.FC<{ h?: number; w?: number | string }> = ({ h = 130, w = "100%" }) => (
  <div
    style={{
      width: w,
      height: h,
      background: C.maroon,
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        right: -40,
        bottom: -60,
        width: 170,
        height: 170,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    />
    <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: h * 0.34, letterSpacing: "0.02em", lineHeight: 1 }}>
      10% OFF
    </div>
    <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: h * 0.11, letterSpacing: "0.5em", paddingLeft: "0.5em" }}>
      CHAT10
    </div>
  </div>
);
