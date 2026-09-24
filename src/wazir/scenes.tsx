import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Crown, Send } from "lucide-react";
import { C, F } from "../theme";
import { Captions, Eyebrow, Reveal, Sfx, TypingSfx, Words, clamp, ease, typed, useSpr } from "../ui/core";
import { ChatScreen, IPhone, Logo, Msg, TgButtons } from "../ui/phone";
import { Maroon, Paper, Rings, Stage } from "../scenes/common";
import { ALL, Agent, TEAM, WAZIR } from "./agents";
import { DashboardBrowser, D } from "./dashboard";

// ---------- cold open ----------
const LOG = [
  "06:00:02  NASEEJ   health check · all workflows ............ OK",
  "06:00:09  FAHES    kw.glam-moda.com · links & pages ......... 200",
  "06:00:15  DHAWWAQ  homepage load · mobile ................. 1.4s",
  "06:01:40  RAED     scanning 40 sources for best sellers",
  "06:02:11  KASHEF   drafting SEO title · Rhode Bubble Bag",
  "06:03:05  TAJER    14-day pulse · repeat buyers found",
  "06:04:30  RASID    7-day ads watch · 1 campaign flagged",
  "06:05:00  HAFEZ    3 new answers waiting for approval",
  "06:05:12  WAZIR    daily brief ready",
];

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: F.mono, fontSize: 25, lineHeight: 2.1, color: "rgba(255,255,255,0.22)" }}>
        {LOG.map((l, i) => {
          const at = 4 + i * 11;
          if (f < at) return null;
          return (
            <div key={i} style={{ color: i === Math.floor((f - 4) / 11) ? "rgba(255,255,255,0.55)" : undefined }}>
              {typed(l, f, at, 5)}
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.9) 70%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
        <Words
          text="While you sleep,"
          at={6}
          out={52}
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 120, letterSpacing: "-0.03em", position: "absolute", top: 440 }}
        />
        <Words
          text="your AI team is already working."
          at={60}
          hl={["AI", "team"]}
          hlColor="#E9A7A7"
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 100, letterSpacing: "-0.03em", position: "absolute", top: 400, width: 1600 }}
        />
      </AbsoluteFill>
      <TypingSfx from={4} to={100} every={5} volume={0.18} />
    </AbsoluteFill>
  );
};

// ---------- WAZIR slam ----------
export const Slam: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 120], [1, 1.06], clamp);
  return (
    <Maroon rings={false}>
      <Rings x="50%" y="50%" color="rgba(255,255,255,0.12)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}>
        <div style={{ display: "flex", fontFamily: F.display, fontWeight: 900, fontSize: 250, letterSpacing: "0.1em", lineHeight: 1 }}>
          {"WAZIR".split("").map((ch, i) => {
            const at = 1 + i * 3;
            const p = ease(f, at, at + 7);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: p,
                  transform: `scale(${2.4 - 1.4 * p})`,
                  filter: `blur(${(1 - p) * 12}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ fontFamily: F.ar, fontWeight: 600, fontSize: 120, marginTop: 10, lineHeight: 1.3 }}>
          <Reveal at={22}>وزير</Reveal>
        </div>
        <Eyebrow color="rgba(255,255,255,0.85)" style={{ fontSize: 28, marginTop: 30 }}>
          <Reveal at={34}>The AI operations team of GLAM MODA</Reveal>
        </Eyebrow>
      </AbsoluteFill>
    </Maroon>
  );
};

// ---------- org chart ----------
const bez = (t: number, a: number, b: number, c: number, d: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

export const OrgChart: React.FC = () => {
  const f = useCurrentFrame();
  const top = { x: 960, y: 470 };
  const nodeY = 700;
  const xs = TEAM.map((_, i) => 225 + i * 210);
  const wz = useSpr(8, 14);
  return (
    <Paper bg={C.white}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <Words
          text="9 AI agents. One team."
          at={4}
          hl={["One", "team"]}
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 84, letterSpacing: "-0.035em", justifyContent: "center" }}
        />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {xs.map((x, i) => {
          const p = ease(f, 18 + i * 3, 40 + i * 3);
          const d = `M ${top.x} ${top.y} C ${top.x} ${top.y + 120}, ${x} ${nodeY - 150}, ${x} ${nodeY - 62}`;
          return (
            <path key={i} d={d} fill="none" stroke={C.maroon200} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
          );
        })}
        {f > 44
          ? xs.map((x, i) => {
              const period = 36;
              const t = (((f - 44 + i * 5) % period) + period) % period / period;
              const px = bez(t, top.x, top.x, x, x);
              const py = bez(t, top.y, top.y + 120, nodeY - 150, nodeY - 62);
              return <circle key={i} cx={px} cy={py} r={7} fill={C.maroon} opacity={0.9} />;
            })
          : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: top.x - 85,
          top: top.y - 175,
          width: 170,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${wz})`,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: C.maroon,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 0 ${8 + Math.sin(f / 6) * 4}px ${C.maroon100}, 0 20px 40px -10px rgba(128,0,0,0.5)`,
          }}
        >
          <Crown size={70} color="#fff" strokeWidth={1.6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: top.x + 100, top: top.y - 140, opacity: ease(f, 14, 24) }}>
        <div style={{ fontFamily: F.ar, fontSize: 44, color: C.maroon, fontWeight: 600, lineHeight: 1.1 }}>{WAZIR.ar}</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.16em" }}>WAZIR</div>
        <div style={{ fontFamily: F.ui, fontSize: 21, color: C.ink2 }}>Supervisor · your single contact</div>
      </div>
      {TEAM.map((a, i) => {
        const p = useSpr(26 + i * 4, 13);
        const hit = f > 44 && (((f - 44 + i * 5) % 36) + 36) % 36 > 32;
        return (
          <div
            key={a.key}
            style={{
              position: "absolute",
              left: xs[i] - 90,
              top: nodeY - 60,
              width: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: Math.min(1, p * 1.4),
              transform: `translateY(${(1 - p) * 40}px)`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: C.white,
                border: `2.5px solid ${hit ? C.maroon : C.maroon200}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${hit ? 1.07 : 1})`,
                boxShadow: "0 16px 30px -18px rgba(128,0,0,0.5)",
              }}
            >
              <a.Icon size={52} color={C.maroon} strokeWidth={1.7} />
            </div>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 20, letterSpacing: "0.12em" }}>{a.key}</div>
            <div style={{ fontFamily: F.ar, fontSize: 30, color: C.maroon, fontWeight: 600, marginTop: -8 }}>{a.ar}</div>
          </div>
        );
      })}
    </Paper>
  );
};

// ---------- agent spotlight ----------
export const Spotlight: React.FC<{ agent: Agent; n: number; dark: boolean; children: React.ReactNode }> = ({
  agent,
  n,
  dark,
  children,
}) => {
  const f = useCurrentFrame();
  const card = useSpr(6, 16);
  const fg = dark ? C.white : C.ink;
  const accent = dark ? C.white : C.maroon;
  const Bg = dark ? Maroon : Paper;
  const drift = interpolate(f, [0, 90], [0, -30], clamp);
  return (
    <Bg>
      <div style={{ position: "absolute", right: -120, bottom: -160, opacity: dark ? 0.08 : 0.05, transform: `translateY(${drift}px)` }}>
        <agent.Icon size={760} color={dark ? "#fff" : C.maroon} strokeWidth={0.9} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 720, display: "flex", flexDirection: "column", justifyContent: "center", color: fg }}>
        <Eyebrow color={dark ? "rgba(255,255,255,0.8)" : C.maroon} style={{ fontSize: 24 }}>
          <Reveal at={2}>Agent {String(n).padStart(2, "0")} / 08</Reveal>
        </Eyebrow>
        <div style={{ fontFamily: F.ar, fontWeight: 700, fontSize: 190, lineHeight: 1.25, color: accent, marginTop: 6, marginBottom: 18 }}>
          <Reveal at={4}>{agent.ar}</Reveal>
        </div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: "0.14em", lineHeight: 1 }}>
          <Reveal at={8}>{agent.key}</Reveal>
        </div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 36, marginTop: 22 }}>
          <Reveal at={12}>{agent.role}</Reveal>
        </div>
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 34, marginTop: 8, opacity: 0.75 }}>
          <Reveal at={15}>{agent.meaning}</Reveal>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 930,
          top: "50%",
          transform: `translateY(-50%) translateX(${(1 - card) * 160}px) perspective(2000px) rotateY(${(1 - card) * -14}deg)`,
          opacity: card,
        }}
      >
        {children}
      </div>
      <Sfx at={6} name="pop" volume={0.35} />
    </Bg>
  );
};

// ---------- Telegram group ----------
const TG_AVATAR = (
  <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.maroon, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Crown size={22} color="#fff" />
  </div>
);

const tgMsgs: Msg[] = [
  { at: 18, side: "them", bold: "NASEEJ · Daily health check", text: "All workflows running · 0 failures\nNo stuck orders in KW · BH · US", time: "09:00", h: 120 },
  {
    at: 54,
    side: "them",
    bold: "RAED · Today's picks",
    text: "5 best sellers we don't carry yet.\nTop pick: #SEPHKW01 · Confirmed",
    time: "09:10",
    h: 170,
    below: <TgButtons labels={["Add #SEPHKW01", "See all 5"]} />,
  },
  { at: 92, side: "them", bold: "FAHES · Site check", text: "1 broken link on kw.glam-moda.com\n/pages/old-offer returns 404", time: "09:12", h: 120 },
  {
    at: 126,
    side: "them",
    bold: "KASHEF · SEO",
    text: "2 SEO fixes drafted, waiting for approval",
    time: "09:15",
    h: 140,
    below: <TgButtons labels={["Review in dashboard"]} />,
  },
  { at: 170, side: "me", text: "/status", time: "09:20", typing: false, h: 60 },
  {
    at: 192,
    side: "them",
    typing: true,
    bold: "WAZIR · Status",
    text: "System: RUNNING\n9 of 9 agents live\n2 items waiting for your approval",
    time: "09:20",
    h: 150,
  },
];

export const TelegramShot: React.FC = () => {
  const f = useCurrentFrame();
  const draft = f >= 150 && f < 170 ? typed("/status", f, 150, 0.45) : "";
  return (
    <>
      <Stage
        deviceSide="right"
        device={
          <IPhone time="9:20" statusBg="#fff">
            <ChatScreen skin="telegram" title="Wazir Team" subtitle="3 members · GLAM MODA Bot" avatar={TG_AVATAR} msgs={tgMsgs} draft={draft} />
          </IPhone>
        }
        captions={
          <Captions
            width={740}
            items={[
              { from: 14, eyebrow: "One Telegram group", text: "Every agent reports to your team, every day", hl: ["every", "day"] },
              { from: 86, eyebrow: "Tap to act", text: "Problems flagged. Fixes one tap away.", hl: ["one", "tap"] },
              { from: 150, eyebrow: "Talk to WAZIR", text: "Ask for a status any time: /status", hl: ["/status"] },
            ]}
          />
        }
      />
      {tgMsgs.map((m) => (
        <Sfx key={m.at} at={m.at} name={m.side === "me" ? "send" : "ding"} volume={m.side === "me" ? 0.5 : 0.35} />
      ))}
      <TypingSfx from={150} to={166} every={3} volume={0.3} />
    </>
  );
};

// ---------- dashboard ----------
const TOPCAPS = [
  { from: 8, eyebrow: "Live ops dashboard", text: "One private dashboard for the whole team" },
  { from: D.tabBH - 6, eyebrow: "3 stores", text: "Kuwait, Bahrain and USA, side by side" },
  { from: D.scroll, eyebrow: "The agents", text: "Every agent's live status in one place" },
  { from: D.brief - 4, eyebrow: "Ask WAZIR", text: "A daily brief, written by WAZIR" },
];

export const DashboardShot: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useSpr(2, 20);
  // Browser sits at 0.88 scale, then zooms to 0.98 around the WAZIR drawer.
  const s = interpolate(f, [D.brief + 10, D.brief + 40], [0.88, 0.98], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const tx = 256 + (0.88 - s) * 1250;
  const ty = 196 + (0.88 - s) * 450;
  return (
    <Paper bg={C.white}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: C.maroon }}>
        <Rings x="92%" y="100%" grow={false} />
      </div>
      <div style={{ position: "absolute", left: 256, top: 34, height: 130, width: 1500 }}>
        {TOPCAPS.map((c, i) => {
          const next = TOPCAPS[i + 1]?.from;
          if (f < c.from || (next !== undefined && f > next + 14)) return null;
          return (
            <div key={i} style={{ position: "absolute", inset: 0 }}>
              <Eyebrow style={{ marginBottom: 12 }}>
                <Reveal at={c.from} out={next}>
                  {c.eyebrow}
                </Reveal>
              </Eyebrow>
              <Words
                text={c.text}
                at={c.from + 3}
                out={next}
                style={{ fontFamily: F.display, fontWeight: 800, fontSize: 58, letterSpacing: "-0.03em", lineHeight: 1.05 }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty + (1 - enter) * 300}px) scale(${s})`,
        }}
      >
        <DashboardBrowser />
      </div>
      <TypingSfx from={D.userType} to={D.userType + 16} every={2} volume={0.28} />
      <TypingSfx from={D.passType} to={D.passType + 20} every={2} volume={0.28} />
      {[24, 46, D.signIn, D.tabBH, D.tabUS, D.brief].map((t) => (
        <Sfx key={t} at={t} name="click" volume={0.55} />
      ))}
      <Sfx at={D.app} name="success" volume={0.4} />
      <Sfx at={D.brief + 4} name="whoosh" volume={0.3} />
    </Paper>
  );
};

// ---------- governance ----------
export const Governance: React.FC = () => {
  const f = useCurrentFrame();
  const rules = [
    { color: "#2E9E5B", tag: "GREEN", title: "Runs on its own", text: "Reports, checks, audits" },
    { color: "#E0A526", tag: "YELLOW", title: "Needs your approval", text: "New products, SEO fixes, discounts over 10%" },
    { color: C.maroon, tag: "RED", title: "Needs the CEO", text: "Big spend and risky changes" },
  ];
  return (
    <Paper bg={C.paper}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56 }}>
        <Words
          text="You stay in control."
          at={3}
          hl={["control"]}
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.035em", justifyContent: "center" }}
        />
        <div style={{ display: "flex", gap: 30 }}>
          {rules.map((r, i) => {
            const p = useSpr(10 + i * 5, 14);
            return (
              <div
                key={r.tag}
                style={{
                  width: 500,
                  height: 250,
                  background: C.white,
                  borderRadius: 22,
                  borderTop: `10px solid ${r.color}`,
                  boxShadow: "0 30px 60px -30px rgba(80,0,0,0.35)",
                  padding: "30px 34px",
                  fontFamily: F.ui,
                  opacity: Math.min(1, p * 1.3),
                  transform: `translateY(${(1 - p) * 80}px) scale(${0.9 + p * 0.1})`,
                }}
              >
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: "0.24em", color: r.color }}>{r.tag}</div>
                <div style={{ fontWeight: 800, fontSize: 40, margin: "12px 0 8px" }}>{r.title}</div>
                <div style={{ fontSize: 26, color: C.ink2 }}>{r.text}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: C.ink2, opacity: ease(f, 34, 44) }}>
          Every action is written to the audit trail.
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// ---------- kill switch ----------
export const KILL = { pauseType: 8, pause: 30, resumeType: 62, resume: 90 };

export const KillSwitch: React.FC = () => {
  const f = useCurrentFrame();
  const paused = f >= KILL.pause && f < KILL.resume;
  const cmd =
    f < KILL.pause
      ? typed("/pause", f, KILL.pauseType, 0.4)
      : f < KILL.resumeType
        ? ""
        : f < KILL.resume
          ? typed("/resume", f, KILL.resumeType, 0.35)
          : "";
  const dim = f >= KILL.pause && f < KILL.resume ? ease(f, KILL.pause, KILL.pause + 10) : 1 - ease(f, KILL.resume, KILL.resume + 10);
  const head =
    f < KILL.pause ? "One command stops everything." : f < KILL.resume ? "Kill switch: all 9 agents paused." : "One command brings them back.";
  const headAt = f < KILL.pause ? 4 : f < KILL.resume ? KILL.pause + 2 : KILL.resume + 2;
  return (
    <AbsoluteFill style={{ background: "#0C0C0C", color: "#fff", fontFamily: F.ui }}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <Words
          key={head}
          text={head}
          at={headAt}
          hl={["stops", "paused.", "back."]}
          hlColor={paused ? "#E9A7A7" : "#9BE3B5"}
          style={{ fontFamily: F.display, fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em", justifyContent: "center" }}
        />
        <div
          style={{
            marginTop: 50,
            width: 760,
            height: 76,
            borderRadius: 38,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            padding: "0 12px 0 30px",
            gap: 16,
          }}
        >
          <span style={{ fontFamily: F.mono, fontSize: 34, flex: 1, color: cmd ? "#fff" : "rgba(255,255,255,0.35)" }}>
            {cmd || "Message Wazir Team"}
            {cmd ? <span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1 }}>|</span> : null}
          </span>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#3A8AD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={26} color="#fff" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 430px)", gap: 18, marginTop: 56, filter: `grayscale(${dim})` }}>
          {ALL.map((a, i) => {
            const flipAt = paused ? KILL.pause + i * 2 : KILL.resume + i * 2;
            const isPaused = paused ? f >= flipAt : f >= KILL.pause && f < flipAt && f >= KILL.resume;
            return (
              <div
                key={a.key}
                style={{
                  height: 92,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 22px",
                  opacity: isPaused ? 0.55 : 1,
                }}
              >
                <a.Icon size={34} color="#fff" strokeWidth={1.6} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em" }}>{a.key}</div>
                  <div style={{ fontFamily: F.ar, fontSize: 20, opacity: 0.7 }}>{a.ar}</div>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: "0.1em",
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: isPaused ? "rgba(255,255,255,0.12)" : "rgba(46,158,91,0.22)",
                    color: isPaused ? "#bbb" : "#7EE2A4",
                  }}
                >
                  {isPaused ? "PAUSED" : "LIVE"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 40, fontSize: 24, color: "rgba(255,255,255,0.6)", opacity: f >= KILL.pause + 8 ? 1 : 0 }}>
          {paused ? "Paused by the owner · logged by NASEEJ" : "System running · logged by NASEEJ"}
        </div>
      </AbsoluteFill>
      <TypingSfx from={KILL.pauseType} to={KILL.pauseType + 15} every={3} volume={0.35} />
      <TypingSfx from={KILL.resumeType} to={KILL.resumeType + 20} every={3} volume={0.35} />
      <Sfx at={KILL.pause} name="send" volume={0.6} />
      <Sfx at={KILL.resume} name="send" volume={0.6} />
      <Sfx at={KILL.resume + 2} name="powerup" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- outro ----------
export const WazirOutro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Maroon rings={false}>
      <Rings x="50%" y="46%" color="rgba(255,255,255,0.12)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ transform: `scale(${useSpr(2, 14)})`, outline: "2px solid rgba(255,255,255,0.85)", outlineOffset: 10 }}>
            <Logo size={150} radius="0" />
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 150, letterSpacing: "0.1em", lineHeight: 1 }}>
              <Reveal at={4}>WAZIR</Reveal>
            </div>
            <div style={{ fontFamily: F.ar, fontWeight: 600, fontSize: 64, lineHeight: 1.3 }}>
              <Reveal at={10}>وزير · فريق الوكلاء</Reveal>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 56 }}>
          {["9 AI agents", "3 stores", "Working 24/7", "You approve what matters"].map((t, i) => {
            const p = ease(f, 18 + i * 5, 30 + i * 5);
            return (
              <div
                key={t}
                style={{
                  fontFamily: F.ui,
                  fontWeight: 700,
                  fontSize: 27,
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 50, fontFamily: F.ui, fontWeight: 600, fontSize: 24, opacity: ease(f, 40, 54) * 0.9 }}>
          Reports in Telegram · Live ops dashboard for KW · BH · US
        </div>
      </AbsoluteFill>
    </Maroon>
  );
};
