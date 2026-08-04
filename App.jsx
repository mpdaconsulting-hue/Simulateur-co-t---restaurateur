import React, { useState } from "react";
import { Calculator, Store, Settings2, Info, Check, Percent } from "lucide-react";

const C = {
  bg: "#fbf6ee", surface: "#ffffff", ink: "#231a13", soft: "#6f6356",
  line: "#ece0d0", ember: "#e0531c", emberDark: "#b73e0c", gold: "#e2a32f",
  green: "#2f7d4f", cream: "#f6ecdc", blue: "#3b6fd4", purple: "#8a4fd4",
};

const fmt = (n) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const fmtInt = (n) => Math.round(n).toLocaleString("fr-FR");

export default function App() {
  // --- L'établissement ---
  const [ordersPerDay, setOrdersPerDay] = useState(20);
  const [daysPerMonth, setDaysPerMonth] = useState(26);
  const [avgBasket, setAvgBasket] = useState(25);
  const [pctOnline, setPctOnline] = useState(50);

  // --- Forfait service MPDA (ce que TU factures, optionnel) ---
  const [mpdaFee, setMpdaFee] = useState(0);

  // --- Hypothèses (modifiables) ---
  const [creditsPerOrder, setCreditsPerOrder] = useState(15);
  const [smsPerOrder, setSmsPerOrder] = useState(2);
  const [pricePerSMS, setPricePerSMS] = useState(0.04);
  const [stripePct, setStripePct] = useState(1.5);
  const [stripeFixed, setStripeFixed] = useState(0.25);
  const [makeBase, setMakeBase] = useState(10);

  const [showParams, setShowParams] = useState(false);

  // ===== CALCULS (côté restaurateur) =====
  const ordersMonth = ordersPerDay * daysPerMonth;
  const credits = ordersMonth * creditsPerOrder;
  const blocks = Math.max(1, Math.ceil(credits / 10000));
  const makeCost = makeBase + (blocks - 1) * 11;

  const smsCost = ordersMonth * smsPerOrder * pricePerSMS;
  const onlineOrders = ordersMonth * (pctOnline / 100);
  const stripeCost = onlineOrders * (avgBasket * (stripePct / 100) + stripeFixed);

  const toolsCost = makeCost + smsCost + stripeCost; // Vercel = 0
  const totalAllIn = toolsCost + mpdaFee;
  const revenue = ordersMonth * avgBasket;
  const pctOfRevenue = revenue > 0 ? (toolsCost / revenue) * 100 : 0;
  const costPerOrder = ordersMonth > 0 ? toolsCost / ordersMonth : 0;

  const lines = [
    { label: "Hébergement (Vercel)", val: 0, color: C.green, note: "pris en charge par MPDA" },
    { label: "Make", val: makeCost, color: C.blue },
    { label: "Airtable", val: 0, color: C.gold, note: "gratuit possible · version payante 20 €/mois fortement conseillée" },
    { label: "SMS (Brevo)", val: smsCost, color: C.purple, note: "e-mails inclus / gratuits" },
    { label: "Stripe (ventes en ligne)", val: stripeCost, color: C.emberDark },
  ];
  if (mpdaFee > 0) lines.push({ label: "Forfait service MPDA", val: mpdaFee, color: C.gold });
  const maxLine = Math.max(...lines.map((l) => l.val), 0.01);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: "'DM Sans',sans-serif" }}
         className="min-h-screen w-full flex justify-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} .disp{font-family:'Fraunces',serif}
        input[type=range]{accent-color:${C.ember}}
      `}</style>

      <div className="w-full px-4 py-6" style={{ maxWidth: 560 }}>
        <div className="flex items-center gap-2 mb-1">
          <Calculator size={20} color={C.ember} />
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: C.ember }}>
            MPDA · Coût pour le restaurateur
          </span>
        </div>
        <h1 className="disp mb-2" style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>
          Combien coûte votre solution de commande chaque mois ?
        </h1>

        {/* Bandeau hébergement offert */}
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-2"
             style={{ background: "#e7f4ec", border: `1px solid ${C.green}` }}>
          <span className="rounded-full flex items-center justify-center"
                style={{ width: 26, height: 26, background: C.green, flexShrink: 0 }}>
            <Check size={15} color="#fff" />
          </span>
          <span className="text-sm" style={{ color: "#1c4a30" }}>
            <b>L'hébergement de l'app est offert</b> — pris en charge par MPDA Consulting.
          </span>
        </div>

        {/* ===== ÉTABLISSEMENT ===== */}
        <Card>
          <Head icon={<Store size={16} />} title="Votre établissement" />
          <Slider label="Commandes par jour" value={ordersPerDay} set={setOrdersPerDay} min={1} max={120} unit="" />
          <Slider label="Jours d'ouverture / mois" value={daysPerMonth} set={setDaysPerMonth} min={1} max={31} unit="" />
          <Slider label="Panier moyen" value={avgBasket} set={setAvgBasket} min={5} max={80} unit=" €" />
          <Slider label="Commandes payées en ligne" value={pctOnline} set={setPctOnline} min={0} max={100} unit=" %" />
        </Card>

        {/* ===== HYPOTHÈSES ===== */}
        <Card>
          <button onClick={() => setShowParams(!showParams)} className="w-full flex items-center justify-between">
            <Head icon={<Settings2 size={16} />} title="Hypothèses de coût" noMargin />
            <span className="text-xs font-semibold" style={{ color: C.ember }}>
              {showParams ? "Masquer" : "Ajuster"}
            </span>
          </button>
          {showParams && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Num label="Crédits Make / commande" value={creditsPerOrder} set={setCreditsPerOrder} step={1} />
              <Num label="SMS / commande" value={smsPerOrder} set={setSmsPerOrder} step={1} />
              <Num label="Prix / SMS (€)" value={pricePerSMS} set={setPricePerSMS} step={0.005} />
              <Num label="Stripe %" value={stripePct} set={setStripePct} step={0.1} />
              <Num label="Stripe fixe (€)" value={stripeFixed} set={setStripeFixed} step={0.05} />
              <Num label="Make base / mois (€)" value={makeBase} set={setMakeBase} step={1} />
              <Num label="Forfait service MPDA (€)" value={mpdaFee} set={setMpdaFee} step={5} />
            </div>
          )}
        </Card>

        {/* ===== RÉSULTAT ===== */}
        <div className="rounded-2xl p-5 mt-1" style={{ background: "#2a1c12", color: "#fff" }}>
          <span className="text-xs uppercase tracking-wide" style={{ color: C.gold }}>
            {fmtInt(ordersMonth)} commandes/mois · CA {fmt(revenue)}
          </span>

          <div className="flex flex-col gap-2.5 my-4">
            {lines.map((l) => (
              <div key={l.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#e9d8c4" }}>
                    {l.label}
                    {l.note && <span style={{ fontSize: 10, opacity: .65 }}> · {l.note}</span>}
                  </span>
                  <span className="font-semibold" style={{ color: l.val === 0 ? "#7fd1a0" : "#fff" }}>
                    {l.val === 0 ? "0,00 €" : fmt(l.val)}
                  </span>
                </div>
                <div className="rounded-full" style={{ height: 6, background: "#ffffff22" }}>
                  <div className="rounded-full" style={{ height: 6, width: `${(l.val / maxLine) * 100}%`, background: l.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3" style={{ borderTop: "1px solid #ffffff22" }}>
            <div className="text-xs" style={{ color: "#e9d8c4" }}>
              {mpdaFee > 0 ? "Coût des outils (sans le forfait)" : "Coût total pour le restaurateur"}
            </div>
            <div className="disp" style={{ fontSize: 30, fontWeight: 900 }}>
              {fmt(toolsCost)}<span style={{ fontSize: 14 }}>/mois</span>
            </div>
            {mpdaFee > 0 && (
              <div className="mt-1 text-sm" style={{ color: C.gold }}>
                Tout compris (outils + forfait MPDA) : <b>{fmt(totalAllIn)}/mois</b>
              </div>
            )}
            <div className="text-xs mt-1" style={{ color: "#e9d8c4" }}>
              soit {fmt(costPerOrder)} par commande
            </div>
          </div>
        </div>

        {/* ===== % DU CHIFFRE ===== */}
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-full flex items-center justify-center"
                  style={{ width: 44, height: 44, background: C.cream, flexShrink: 0 }}>
              <Percent size={20} color={C.emberDark} />
            </span>
            <div>
              <div className="disp" style={{ fontSize: 22, fontWeight: 900, color: C.emberDark }}>
                {pctOfRevenue.toFixed(1).replace(".", ",")} %
              </div>
              <div className="text-xs" style={{ color: C.soft }}>
                des outils par rapport au chiffre d'affaires des commandes en ligne
              </div>
            </div>
          </div>
        </Card>

        <div className="rounded-xl p-3 text-xs leading-relaxed flex gap-2" style={{ background: C.cream, color: C.emberDark }}>
          <Info size={24} style={{ flexShrink: 0 }} />
          <span>Montants indicatifs (prix vérifiés début 2026). Le restaurateur paie ses propres abonnements Make &amp; Brevo et ses frais Stripe ; l'hébergement Vercel est pris en charge par MPDA. Ce ne sont pas des conseils financiers.</span>
        </div>

        <p className="text-center text-[11px] mt-3" style={{ color: C.soft }}>
          Make Core ~10 €/10 000 crédits · Brevo SMS FR ~0,04 € (e-mails gratuits) · Stripe 1,5 % + 0,25 € (cartes EU)
        </p>
      </div>
    </div>
  );
}

/* ===== UI ===== */
function Card({ children }) {
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      {children}
    </div>
  );
}
function Head({ icon, title, noMargin }) {
  return (
    <div className={"flex items-center gap-2 " + (noMargin ? "" : "mb-3")}>
      <span style={{ color: C.ember }}>{icon}</span>
      <h2 className="font-bold" style={{ fontSize: 15 }}>{title}</h2>
    </div>
  );
}
function Slider({ label, value, set, min, max, unit }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: C.soft }}>{label}</span>
        <span className="font-bold" style={{ color: C.ink }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => set(Number(e.target.value))} className="w-full" />
    </div>
  );
}
function Num({ label, value, set, step }) {
  return (
    <div>
      <label className="text-[11px] font-semibold" style={{ color: C.soft }}>{label}</label>
      <input type="number" step={step} value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full mt-1 rounded-lg px-2 py-1.5 text-sm"
        style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.ink }} />
    </div>
  );
}
