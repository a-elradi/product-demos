import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ChevronLeft, ChevronRight, Lock, MessageSquare, RotateCw, X } from "lucide-react";
import { C, F } from "../theme";
import { Count, Cursor, clamp, ease, typed, useSpr } from "../ui/core";
import { Logo } from "../ui/phone";
import { ALL } from "./agents";

// Local timeline of the dashboard shot (frames from shot start).
export const D = {
  userType: 26,
  passType: 50,
  signIn: 74,
  app: 84,
  tabBH: 132,
  tabUS: 156,
  scroll: 182,
  brief: 240,
};

const STORES = [
  { key: "KW", label: "Kuwait", ccy: "KWD", mtd: 4120, target: 5000, orders: 74, ordersT: 90, aov: 55.7, d14: 2450 },
  { key: "BH", label: "Bahrain", ccy: "SAR", mtd: 71300, target: 85000, orders: 77, ordersT: 95, aov: 926, d14: 39800 },
  { key: "US", label: "United States", ccy: "USD", mtd: 18900, target: 24000, orders: 40, ordersT: 55, aov: 472.5, d14: 10300 },
];

const BRIEF = [
  "Good morning. Here is today's brief:",
  "• Kuwait is at 82% of the monthly target and on pace to pass it.",
  "• NASEEJ: every automation is healthy, no stuck orders.",
  "• RAED found 5 new best sellers we don't carry yet.",
  "• KASHEF has 2 SEO fixes waiting for your approval.",
  "• RASID flagged 1 campaign spending without sales.",
].join("\n");

const btn = (primary = false): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 40,
  padding: "0 16px",
  borderRadius: 6,
  border: `1px solid ${primary ? C.maroon : C.line}`,
  background: primary ? C.maroon : C.white,
  color: primary ? "#fff" : C.ink,
  fontWeight: 600,
  fontSize: 14,
  whiteSpace: "nowrap",
});

const card: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  boxShadow: "0 1px 2px rgba(21,19,19,.04), 0 10px 28px -14px rgba(128,0,0,.14)",
};

const LiveChip: React.FC = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 24,
      padding: "0 9px",
      borderRadius: 999,
      fontSize: 11.5,
      fontWeight: 700,
      background: C.goodBg,
      color: C.good,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.good }} /> Live
  </span>
);

// ---------- sign in ----------
const Login: React.FC = () => {
  const f = useCurrentFrame();
  const user = typed("glammoda", f, D.userType, 0.5);
  const dots = Math.max(0, Math.min(12, Math.floor((f - D.passType) * 0.6)));
  const field: React.CSSProperties = {
    height: 44,
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    fontSize: 15,
  };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, letterSpacing: ".06em", color: C.ink2, marginBottom: 6 };
  return (
    <div style={{ position: "absolute", inset: 0, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", width: 920, minHeight: 520, overflow: "hidden", borderRadius: 14 }}>
        <div style={{ background: C.maroon, color: "#fff", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -80, bottom: -80, width: 260, height: 260, border: "1px solid rgba(255,255,255,.18)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: -30, bottom: -30, width: 160, height: 160, border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%" }} />
          <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 34, letterSpacing: ".12em", lineHeight: 1 }}>
            GLAM MODA
            <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 11, letterSpacing: ".28em", opacity: 0.85, marginTop: 12 }}>OPERATIONS</div>
          </div>
          <div style={{ fontFamily: F.ar, fontSize: 30, fontWeight: 500, direction: "rtl", textAlign: "left" }}>فريق الوكلاء</div>
          <div style={{ fontSize: 12, opacity: 0.7, maxWidth: "34ch", lineHeight: 1.6 }}>
            Restricted to GLAM MODA management. Every action taken here is written to the audit trail.
          </div>
        </div>
        <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
          <div>
            <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 28 }}>Sign in</div>
            <div style={{ color: C.ink3, fontSize: 14 }}>Enter the operations credentials to continue.</div>
          </div>
          <div>
            <div style={label}>USERNAME</div>
            <div style={{ ...field, borderColor: f >= D.userType - 4 && f < D.passType - 4 ? C.maroon : C.line }}>{user}</div>
          </div>
          <div>
            <div style={label}>PASSWORD</div>
            <div style={{ ...field, borderColor: f >= D.passType - 4 && f < D.signIn ? C.maroon : C.line, letterSpacing: 3, fontSize: 18 }}>
              {"•".repeat(dots)}
            </div>
          </div>
          <div style={{ ...btn(true), justifyContent: "center", transform: f >= D.signIn && f < D.signIn + 4 ? "translateY(1px)" : undefined }}>
            Enter the dashboard
          </div>
          <div style={{ fontSize: 12, color: C.ink3 }}>Access is limited to the GLAM MODA management team.</div>
        </div>
      </div>
    </div>
  );
};

// ---------- app ----------
const App: React.FC = () => {
  const f = useCurrentFrame();
  const storeIdx = f >= D.tabUS ? 2 : f >= D.tabBH ? 1 : 0;
  const s = STORES[storeIdx];
  const switchAt = [D.app + 6, D.tabBH, D.tabUS][storeIdx];
  const pct = s.mtd / s.target;
  const meter = ease(f, switchAt, switchAt + 26) * pct;
  const scroll = interpolate(f, [D.scroll, D.scroll + 34], [0, -600], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const spark = [30, 42, 38, 51, 47, 60, 55, 68, 62, 74, 70, 81, 77, 90];
  const sparkP = ease(f, switchAt, switchAt + 30);
  const pts = spark
    .map((v, i) => `${(i / (spark.length - 1)) * 250},${46 - (v / 100) * 44}`)
    .slice(0, Math.max(2, Math.ceil(spark.length * sparkP)))
    .join(" ");
  const money = (v: number, key: string) => <Count key={key} to={v} at={switchAt} dur={26} prefix={`${s.ccy} `} />;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden" }}>
      <div style={{ height: 60, background: "#fff", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 30px", gap: 12, position: "relative", zIndex: 2 }}>
        <span style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 22, letterSpacing: ".14em" }}>GLAM MODA</span>
        <span style={{ fontSize: 11, letterSpacing: ".22em", color: C.ink3, fontWeight: 600 }}>OPERATIONS</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: C.goodBg, color: C.good }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.good }} /> System: running
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${C.line}`, background: "#fff" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.good }} /> Live data
          </span>
          <Logo size={26} />
          <span style={{ fontSize: 13, color: C.ink2 }}>Sign out</span>
        </div>
      </div>
      <div style={{ transform: `translateY(${scroll}px)`, padding: "26px 30px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: C.maroon }}>AGENT TEAM · DEPARTMENT VIEW</div>
            <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 38, lineHeight: 1.05 }}>The team, today</div>
            <div style={{ color: C.ink3, fontSize: 14, marginTop: 6 }}>Thursday, 24 September · all 9 agents reporting</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={btn()}>
              <RotateCw size={15} /> Refresh
            </span>
            <span style={btn(true)}>
              <MessageSquare size={15} /> Ask WAZIR for a brief
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.ink3, marginRight: 4 }}>Store</span>
          {STORES.map((st, i) => (
            <span
              key={st.key}
              style={{
                ...btn(i === storeIdx),
                height: 34,
                fontSize: 13,
                padding: "0 12px",
              }}
            >
              {st.label} · {st.ccy}
            </span>
          ))}
        </div>
        <div style={{ ...card }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px 0" }}>
            <span style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 22 }}>Monthly target</span>
            <span style={{ fontSize: 12, color: C.ink3 }}>
              {s.label} store · {s.ccy}
            </span>
          </div>
          <div style={{ padding: "14px 18px 18px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: C.maroon }}>SALES THIS MONTH</div>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, marginTop: 6 }}>{money(s.mtd, `m${storeIdx}`)}</div>
              <div style={{ marginTop: 14, height: 10, borderRadius: 999, background: C.maroon100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${meter * 100}%`, background: C.maroon, borderRadius: 999 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: C.ink2 }}>
                <span>
                  {Math.round(pct * 100)}% of {s.ccy} {s.target.toLocaleString("en")}
                </span>
                <span>
                  {s.ccy} {(s.target - s.mtd).toLocaleString("en")} to go
                </span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Orders this month", <Count key={`o${storeIdx}`} to={s.orders} at={switchAt} dur={24} />, `target ${s.ordersT}`],
                ["Pace", "On track", "projected month-end"],
                ["Days left", "6", "in the month"],
                ["Average order", <Count key={`a${storeIdx}`} to={s.aov} at={switchAt} dur={24} decimals={1} prefix={`${s.ccy} `} />, "month to date"],
              ].map(([l, v, d], i) => (
                <div key={i} style={{ border: `1px solid ${C.line2}`, borderRadius: 8, padding: "12px 14px", background: C.paper }}>
                  <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.ink3 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div style={{ ...card, padding: "16px 18px", minHeight: 128 }}>
            <div style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>Sales, last 14 days</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{money(s.d14, `d${storeIdx}`)}</div>
            <svg width="100%" height="46" viewBox="0 0 250 46" preserveAspectRatio="none" style={{ marginTop: 6 }}>
              <polyline points={pts} fill="none" stroke={C.maroon} strokeWidth={2.2} />
            </svg>
          </div>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>Automation health</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.good }}>0 failed</div>
            <div style={{ fontSize: 12.5, color: C.ink3 }}>runs in the last 24 hours</div>
          </div>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>Agents live</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>9 / 9</div>
            <div style={{ fontSize: 12.5, color: C.ink3 }}>by registry status</div>
          </div>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>Waiting for approval</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.warn }}>2</div>
            <div style={{ fontSize: 12.5, color: C.ink3 }}>SEO fixes from KASHEF</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
          <span style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 26 }}>The agents</span>
          <span style={{ fontSize: 13, color: C.ink3 }}>Status comes from the live Governance registry. Nothing here is decorative.</span>
        </div>
        <div style={{ ...card, padding: "22px 22px 20px", borderColor: C.maroon200, background: `linear-gradient(180deg,#fff,${C.maroon50})`, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: F.ar, fontSize: 34, color: C.maroon, lineHeight: 1.15, fontWeight: 500 }}>وزير</div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".16em" }}>WAZIR</div>
                <div style={{ fontSize: 13, color: C.ink2 }}>Supervisor · CEO interface</div>
              </div>
              <LiveChip />
            </div>
            <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 10 }}>
              Your single point of contact. Routes requests to the specialists, merges their findings, and never overrides a restriction placed on another agent.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.good }}>RUNNING</div>
            <div style={{ fontSize: 12.5, color: C.ink3 }}>Kill switch ready · every action logged by NASEEJ</div>
            <span style={{ ...btn(true), alignSelf: "flex-start" }}>
              <MessageSquare size={15} /> Ask WAZIR for a brief
            </span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {ALL.slice(1).map((a) => (
            <div key={a.key} style={{ ...card, padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: F.ar, fontSize: 26, color: C.maroon, lineHeight: 1.15, fontWeight: 500 }}>{a.ar}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".16em" }}>{a.key}</div>
                  <div style={{ fontSize: 13, color: C.ink2 }}>{a.role}</div>
                </div>
                <LiveChip />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...btn(), height: 34, fontSize: 13, padding: "0 12px" }}>Run now</span>
                <span style={{ ...btn(), height: 34, fontSize: 13, padding: "0 12px", border: "1px solid transparent" }}>Details</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- WAZIR brief drawer ----------
const Drawer: React.FC = () => {
  const f = useCurrentFrame();
  const p = useSpr(D.brief + 4, 200, 14);
  if (f < D.brief + 2) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(21,19,19,${0.25 * p})`, zIndex: 5 }} />
      <div
        style={{
          position: "absolute",
          zIndex: 6,
          top: 0,
          right: 0,
          bottom: 0,
          width: 560,
          background: C.white,
          borderLeft: `1px solid ${C.line}`,
          boxShadow: "-20px 0 50px -30px rgba(21,19,19,.35)",
          transform: `translateX(${(1 - p) * 100}%)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: F.ar, fontSize: 24, color: C.maroon, fontWeight: 500 }}>وزير</span>
          <div>
            <div style={{ fontSize: 12, letterSpacing: ".14em", fontWeight: 700 }}>WAZIR</div>
            <div style={{ fontSize: 12.5, color: C.ink3 }}>Team brief</div>
          </div>
          <X size={18} style={{ marginLeft: "auto" }} color={C.ink3} />
        </div>
        <div style={{ padding: 22, fontSize: 17, lineHeight: 1.75, whiteSpace: "pre-line", color: C.ink }}>
          {typed(BRIEF, f, D.brief + 14, 4.2)}
          {f < D.brief + 14 ? (
            <span style={{ color: C.ink3 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.maroon, marginRight: 8, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 4)) }} />
              Thinking…
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

// ---------- browser shell ----------
export const DashboardBrowser: React.FC = () => {
  const f = useCurrentFrame();
  const appIn = ease(f, D.app, D.app + 10);
  // viewport is 1280 x 690 page pixels, shown at 1.25x
  return (
    <div
      style={{
        width: 1600,
        height: 950,
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 60px 120px -30px rgba(40,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.12)",
        fontFamily: F.ui,
        color: C.ink,
      }}
    >
      <div style={{ height: 44, background: "#E9E6E4", display: "flex", alignItems: "flex-end", padding: "0 14px", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignSelf: "center", marginRight: 12 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: "10px 10px 0 0", height: 34, padding: "0 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, width: 300 }}>
          <Logo size={18} radius="3px" /> GLAM MODA Operations
          <X size={14} style={{ marginLeft: "auto" }} color="#777" />
        </div>
      </div>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", borderBottom: "1px solid #e5e5e5" }}>
        <ChevronLeft size={20} color="#666" />
        <ChevronRight size={20} color="#bbb" />
        <RotateCw size={17} color="#666" />
        <div style={{ flex: 1, height: 34, borderRadius: 17, background: "#F1F0EF", display: "flex", alignItems: "center", gap: 8, padding: "0 16px", fontSize: 15, color: "#333" }}>
          <Lock size={14} color="#666" />

          <span style={{ width: 150, height: 12, borderRadius: 6, background: "#D9D5D2" }} />
        </div>
      </div>
      <div style={{ position: "relative", width: 1600, height: 856, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 685, transform: "scale(1.25)", transformOrigin: "top left" }}>
          {appIn < 1 ? (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - appIn }}>
              <Login />
            </div>
          ) : null}
          {f >= D.app ? (
            <div style={{ position: "absolute", inset: 0, opacity: appIn }}>
              <App />
            </div>
          ) : null}
          <Drawer />
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <Cursor
            keys={[
              { f: 10, x: 900, y: 600 },
              { f: 22, x: 790, y: 305 },
              { f: 24, x: 790, y: 305, click: true },
              { f: 44, x: 790, y: 391 },
              { f: 46, x: 790, y: 391, click: true },
              { f: 66, x: 790, y: 451 },
              { f: D.signIn, x: 790, y: 451, click: true },
              { f: D.tabBH - 12, x: 236, y: 206 },
              { f: D.tabBH, x: 236, y: 206, click: true },
              { f: D.tabUS - 10, x: 368, y: 206 },
              { f: D.tabUS, x: 368, y: 206, click: true },
              { f: D.brief - 20, x: 760, y: 360 },
              { f: D.brief, x: 800, y: 307, click: true },
              { f: D.brief + 40, x: 700, y: 430 },
            ]}
          />
          </div>
        </div>
      </div>
    </div>
  );
};
