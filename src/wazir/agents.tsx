import React from "react";
import { BrainCircuit, Bug, Crown, Eye, HandCoins, Radar, SearchCheck, Telescope, Workflow } from "lucide-react";

export type Agent = {
  key: string;
  ar: string;
  role: string;
  meaning: string; // same wording as the ops dashboard
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
};

export const WAZIR: Agent = {
  key: "WAZIR",
  ar: "وزير",
  role: "Supervisor · CEO interface",
  meaning: "the minister, trusted overseer",
  Icon: Crown,
};

export const TEAM: Agent[] = [
  { key: "NASEEJ", ar: "نسيج", role: "Automation & system health", meaning: "the fabric, holds every automation together", Icon: Workflow },
  { key: "HAFEZ", ar: "حافظ", role: "Support memory", meaning: "the keeper, remembers every answer", Icon: BrainCircuit },
  { key: "RAED", ar: "رائد", role: "Market intelligence", meaning: "the pioneer, scouts new territory", Icon: Telescope },
  { key: "KASHEF", ar: "كاشف", role: "SEO & content", meaning: "the discoverer, finds what search is missing", Icon: SearchCheck },
  { key: "FAHES", ar: "فاحص", role: "Technical QA", meaning: "the examiner, tests every page and link", Icon: Bug },
  { key: "DHAWWAQ", ar: "ذواق", role: "Shopping experience", meaning: "the connoisseur, judges how the store feels", Icon: Eye },
  { key: "TAJER", ar: "تاجر", role: "Sales & retention", meaning: "the merchant, drives the deal", Icon: HandCoins },
  { key: "RASID", ar: "راصد", role: "Google Ads", meaning: "the observer, watches spend earn", Icon: Radar },
];

export const ALL = [WAZIR, ...TEAM];
