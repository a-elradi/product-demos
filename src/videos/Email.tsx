import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Bell,
  Calendar,
  CircleCheck,
  LayoutTemplate,
  Mail,
  Menu,
  Reply,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { siClaude, siShopify } from "simple-icons";
import { C, F } from "../theme";
import { BrandIcon, Captions, Sfx, TypingSfx, clamp, ease, typed, useSpr } from "../ui/core";
import { Logo, Photo } from "../ui/phone";
import { Flow, Hook, LogoOpen, Outro, Paper, Rings } from "../scenes/common";
import { T, Timeline } from "../ui/timeline";
import { CS, OutlookIcon, Product, channelChips, ellipsis } from "./shared";
import { Wordmark } from "../ui/core";

const BLUE = "#0F6CBD";

const inbox = [
  { from: "Noor K.", subj: "Exchange to size M", prev: "Hello, can I exchange my dress for…", when: "Yesterday", replied: true },
  { from: "Mona H.", subj: "Gift wrapping", prev: "Do you offer gift wrapping for…", when: "Yesterday", replied: true },
  { from: "Dana S.", subj: "Thank you!", prev: "The bag arrived today and it's…", when: "Mon", replied: true },
  { from: "Layla M.", subj: "Order received", prev: "Just wanted to say the order…", when: "Mon", replied: true },
  { from: "Hessa A.", subj: "Size guide", prev: "Which size should I pick for…", when: "Sun", replied: true },
];

const BODY =
  "Dear Sara,\nThank you for reaching out! Your order is on its way with DHL Express and should arrive on 26 September. Here are the details:";

const Avatar: React.FC<{ text: string; bg?: string }> = ({ text, bg = "#C7B9E8" }) => (
  <div
    style={{
      width: 38,
      height: 38,
      borderRadius: "50%",
      background: bg,
      color: "#222",
      fontWeight: 700,
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {text}
  </div>
);

const MailWindow: React.FC = () => {
  const f = useCurrentFrame();
  const newIn = useSpr(22, 200, 16);
  const scroll = interpolate(f, [232, 268, 306, 330], [0, -200, -200, -262], clamp);
  const writing = f >= 62 && f < 100;
  const toast = useSpr(380, 18);
  return (
    <div
      style={{
        width: 1180,
        height: 800,
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 60px 120px -30px rgba(40,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        fontFamily: F.ui,
        color: "#1b1b1b",
        position: "relative",
      }}
    >
      {/* title bar */}
      <div style={{ height: 50, background: BLUE, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", color: "#fff", flexShrink: 0 }}>
        <Menu size={20} />
        <div style={{ fontWeight: 700, fontSize: 18, width: 250 }}>Outlook</div>
        <div
          style={{
            flex: 1,
            maxWidth: 460,
            height: 32,
            borderRadius: 6,
            background: "rgba(255,255,255,0.92)",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            fontSize: 14,
          }}
        >
          <Search size={16} /> Search
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
          <Bell size={19} />
          <Settings size={19} />
          <Logo size={30} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* app rail */}
        <div style={{ width: 60, background: "#F3F3F3", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 20, color: "#555" }}>
          <Mail size={22} color={BLUE} />
          <Calendar size={22} />
          <Users size={22} />
        </div>
        {/* message list */}
        <div style={{ width: 320, borderRight: "1px solid #E6E6E6", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 10px", fontWeight: 700, fontSize: 19 }}>Inbox</div>
          <div style={{ display: "flex", gap: 20, padding: "0 18px 10px", fontSize: 14, borderBottom: "1px solid #eee" }}>
            <span style={{ fontWeight: 700, borderBottom: `2px solid ${BLUE}`, paddingBottom: 6 }}>Focused</span>
            <span style={{ color: "#777" }}>Other</span>
          </div>
          <div style={{ maxHeight: newIn * 110, overflow: "hidden", opacity: newIn }}>
            <div
              style={{
                padding: "14px 18px 14px 14px",
                borderLeft: `4px solid ${BLUE}`,
                background: "#EBF3FC",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800 }}>
                Sara A. <span style={{ fontSize: 13, color: BLUE }}>2:04 AM</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: BLUE, marginTop: 2 }}>Where is my order #1052?</div>
              <div style={{ fontSize: 13.5, color: "#666", marginTop: 2, ...ellipsis }}>Hi, I ordered the Alaïa bag last week…</div>
            </div>
          </div>
          {inbox.map((m) => (
            <div key={m.from} style={{ padding: "14px 18px", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {m.replied ? <Reply size={14} color="#888" /> : null}
                  {m.from}
                </span>
                <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{m.when}</span>
              </div>
              <div style={{ fontSize: 14.5, marginTop: 2 }}>{m.subj}</div>
              <div style={{ fontSize: 13.5, color: "#777", marginTop: 2, ...ellipsis }}>{m.prev}</div>
            </div>
          ))}
        </div>
        {/* reading pane */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "#FAFAFA" }}>
          {f >= 26 ? (
            <div style={{ padding: "22px 28px", transform: `translateY(${scroll}px)`, opacity: ease(f, 26, 36) }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Where is my order #1052?</div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #eee", padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar text="SA" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Sara A.</div>
                    <div style={{ fontSize: 13, color: "#777" }}>To: GLAM MODA Customer Care · 2:04 AM</div>
                  </div>
                </div>
                <div style={{ fontSize: 15.5, marginTop: 12, lineHeight: 1.55 }}>
                  Hi, I ordered the Alaïa bag last week. Where is my order #1052? Thanks, Sara
                </div>
              </div>
              {writing ? (
                <div
                  style={{
                    marginTop: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: C.maroon50,
                    color: C.maroon,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  <Sparkles size={18} style={{ opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 5)) }} />
                  AI agent is writing a reply…
                </div>
              ) : null}
              {f >= 100 ? (
                <div
                  style={{
                    marginTop: 16,
                    background: "#fff",
                    borderRadius: 10,
                    border: `1px solid ${C.maroon200}`,
                    padding: "16px 18px",
                    opacity: ease(f, 100, 108),
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Logo size={38} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>GLAM MODA Customer Care</div>
                      <div style={{ fontSize: 13, color: "#777" }}>To: Sara A. · 2:04 AM</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15.5, marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-line", minHeight: 76 }}>
                    {typed(BODY, f, 104, 2.6)}
                  </div>
                  {f >= 170 ? (
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        border: "1px solid #EDE6E3",
                        borderRadius: 12,
                        overflow: "hidden",
                        opacity: ease(f, 170, 180),
                        transform: `translateY(${(1 - ease(f, 170, 182)) * 16}px)`,
                        background: "#fff",
                      }}
                    >
                      <Photo src={Product.alaia.img} w={150} h={170} />
                      <div style={{ padding: "14px 18px", fontSize: 14.5, lineHeight: 1.6, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <b style={{ fontSize: 16 }}>Order #1052</b>
                          <span style={{ background: C.goodBg, color: C.good, fontWeight: 700, fontSize: 12, padding: "2px 9px", borderRadius: 999 }}>
                            Shipped
                          </span>
                        </div>
                        <div>DHL Express · arriving 26 Sep</div>
                        <div style={{ color: "#555" }}>{Product.alaia.name} × 1</div>
                        <div style={{ fontWeight: 800 }}>Total {Product.alaia.price}</div>
                        <div
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                            background: C.maroon,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13.5,
                            padding: "7px 14px",
                            borderRadius: 6,
                          }}
                        >
                          Track your shipment →
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {f >= 240 ? (
                    <div style={{ marginTop: 18, opacity: ease(f, 240, 250) }}>
                      <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 22, marginBottom: 10 }}>You may also love</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        {[Product.zmBlack, Product.rhode, Product.miumiu].map((p, i) => (
                          <div
                            key={p.img}
                            style={{
                              width: 190,
                              border: "1px solid #EDE6E3",
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "#fff",
                              opacity: ease(f, 244 + i * 5, 254 + i * 5),
                              transform: `translateY(${(1 - ease(f, 244 + i * 5, 256 + i * 5)) * 16}px)`,
                            }}
                          >
                            <Photo src={p.img} w={190} h={150} />
                            <div style={{ padding: "8px 10px" }}>
                              <div style={{ fontWeight: 700, fontSize: 13.5, ...ellipsis }}>{p.name}</div>
                              <div style={{ fontSize: 13, color: "#666" }}>{p.price}</div>
                              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: C.maroon }}>Shop now →</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {f >= 316 ? (
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        opacity: ease(f, 316, 326),
                      }}
                    >
                      <Logo size={50} radius="4px" />
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                        <b>GLAM MODA Customer Care</b>
                        <div style={{ color: "#666" }}>customercare@glam-moda.com · glam-moda.com</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {f >= 380 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 34,
            transform: `translateX(-50%) translateY(${(1 - toast) * 60}px)`,
            opacity: toast,
            background: "#1b1b1b",
            color: "#fff",
            borderRadius: 999,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 16px 40px -10px rgba(0,0,0,0.5)",
          }}
        >
          <CircleCheck size={22} color="#4ADE80" /> Reply sent in the same thread · 2:04 AM
        </div>
      ) : null}
    </div>
  );
};

const Demo: React.FC = () => {
  const p = useSpr(4, 22);
  return (
    <Paper bg={C.white}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 640, background: C.maroon, overflow: "hidden" }}>
        <Rings x="8%" y="94%" grow={false} />
        <div style={{ position: "absolute", bottom: 46, left: 56 }}>
          <Wordmark size={24} animate={false} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: "50%",
          transform: `translateY(-50%) translateY(${(1 - p) * 120}px) perspective(2400px) rotateY(${(1 - p) * -18 - 3}deg) scale(${0.92 + p * 0.06})`,
        }}
      >
        <MailWindow />
      </div>
      <div style={{ position: "absolute", left: 1340, top: "50%", transform: "translateY(-50%)" }}>
        <Captions
          width={530}
          size={62}
          items={[
            { from: 18, eyebrow: "01 · Outlook inbox", text: "Every email answered, even at 2 AM", hl: ["2", "AM"] },
            { from: 96, eyebrow: "02 · On-brand replies", text: "Written like your best team member", hl: ["best"] },
            { from: 170, eyebrow: "03 · Order cards", text: "Full order details and tracking", hl: ["tracking"] },
            { from: 240, eyebrow: "04 · Upsell", text: "Product picks with real photos", hl: ["real", "photos"] },
            { from: 372, eyebrow: "05 · Done", text: "Sent in the same thread. No waiting.", hl: ["No", "waiting"] },
          ]}
        />
      </div>
      <Sfx at={22} name="ding" volume={0.55} />
      <TypingSfx from={104} to={160} every={4} volume={0.25} />
      <Sfx at={170} name="pop" volume={0.45} />
      <Sfx at={240} name="pop" volume={0.45} />
      <Sfx at={380} name="success" volume={0.6} />
    </Paper>
  );
};

export const EmailVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.maroon }}>
    <Audio src={staticFile("audio/music-cs.wav")} volume={0.55} />
    <Timeline
      total={CS.total}
      shots={[
        { start: CS.logo, node: <LogoOpen label="Email customer care" icon={<Mail size={30} color="#fff" />} /> },
        {
          start: CS.hook,
          enter: T.up,
          node: (
            <Hook
              lines={[
                { text: "Inbox at 2 AM?", at: 6, size: 180, color: C.maroon },
                { text: "Already answered.", at: 14, size: 92 },
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
              title="Every email, handled end to end."
              nodes={[
                { icon: <OutlookIcon size={76} />, label: "Email lands in Outlook" },
                { icon: <BrandIcon icon={siClaude} size={72} />, label: "Claude AI agent reads it" },
                { icon: <BrandIcon icon={siShopify} size={72} />, label: "Checks Shopify orders & products" },
                { icon: <LayoutTemplate size={62} color={C.maroon} />, label: "Builds a branded HTML email" },
                { icon: <Reply size={62} color={C.maroon} />, label: "Replies in the same thread" },
              ]}
              chips={["Same knowledge as WhatsApp & Instagram", "Carrier tracking link that never expires"]}
            />
          ),
        },
        {
          start: CS.outro,
          enter: T.up,
          node: <Outro headline="No email left waiting." hl={["waiting"]} chips={channelChips} />,
        },
      ]}
    />
  </AbsoluteFill>
);
