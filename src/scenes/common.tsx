import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { Eyebrow, Reveal, Words, clamp, ease, useSpr, Wordmark } from "../ui/core";
import { Logo } from "../ui/phone";

// Thin concentric rings, borrowed from the dashboard's sign-in panel.
export const Rings: React.FC<{ x: string; y: string; color?: string; grow?: boolean }> = ({
  x,
  y,
  color = "rgba(255,255,255,0.14)",
  grow = true,
}) => {
  const f = useCurrentFrame();
  return (
    <>
      {[380, 620, 880, 1160].map((r, i) => {
        const s = grow ? 0.85 + 0.15 * Math.min(1, f / 60) + i * 0.0 : 1;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              borderRadius: "50%",
              border: `1.5px solid ${color}`,
              transform: `scale(${s})`,
            }}
          />
        );
      })}
    </>
  );
};

export const Maroon: React.FC<{ children: React.ReactNode; rings?: boolean }> = ({ children, rings = true }) => (
  <AbsoluteFill style={{ background: C.maroon, color: C.white, overflow: "hidden" }}>
    {rings ? <Rings x="88%" y="92%" /> : null}
    {children}
  </AbsoluteFill>
);

export const Paper: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.paper }) => (
  <AbsoluteFill style={{ background: bg, color: C.ink, overflow: "hidden" }}>{children}</AbsoluteFill>
);

// ---------- 1. logo open ----------
export const LogoOpen: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => {
  const f = useCurrentFrame();
  const line = ease(f, 18, 38);
  return (
    <Maroon>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 70 }}>
        <Wordmark size={118} at={2} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ width: 520 * line, height: 2, background: "rgba(255,255,255,0.7)" }} />
          <Eyebrow color="#fff" style={{ fontSize: 26, display: "flex", alignItems: "center", gap: 18 }}>
            {icon ? <Reveal at={24}>{icon}</Reveal> : null}
            <Reveal at={26}>{label}</Reveal>
          </Eyebrow>
        </div>
      </AbsoluteFill>
    </Maroon>
  );
};

// ---------- 2. kinetic hook ----------
export type HookLine = { text: string; at: number; size: number; hl?: string[]; color?: string };

export const Hook: React.FC<{ lines: HookLine[]; eyebrow?: string }> = ({ lines, eyebrow }) => (
  <Paper bg={C.white}>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 180px", gap: 18 }}>
      {eyebrow ? (
        <Eyebrow style={{ marginBottom: 10 }}>
          <Reveal at={6}>{eyebrow}</Reveal>
        </Eyebrow>
      ) : null}
      {lines.map((l) => (
        <Words
          key={l.text}
          text={l.text}
          at={l.at}
          hl={l.hl}
          stagger={2}
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: l.size,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: l.color ?? C.ink,
          }}
        />
      ))}
    </AbsoluteFill>
  </Paper>
);

// ---------- 3. device stage: maroon panel + device + captions ----------
export const Stage: React.FC<{
  device: React.ReactNode;
  captions: React.ReactNode;
  deviceSide?: "left" | "right";
  panelWidth?: number;
  deviceScale?: number;
}> = ({ device, captions, deviceSide = "left", panelWidth = 760, deviceScale = 1.06 }) => {
  const f = useCurrentFrame();
  const p = useSpr(4, 22);
  const rot = interpolate(p, [0, 1], [deviceSide === "left" ? -28 : 28, deviceSide === "left" ? -7 : 7]);
  const float = Math.sin(f / 28) * 6;
  const panel = (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [deviceSide]: 0,
        width: panelWidth,
        background: C.maroon,
        overflow: "hidden",
      }}
    >
      <Rings x={deviceSide === "left" ? "8%" : "92%"} y="94%" grow={false} />
      <div style={{ position: "absolute", bottom: 46, [deviceSide]: 56, opacity: 0.9 }}>
        <Wordmark size={24} animate={false} />
      </div>
    </div>
  );
  return (
    <Paper bg={C.white}>
      {panel}
      <div
        style={{
          position: "absolute",
          top: "50%",
          [deviceSide]: panelWidth - 250,
          transform: `translateY(-50%) translateY(${(1 - p) * 140 + float}px) perspective(2200px) rotateY(${rot}deg) scale(${
            deviceScale * (0.9 + p * 0.1)
          })`,
          transformOrigin: "center",
        }}
      >
        {device}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          [deviceSide === "left" ? "left" : "right"]: panelWidth + 330,
        }}
      >
        {captions}
      </div>
    </Paper>
  );
};

// ---------- 4. how it works ----------
export type FlowNode = { icon: React.ReactNode; label: string };

export const Flow: React.FC<{ title: string; nodes: FlowNode[]; chips: string[] }> = ({ title, nodes, chips }) => {
  const f = useCurrentFrame();
  const n = nodes.length;
  const gap = 330;
  const width = gap * (n - 1);
  const t0 = 24;
  const t1 = 84;
  const dotX = interpolate(f, [t0, t1], [0, width], clamp);
  return (
    <Maroon>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Eyebrow color="rgba(255,255,255,0.75)" style={{ marginBottom: 20 }}>
          <Reveal at={4}>How it works</Reveal>
        </Eyebrow>
        <Words
          text={title}
          at={6}
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 70, letterSpacing: "-0.03em", marginBottom: 80 }}
        />
        <div style={{ position: "relative", width: width + 200, height: 250 }}>
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 70,
              width: width * ease(f, 14, 40),
              height: 3,
              background: "rgba(255,255,255,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 70,
              width: dotX,
              height: 3,
              background: "#fff",
            }}
          />
          {f > t0 && f < t1 + 6 ? (
            <div
              style={{
                position: "absolute",
                left: 100 + dotX - 11,
                top: 60,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 0 8px rgba(255,255,255,0.18), 0 0 30px rgba(255,255,255,0.8)",
              }}
            />
          ) : null}
          {nodes.map((node, i) => {
            const x = i * gap;
            const hit = t0 + ((t1 - t0) * i) / (n - 1);
            const pulse = interpolate(f, [hit - 2, hit + 4, hit + 14], [1, 1.14, 1], clamp);
            const pin = 1 - Math.pow(1 - ease(f, 8 + i * 4, 26 + i * 4), 2);
            return (
              <div
                key={node.label}
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  width: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 22,
                  opacity: pin,
                  transform: `translateY(${(1 - pin) * 40}px)`,
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${pulse})`,
                    boxShadow: f >= hit ? "0 0 0 10px rgba(255,255,255,0.16)" : "none",
                  }}
                >
                  {node.icon}
                </div>
                <div
                  style={{
                    fontFamily: F.ui,
                    fontWeight: 700,
                    fontSize: 24,
                    lineHeight: 1.25,
                    textAlign: "center",
                    width: 250,
                  }}
                >
                  {node.label}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
          {chips.map((c, i) => {
            const p = ease(f, 70 + i * 6, 86 + i * 6);
            return (
              <div
                key={c}
                style={{
                  fontFamily: F.ui,
                  fontWeight: 600,
                  fontSize: 25,
                  padding: "16px 28px",
                  borderRadius: 999,
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Maroon>
  );
};

// ---------- 5. outro ----------
export const Outro: React.FC<{ headline: string; hl?: string[]; chips: React.ReactNode[] }> = ({
  headline,
  hl,
  chips,
}) => {
  const f = useCurrentFrame();
  const p = useSpr(2, 16);
  return (
    <Paper bg={C.white}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46 }}>
        <div style={{ transform: `scale(${0.6 + p * 0.4})`, opacity: p, boxShadow: "0 30px 60px -25px rgba(128,0,0,0.5)" }}>
          <Logo size={230} radius="0" />
        </div>
        <Words
          text={headline}
          at={10}
          hl={hl}
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 74,
            letterSpacing: "-0.03em",
            justifyContent: "center",
            maxWidth: 1400,
          }}
        />
        <div style={{ display: "flex", gap: 20 }}>
          {chips.map((c, i) => {
            const q = ease(f, 22 + i * 5, 36 + i * 5);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: F.ui,
                  fontWeight: 700,
                  fontSize: 25,
                  padding: "14px 26px",
                  borderRadius: 999,
                  border: `1.5px solid ${C.line}`,
                  background: C.paper,
                  opacity: q,
                  transform: `translateY(${(1 - q) * 16}px)`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
        <div style={{ opacity: ease(f, 40, 54), fontFamily: F.display, fontWeight: 600, letterSpacing: "0.3em", fontSize: 22, color: C.maroon }}>
          GLAM-MODA.COM
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
