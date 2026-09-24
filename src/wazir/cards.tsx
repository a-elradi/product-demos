import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CircleCheck, Loader, Sparkles, TriangleAlert, Smartphone } from "lucide-react";
import { siGoogleads, siGoogleanalytics, siInstagram, siMeta, siShopify, siTiktok, siWhatsapp } from "simple-icons";
import { C, F } from "../theme";
import { BrandIcon, Cursor, clamp, ease, typed } from "../ui/core";
import { Photo } from "../ui/phone";
import { OutlookIcon, ellipsis } from "../videos/shared";

// ---------- shared card chrome (dashboard style) ----------

export const Card: React.FC<{ children: React.ReactNode; width?: number; style?: React.CSSProperties }> = ({
  children,
  width = 860,
  style,
}) => (
  <div
    style={{
      width,
      background: C.white,
      borderRadius: 20,
      border: `1px solid ${C.line}`,
      boxShadow: "0 2px 4px rgba(21,19,19,0.04), 0 40px 80px -30px rgba(80,0,0,0.35)",
      padding: "28px 32px",
      fontFamily: F.ui,
      color: C.ink,
      position: "relative",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Head: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
    <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 36 }}>{title}</div>
    {right}
  </div>
);

type Kind = "good" | "warn" | "crit" | "plain";
export const Chip: React.FC<{ kind?: Kind; children: React.ReactNode; size?: number }> = ({
  kind = "plain",
  children,
  size = 17,
}) => {
  const map = {
    good: [C.goodBg, C.good],
    warn: [C.warnBg, C.warn],
    crit: [C.critBg, C.maroon],
    plain: [C.paper, C.ink2],
  } as const;
  const [bg, fg] = map[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: size,
        padding: `${size * 0.3}px ${size * 0.75}px`,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: fg }} />
      {children}
    </span>
  );
};

const rowIn = (f: number, at: number): React.CSSProperties => {
  const p = ease(f, at, at + 8);
  return { opacity: p, transform: `translateX(${(1 - p) * 30}px)` };
};

// ---------- NASEEJ: health check ----------
export const NaseejCard: React.FC = () => {
  const f = useCurrentFrame();
  const flows = [
    "WhatsApp Support",
    "Instagram Support",
    "Email Support",
    "Sales Snapshot · All stores",
    "RAED · Daily Scout",
    "KASHEF · SEO Audit",
  ];
  return (
    <Card>
      <Head title="Health check" right={<Chip>06:00 · daily</Chip>} />
      {flows.map((name, i) => {
        const at = 12 + i * 5;
        const done = f >= at + 7;
        return (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 0",
              borderTop: i ? `1px solid ${C.line2}` : "none",
              fontSize: 23,
              fontWeight: 600,
              ...rowIn(f, at),
            }}
          >
            {name}
            {done ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.good, fontWeight: 800 }}>
                <CircleCheck size={26} /> OK
              </span>
            ) : (
              <Loader size={26} color={C.ink3} style={{ transform: `rotate(${f * 18}deg)` }} />
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "center", opacity: ease(f, 48, 56) }}>
        <Chip kind="good" size={20}>
          All systems running
        </Chip>
        <span style={{ color: C.ink3, fontSize: 19 }}>No stuck orders in KW · BH · US</span>
      </div>
    </Card>
  );
};

// ---------- HAFEZ: knowledge base ----------
export const HafezCard: React.FC = () => {
  const f = useCurrentFrame();
  const approved = f >= 40;
  return (
    <Card>
      <Head
        title="Knowledge base"
        right={approved ? <Chip kind="good">Approved</Chip> : <Chip kind="warn">Suggested</Chip>}
      />
      <div style={{ ...rowIn(f, 8), background: C.paper, borderRadius: 14, padding: "18px 22px", direction: "rtl", fontFamily: F.ar }}>
        <div style={{ fontSize: 17, color: C.ink3, fontFamily: F.ui, direction: "ltr", textAlign: "right" }}>Customer asked · seen 12 times</div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>متى يوصل طلبي للكويت؟</div>
      </div>
      <div
        style={{
          ...rowIn(f, 16),
          marginTop: 12,
          border: `1.5px solid ${approved ? C.good : C.line}`,
          borderRadius: 14,
          padding: "18px 22px",
          direction: "rtl",
          fontFamily: F.ar,
        }}
      >
        <div style={{ fontSize: 17, color: C.ink3, fontFamily: F.ui, direction: "ltr", textAlign: "right" }}>Answer the team gave</div>
        <div style={{ fontSize: 24, marginTop: 4, lineHeight: 1.6 }}>
          عادةً خلال أيام قليلة، ونرسل لك رابط التتبع أول ما ينشحن طلبك.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, ...rowIn(f, 22) }}>
        <div
          style={{
            background: approved ? C.good : C.maroon,
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            padding: "12px 24px",
            borderRadius: 8,
          }}
        >
          {approved ? "Approved" : "Approve"}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, padding: "12px 20px", borderRadius: 8, border: `1px solid ${C.line}` }}>Reject</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: C.ink3, opacity: ease(f, 44, 52) }}>
          Now used by
          <BrandIcon icon={siWhatsapp} size={28} />
          <BrandIcon icon={siInstagram} size={28} />
          <OutlookIcon size={28} />
        </div>
      </div>
      <Cursor keys={[{ f: 22, x: 700, y: 460 }, { f: 36, x: 100, y: 376 }, { f: 40, x: 100, y: 376, click: true }, { f: 60, x: 140, y: 400 }]} />
    </Card>
  );
};

// ---------- RAED: product scouting ----------
export const RaedCard: React.FC = () => {
  const f = useCurrentFrame();
  const picks = [
    { img: "dior.jpg", name: "Rouge Dior Forever Lipstick", code: "#SEPHKW01", tag: "Confirmed", kind: "good" as Kind, price: "KWD 25.370" },
    { img: "oribe.jpg", name: "Oribe Côte d'Azur Hair & Body Oil", code: "#NETAKW02", tag: "Strong signal", kind: "warn" as Kind, price: "KWD 30.160" },
    { img: "stanley.jpg", name: "Stanley Quencher ProTour 40 oz", code: "#HRODKW03", tag: "Estimated", kind: "plain" as Kind, price: "KWD 40.420" },
  ];
  const added = f >= 42;
  return (
    <Card>
      <Head title="Today's picks" right={<Chip>40 sources scanned</Chip>} />
      {picks.map((p, i) => (
        <div
          key={p.code}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "12px 0",
            borderTop: i ? `1px solid ${C.line2}` : "none",
            ...rowIn(f, 8 + i * 6),
          }}
        >
          <div style={{ borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
            <Photo src={p.img} w={84} h={84} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, ...ellipsis }}>{p.name}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 16,
                  color: C.maroon,
                  background: C.maroon50,
                  border: `1px solid ${C.maroon100}`,
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                {p.code}
              </span>
              <Chip kind={i === 0 && added ? "good" : p.kind} size={15}>
                {i === 0 && added ? "Draft created" : p.tag}
              </Chip>
            </div>
          </div>
          <div style={{ fontSize: 21, fontWeight: 800 }}>{p.price}</div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, ...rowIn(f, 26) }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: added ? C.good : C.maroon,
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            padding: "12px 22px",
            borderRadius: 8,
          }}
        >
          <BrandIcon icon={siShopify} size={22} color="#fff" />
          {added ? "Added to Shopify as draft" : "Add #SEPHKW01 to Shopify"}
        </div>
        <span style={{ color: C.ink3, fontSize: 18 }}>Only items we don't sell yet</span>
      </div>
      <Cursor keys={[{ f: 28, x: 760, y: 120 }, { f: 38, x: 190, y: 470 }, { f: 42, x: 190, y: 470, click: true }, { f: 60, x: 230, y: 490 }]} />
    </Card>
  );
};

// ---------- KASHEF: SEO fix ----------
export const KashefCard: React.FC = () => {
  const f = useCurrentFrame();
  const title = "Rhode Bubble Bag in Grey | Makeup Bag | GLAM MODA";
  const desc = "Shop the Rhode Bubble Bag in grey at GLAM MODA, a chic and compact makeup bag for your everyday essentials.";
  const applied = f >= 56;
  return (
    <Card>
      <Head title="SEO fix" right={applied ? <Chip kind="good">Applied</Chip> : <Chip kind="warn">Waiting for approval</Chip>} />
      <div style={{ display: "flex", gap: 18, alignItems: "center", ...rowIn(f, 6) }}>
        <div style={{ borderRadius: 10, overflow: "hidden" }}>
          <Photo src="rhode.jpg" w={70} h={70} />
        </div>
        <div>
          <div style={{ fontSize: 16, color: C.ink3, fontWeight: 700, letterSpacing: "0.08em" }}>CURRENT SEO TITLE</div>
          <div style={{ fontSize: 26, fontWeight: 700, position: "relative", display: "inline-block" }}>
            Bubble Bag
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "55%",
                height: 3,
                background: C.maroon,
                width: `${ease(f, 14, 20) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 22px", ...rowIn(f, 12) }}>
        <div style={{ fontSize: 16, color: C.ink3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>GOOGLE PREVIEW</div>
        <div style={{ fontSize: 17, color: "#1a7f37" }}>kw.glam-moda.com › products › bubble-bag</div>
        <div style={{ fontSize: 25, color: "#1a0dab", marginTop: 4, minHeight: 34 }}>{typed(title, f, 18, 2.4)}</div>
        <div style={{ fontSize: 18, color: "#4d5156", marginTop: 4, lineHeight: 1.5, minHeight: 54 }}>{typed(desc, f, 34, 5)}</div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 18, ...rowIn(f, 20) }}>
        <div style={{ background: applied ? C.good : C.maroon, color: "#fff", fontWeight: 700, fontSize: 20, padding: "12px 24px", borderRadius: 8 }}>
          {applied ? "Fix applied" : "Apply fix"}
        </div>
        <span style={{ fontSize: 18, color: C.ink3 }}>KASHEF never publishes on its own</span>
      </div>
      <Cursor keys={[{ f: 40, x: 760, y: 200 }, { f: 52, x: 100, y: 430 }, { f: 56, x: 100, y: 430, click: true }, { f: 70, x: 140, y: 450 }]} />
    </Card>
  );
};

// ---------- FAHES: technical QA ----------
export const FahesCard: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    ["/", 200],
    ["/collections/bags", 200],
    ["/collections/beauty", 200],
    ["/products/le-click-east-west", 200],
    ["/cart", 200],
    ["/pages/old-offer", 404],
  ] as const;
  const scanY = interpolate(f, [8, 44], [0, rows.length * 58], clamp);
  return (
    <Card>
      <Head
        title="Site check"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            {["KW", "BH", "US"].map((s, i) => (
              <span
                key={s}
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: i === 0 ? C.maroon : C.paper,
                  color: i === 0 ? "#fff" : C.ink2,
                  border: `1px solid ${i === 0 ? C.maroon : C.line}`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        }
      />
      <div style={{ position: "relative" }}>
        {f < 46 ? (
          <div
            style={{
              position: "absolute",
              left: -32,
              right: -32,
              top: scanY - 2,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${C.maroon}, transparent)`,
              opacity: 0.6,
            }}
          />
        ) : null}
        {rows.map(([path, code], i) => {
          const seen = f >= 10 + i * 6;
          const bad = code !== 200;
          return (
            <div
              key={path}
              style={{
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: i ? `1px solid ${C.line2}` : "none",
                fontFamily: F.mono,
                fontSize: 20,
                background: bad && seen ? C.critBg : "transparent",
                margin: "0 -12px",
                padding: "0 12px",
                borderRadius: bad ? 8 : 0,
              }}
            >
              <span style={{ color: bad && seen ? C.maroon : C.ink2 }}>kw.glam-moda.com{path}</span>
              {seen ? (
                bad ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.maroon, fontWeight: 700, fontFamily: F.ui }}>
                    <TriangleAlert size={22} /> 404 · broken link flagged
                  </span>
                ) : (
                  <span style={{ color: C.good, fontWeight: 700 }}>200</span>
                )
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 18, alignItems: "center", fontSize: 19, fontWeight: 600, opacity: ease(f, 46, 54) }}>
        <span style={{ color: C.ink3 }}>Tracking</span>
        {[
          [siMeta, "Meta Pixel"],
          [siGoogleanalytics, "Analytics"],
          [siTiktok, "TikTok"],
        ].map(([icon, label]) => (
          <span key={label as string} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BrandIcon icon={icon as typeof siMeta} size={22} />
            {label as string}
            <CircleCheck size={20} color={C.good} />
          </span>
        ))}
      </div>
    </Card>
  );
};

// ---------- DHAWWAQ: shopping experience ----------
export const DhawwaqCard: React.FC = () => {
  const f = useCurrentFrame();
  const bars = [
    ["Homepage", 1.4],
    ["Product page", 1.8],
    ["Cart", 0.9],
  ] as const;
  return (
    <Card>
      <Head title="Shopping experience" right={<Chip kind="good">3 stores checked</Chip>} />
      {bars.map(([label, secs], i) => {
        const p = ease(f, 8 + i * 5, 28 + i * 5);
        return (
          <div key={label} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, fontWeight: 600, marginBottom: 8 }}>
              {label}
              <span style={{ fontWeight: 800 }}>{(secs * p).toFixed(1)}s</span>
            </div>
            <div style={{ height: 14, background: C.maroon100, borderRadius: 7 }}>
              <div style={{ height: "100%", width: `${(secs / 3) * 100 * p}%`, background: C.maroon, borderRadius: 7 }} />
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 12, marginTop: 6, ...rowIn(f, 30) }}>
        <Chip kind="good" size={18}>
          <Smartphone size={18} /> Mobile-ready
        </Chip>
        <Chip kind="good" size={18}>
          Loads under 2 seconds
        </Chip>
      </div>
      <div
        style={{
          marginTop: 20,
          background: C.paper,
          borderRadius: 14,
          padding: "18px 22px",
          borderLeft: `4px solid ${C.maroon}`,
          ...rowIn(f, 38),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: C.maroon, letterSpacing: "0.08em" }}>
          <Sparkles size={18} /> AI REVIEW
        </div>
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 29, lineHeight: 1.35, marginTop: 6 }}>
          “The hero banner is clear and inviting. The promo strip is hard to read on small screens.”
        </div>
      </div>
    </Card>
  );
};

// ---------- TAJER: sales pulse ----------
export const TajerCard: React.FC = () => {
  const f = useCurrentFrame();
  const vals = [42, 55, 38, 61, 70, 48, 66, 80, 58, 74, 90, 68, 84, 96];
  return (
    <Card>
      <Head title="14-day sales pulse" right={<Chip>KW · BH · US</Chip>} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 230, borderBottom: `1px solid ${C.line}` }}>
        {vals.map((v, i) => {
          const p = ease(f, 6 + i * 2, 20 + i * 2);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${v * p}%`,
                background: i === vals.length - 1 ? C.maroon : C.maroon200,
                borderRadius: "6px 6px 0 0",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 }}>
        {[
          ["Repeat buyers", "7", "bought twice in 14 days"],
          ["Discount share", "9%", "of gross sales"],
          ["Best day", "Thu", "highest orders"],
        ].map(([l, v, d], i) => (
          <div key={l} style={{ background: C.paper, borderRadius: 12, padding: "14px 16px", ...rowIn(f, 34 + i * 5) }}>
            <div style={{ fontSize: 16, color: C.ink3, fontWeight: 700 }}>{l}</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{v}</div>
            <div style={{ fontSize: 15, color: C.ink3 }}>{d}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ---------- RASID: Google Ads watch ----------
export const RasidCard: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    ["Search · Brand KW", "KWD 84", "21", "KWD 4.0", "good", "Best cost per sale"],
    ["PMax · Bags", "KWD 120", "14", "KWD 8.6", "plain", ""],
    ["Search · Beauty BH", "KWD 66", "9", "KWD 7.3", "plain", ""],
    ["Display · Remarketing", "KWD 48", "0", "none", "crit", "Spending, 0 sales"],
  ] as const;
  return (
    <Card>
      <Head
        title="7-day ads watch"
        right={
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700, color: C.ink2 }}>
            <BrandIcon icon={siGoogleads} size={26} /> Google Ads
          </span>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 0.8fr 1fr", fontSize: 16, fontWeight: 800, color: C.ink3, letterSpacing: "0.06em", paddingBottom: 8 }}>
        <span>CAMPAIGN</span>
        <span>COST</span>
        <span>SALES</span>
        <span>PER SALE</span>
      </div>
      {rows.map(([name, cost, conv, cpa, kind, note], i) => {
        const flag = kind === "crit" && f >= 40;
        const best = kind === "good" && f >= 32;
        return (
          <div
            key={name}
            style={{
              ...rowIn(f, 8 + i * 5),
              borderTop: `1px solid ${C.line2}`,
              padding: "12px 12px",
              margin: "0 -12px",
              borderRadius: 8,
              background: flag ? C.critBg : best ? C.goodBg : "transparent",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 0.8fr 1fr", fontSize: 21, fontWeight: 600, alignItems: "center" }}>
              <span style={{ color: flag ? C.maroon : C.ink }}>{name}</span>
              <span>{cost}</span>
              <span>{conv}</span>
              <span style={{ fontWeight: 800 }}>{cpa}</span>
            </div>
            {(flag || best) && note ? (
              <div style={{ marginTop: 6 }}>
                <Chip kind={flag ? "crit" : "good"} size={15}>
                  {note}
                </Chip>
              </div>
            ) : null}
          </div>
        );
      })}
      <div style={{ marginTop: 16, fontSize: 18, color: C.ink3, opacity: ease(f, 46, 54) }}>
        Stage 1 · read-only. Budget changes stay with the team.
      </div>
    </Card>
  );
};
