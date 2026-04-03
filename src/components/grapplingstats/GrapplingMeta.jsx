import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, LineChart, Line,
  ReferenceLine
} from "recharts";

// ── PALETTE — aligned to grapplingprimitives tailwind tokens ────────────────
const P = {
  bg:      "#050509",
  surface: "#0E1014",
  card:    "#0E1014",
  border:  "#1C1F26",
  accent:  "#4C8DFF",
  cyan:    "#00FFFF",
  purple:  "#A970FF",
  amber:   "#f59e0b",
  amberDim:"#92400e",
  red:     "#ef4444",
  redDark: "#7f1d1d",
  emerald: "#10b981",
  blue:    "#60a5fa",
  orange:  "#fb923c",
  text:    "#E5E7EB",
  muted:   "#9CA3AF",
  dim:     "#7B8290",
  dimBg:   "#1C1F26",
  fin:     "#ef4444",
  fail:    "#1C1F26",
};

const FONT = "'Source Code Pro', 'Courier New', monospace";
const FONT_DISPLAY = "'DS-Digital', monospace";

// ── SIZE TOKENS — 12px minimum for all readable text ────────────────────────
const S = {
  chrome: 12,  // toolbar, labels, axis ticks, notes, tiny annotations
  sm:     12,  // secondary text, captions, button labels
  base:   13,  // body text, list items, card descriptions
  md:     14,  // chart titles, source names, section labels
  lg:     16,  // stat card labels, technique names
};

// ── SUBMISSION FAMILIES ─────────────────────────────────────────────────────
const FAMILIES = {
  "Heel Hook":      { techs: ["Inside HH","Outside HH","Aoki Lock"], cat: "Leg" },
  "Ankle/Foot":     { techs: ["Ankle Lock","Estima Lock","C.Terra"], cat: "Leg" },
  "RNC":            { techs: ["RNC"], cat: "Choke" },
  "Armbar":         { techs: ["Armbar","Inv. Armbar","Choi Bar"], cat: "Arm" },
  "Guillotine":     { techs: ["Guillotine","Anaconda","Darce"], cat: "Choke" },
  "Leg Triangle":   { techs: ["Triangle","Side Triangle","Rear Triangle"], cat: "Choke" },
  "Arm Triangle":   { techs: ["Arm Triangle","No Arm Triangle"], cat: "Choke" },
  "Shoulder":       { techs: ["Kimura","Americana","Omoplata"], cat: "Arm" },
  "Misc Choke":     { techs: ["Smother","Ezekiel","NS Choke","Buggy Choke","Gogoplata"], cat: "Choke" },
  "Other":          { techs: ["Dead Orchard","Wrist Lock","Suloev Stretch","Toe Hold","Calf Slicer",
                               "Kneebar","Linns Lock","Z-lock","Texas","Baratoplata","Twister",
                               "E.Chair/B.Split","Dogbar"], cat: "Other" },
};

// Reverse lookup: technique name → family name
const TECH_TO_FAMILY = {};
for (const [fam, { techs }] of Object.entries(FAMILIES)) {
  for (const t of techs) TECH_TO_FAMILY[t] = fam;
}

// Aggregate technique data into family groups
const groupByFamily = (data) => {
  const grouped = {};
  for (const d of data) {
    const fam = TECH_TO_FAMILY[d.t] || "Other";
    if (!grouped[fam]) grouped[fam] = { t: fam, fin: 0, fail: 0, cat: FAMILIES[fam]?.cat || "Other", members: [] };
    grouped[fam].fin += d.fin;
    grouped[fam].fail += d.fail;
    if (d.total > 0) grouped[fam].members.push(d);
  }
  return Object.values(grouped)
    .map(d => ({ ...d, total: d.fin + d.fail, rate: d.fin + d.fail > 0 ? +((d.fin / (d.fin + d.fail)) * 100).toFixed(1) : 0 }))
    .filter(d => d.total > 0);
};

const catColor = c =>
  c === "Choke" ? P.amber : c === "Leg" ? P.emerald : c === "Arm" ? P.blue : P.purple;

// ── DATA ─────────────────────────────────────────────────────────────────────

// WNO events — per-technique attempts + finishes
// Source: The Grappling Conjecture (chart images, hand-read)
// To add a new event: add entry to WNO_EVENTS, data auto-aggregates

const WNO_EVENTS = {
  // WNO 29 — full attempt data (TGC chart, human-verified)
  // 4 finishes / 38 attempts = 10.5% overall
  29: {
    date: "2025", matches: null, source: "TGC WNO 29",
    data: [
      {t:"RNC",            fin:0, fail:5,  cat:"Choke"},
      {t:"Inside HH",      fin:1, fail:1,  cat:"Leg"},
      {t:"Outside HH",     fin:0, fail:3,  cat:"Leg"},
      {t:"Armbar",         fin:0, fail:1,  cat:"Arm"},
      {t:"Ankle Lock",     fin:0, fail:11, cat:"Leg"},
      {t:"Arm Triangle",   fin:0, fail:3,  cat:"Choke"},
      {t:"Toe Hold",       fin:1, fail:0,  cat:"Leg"},
      {t:"Kimura",         fin:0, fail:1,  cat:"Arm"},
      {t:"Darce",          fin:0, fail:1,  cat:"Choke"},
      {t:"Choi Bar",       fin:0, fail:1,  cat:"Arm"},
      {t:"Smother",        fin:0, fail:3,  cat:"Choke"},
      {t:"Ezekiel",        fin:1, fail:0,  cat:"Choke"},
      {t:"Omoplata",       fin:0, fail:3,  cat:"Arm"},
      {t:"Aoki Lock",      fin:1, fail:1,  cat:"Leg"},
      {t:"Suloev Stretch", fin:0, fail:1,  cat:"Leg"},
      {t:"Calf Slicer",    fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 27 — full attempt data (TGC chart, human-verified)
  // 8 finishes / 38 attempts = 21.1% overall
  27: {
    date: "2025", matches: null, source: "TGC WNO 27",
    data: [
      {t:"RNC",           fin:1, fail:7,  cat:"Choke"},
      {t:"Inside HH",     fin:1, fail:3,  cat:"Leg"},
      {t:"Outside HH",    fin:0, fail:1,  cat:"Leg"},
      {t:"Armbar",        fin:0, fail:2,  cat:"Arm"},
      {t:"Ankle Lock",    fin:1, fail:6,  cat:"Leg"},
      {t:"Guillotine",    fin:0, fail:4,  cat:"Choke"},
      {t:"Triangle",      fin:1, fail:1,  cat:"Choke"},
      {t:"Arm Triangle",  fin:0, fail:2,  cat:"Choke"},
      {t:"Toe Hold",      fin:0, fail:1,  cat:"Leg"},
      {t:"Kimura",        fin:1, fail:0,  cat:"Arm"},
      {t:"Choi Bar",      fin:0, fail:1,  cat:"Arm"},
      {t:"Smother",       fin:0, fail:1,  cat:"Choke"},
      {t:"Omoplata",      fin:1, fail:0,  cat:"Arm"},
      {t:"Rear Triangle", fin:0, fail:1,  cat:"Choke"},
      {t:"Americana",     fin:1, fail:0,  cat:"Arm"},
      {t:"Dead Orchard",  fin:0, fail:1,  cat:"Leg"},
      {t:"Estima Lock",   fin:1, fail:0,  cat:"Leg"},
      {t:"Wrist Lock",    fin:0, fail:1,  cat:"Arm"},
    ],
    partial: false,
  },
  // WNO 28 — full attempt data (TGC chart, human-verified)
  // 6 finishes / 35 attempts = 17.1% overall
  28: {
    date: "2025", matches: null, source: "TGC WNO 28",
    data: [
      {t:"RNC",          fin:0, fail:5,  cat:"Choke"},
      {t:"Inside HH",    fin:3, fail:5,  cat:"Leg"},
      {t:"Outside HH",   fin:0, fail:2,  cat:"Leg"},
      {t:"Ankle Lock",   fin:0, fail:4,  cat:"Leg"},
      {t:"Guillotine",   fin:0, fail:4,  cat:"Choke"},
      {t:"Kneebar",      fin:1, fail:1,  cat:"Leg"},
      {t:"Toe Hold",     fin:0, fail:3,  cat:"Leg"},
      {t:"Darce",        fin:1, fail:0,  cat:"Choke"},
      {t:"Choi Bar",     fin:0, fail:2,  cat:"Arm"},
      {t:"Anaconda",     fin:1, fail:1,  cat:"Choke"},
      {t:"Estima Lock",  fin:0, fail:1,  cat:"Leg"},
      {t:"Calf Slicer",  fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 25 — full attempt data (TGC chart, human-verified)
  // 3 finishes / 70 attempts = 4.3% overall
  25: {
    date: "2024", matches: null, source: "TGC WNO 25",
    data: [
      {t:"RNC",           fin:0, fail:5,  cat:"Choke"},
      {t:"Inside HH",     fin:0, fail:13, cat:"Leg"},
      {t:"Outside HH",    fin:0, fail:6,  cat:"Leg"},
      {t:"Armbar",        fin:0, fail:1,  cat:"Arm"},
      {t:"Ankle Lock",    fin:1, fail:20, cat:"Leg"},
      {t:"Guillotine",    fin:1, fail:1,  cat:"Choke"},
      {t:"Triangle",      fin:0, fail:2,  cat:"Choke"},
      {t:"Kneebar",       fin:0, fail:1,  cat:"Leg"},
      {t:"Arm Triangle",  fin:0, fail:1,  cat:"Choke"},
      {t:"Toe Hold",      fin:0, fail:2,  cat:"Leg"},
      {t:"Kimura",        fin:0, fail:2,  cat:"Arm"},
      {t:"Darce",         fin:0, fail:1,  cat:"Choke"},
      {t:"Choi Bar",      fin:0, fail:1,  cat:"Arm"},
      {t:"Smother",       fin:0, fail:4,  cat:"Choke"},
      {t:"Ezekiel",       fin:1, fail:1,  cat:"Choke"},
      {t:"Omoplata",      fin:0, fail:2,  cat:"Arm"},
      {t:"Inv. Armbar",   fin:0, fail:2,  cat:"Arm"},
      {t:"Rear Triangle", fin:0, fail:1,  cat:"Choke"},
      {t:"Calf Slicer",   fin:0, fail:1,  cat:"Leg"},
      {t:"Buggy Choke",   fin:0, fail:1,  cat:"Choke"},
    ],
    partial: false,
  },
  // WNO 26 — full attempt data (TGC chart, human-verified)
  // 5 finishes / 57 attempts = 8.8% overall
  26: {
    date: "2025", matches: null, source: "TGC WNO 26",
    data: [
      {t:"RNC",            fin:1, fail:0,  cat:"Choke"},
      {t:"Inside HH",      fin:1, fail:9,  cat:"Leg"},
      {t:"Outside HH",     fin:0, fail:8,  cat:"Leg"},
      {t:"Armbar",         fin:1, fail:0,  cat:"Arm"},
      {t:"Ankle Lock",     fin:0, fail:8,  cat:"Leg"},
      {t:"Guillotine",     fin:1, fail:10, cat:"Choke"},
      {t:"Triangle",       fin:0, fail:4,  cat:"Choke"},
      {t:"Arm Triangle",   fin:0, fail:3,  cat:"Choke"},
      {t:"Toe Hold",       fin:0, fail:1,  cat:"Leg"},
      {t:"Kimura",         fin:0, fail:1,  cat:"Arm"},
      {t:"Choi Bar",       fin:0, fail:1,  cat:"Arm"},
      {t:"Ezekiel",        fin:0, fail:1,  cat:"Choke"},
      {t:"Omoplata",       fin:0, fail:2,  cat:"Arm"},
      {t:"Anaconda",       fin:0, fail:2,  cat:"Choke"},
      {t:"Inv. Armbar",    fin:0, fail:1,  cat:"Arm"},
      {t:"Rear Triangle",  fin:0, fail:1,  cat:"Choke"},
      {t:"Americana",      fin:1, fail:1,  cat:"Arm"},
      {t:"Estima Lock",    fin:0, fail:1,  cat:"Leg"},
      {t:"Suloev Stretch", fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 24 — full attempt data (TGC chart, human-verified)
  // 6 finishes / 71 attempts = 8.5% overall
  24: {
    date: "2024", matches: null, source: "TGC WNO 24",
    data: [
      {t:"RNC",           fin:4, fail:13, cat:"Choke"},
      {t:"Inside HH",     fin:0, fail:4,  cat:"Leg"},
      {t:"Outside HH",    fin:1, fail:5,  cat:"Leg"},
      {t:"Armbar",        fin:0, fail:3,  cat:"Arm"},
      {t:"Ankle Lock",    fin:0, fail:4,  cat:"Leg"},
      {t:"Guillotine",    fin:0, fail:4,  cat:"Choke"},
      {t:"Triangle",      fin:0, fail:2,  cat:"Choke"},
      {t:"Kneebar",       fin:0, fail:1,  cat:"Leg"},
      {t:"Arm Triangle",  fin:0, fail:2,  cat:"Choke"},
      {t:"Toe Hold",      fin:0, fail:4,  cat:"Leg"},
      {t:"Kimura",        fin:0, fail:6,  cat:"Arm"},
      {t:"Choi Bar",      fin:1, fail:2,  cat:"Arm"},
      {t:"Smother",       fin:0, fail:6,  cat:"Choke"},
      {t:"Omoplata",      fin:0, fail:3,  cat:"Arm"},
      {t:"Aoki Lock",     fin:0, fail:5,  cat:"Leg"},
      {t:"Estima Lock",   fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 22 — full attempt data (TGC chart, human-verified)
  // 6 finishes / 41 attempts = 14.6% overall
  22: {
    date: "2024", matches: null, source: "TGC WNO 22",
    data: [
      {t:"RNC",           fin:1, fail:1,  cat:"Choke"},
      {t:"Inside HH",     fin:0, fail:1,  cat:"Leg"},
      {t:"Outside HH",    fin:2, fail:5,  cat:"Leg"},
      {t:"Armbar",        fin:1, fail:5,  cat:"Arm"},
      {t:"Ankle Lock",    fin:0, fail:4,  cat:"Leg"},
      {t:"Guillotine",    fin:0, fail:4,  cat:"Choke"},
      {t:"Triangle",      fin:0, fail:2,  cat:"Choke"},
      {t:"Kneebar",       fin:0, fail:2,  cat:"Leg"},
      {t:"Arm Triangle",  fin:0, fail:1,  cat:"Choke"},
      {t:"Toe Hold",      fin:0, fail:2,  cat:"Leg"},
      {t:"Kimura",        fin:0, fail:1,  cat:"Arm"},
      {t:"Darce",         fin:0, fail:1,  cat:"Choke"},
      {t:"Choi Bar",      fin:0, fail:4,  cat:"Arm"},
      {t:"Smother",       fin:0, fail:1,  cat:"Choke"},
      {t:"Ezekiel",       fin:0, fail:1,  cat:"Choke"},
      {t:"Omoplata",      fin:0, fail:3,  cat:"Arm"},
      {t:"Inv. Armbar",   fin:0, fail:1,  cat:"Arm"},
      {t:"Aoki Lock",     fin:1, fail:0,  cat:"Leg"},
      {t:"Americana",     fin:1, fail:0,  cat:"Arm"},
      {t:"Gogoplata",     fin:0, fail:1,  cat:"Choke"},
    ],
    partial: false,
  },
  // WNO 30 — full attempt data (TGC chart, human-verified)
  // 4 finishes / 65 attempts = 6.2% overall
  30: {
    date: "2025", matches: null, source: "TGC WNO 30",
    data: [
      {t:"RNC",          fin:1, fail:3,  cat:"Choke"},
      {t:"Inside HH",    fin:0, fail:5,  cat:"Leg"},
      {t:"Outside HH",   fin:0, fail:4,  cat:"Leg"},
      {t:"Armbar",       fin:2, fail:7,  cat:"Arm"},
      {t:"Ankle Lock",   fin:0, fail:14, cat:"Leg"},
      {t:"Guillotine",   fin:0, fail:1,  cat:"Choke"},
      {t:"Triangle",     fin:0, fail:2,  cat:"Choke"},
      {t:"Kneebar",      fin:0, fail:3,  cat:"Leg"},
      {t:"Arm Triangle", fin:0, fail:3,  cat:"Choke"},
      {t:"Toe Hold",     fin:0, fail:2,  cat:"Leg"},
      {t:"Kimura",       fin:0, fail:3,  cat:"Arm"},
      {t:"Darce",        fin:1, fail:1,  cat:"Choke"},
      {t:"Choi Bar",     fin:0, fail:1,  cat:"Arm"},
      {t:"Omoplata",     fin:0, fail:3,  cat:"Arm"},
      {t:"Aoki Lock",    fin:0, fail:3,  cat:"Leg"},
      {t:"Americana",    fin:0, fail:2,  cat:"Arm"},
      {t:"Calf Slicer",  fin:0, fail:2,  cat:"Leg"},
      {t:"Wrist Lock",   fin:0, fail:1,  cat:"Arm"},
      {t:"C.Terra",      fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 31 — Dec 2025 — full attempt data (TGC chart, human-verified OCR)
  // 10 matches, 6 finishes / 35 attempts = 17.1% overall
  31: {
    date: "Dec 2025", matches: 10, source: "TGC WNO 31",
    data: [
      {t:"RNC",           fin:1, fail:2,  cat:"Choke"},
      {t:"Inside HH",     fin:0, fail:3,  cat:"Leg"},
      {t:"Outside HH",    fin:1, fail:0,  cat:"Leg"},
      {t:"Armbar",        fin:0, fail:2,  cat:"Arm"},
      {t:"Ankle Lock",    fin:0, fail:10, cat:"Leg"},
      {t:"Guillotine",    fin:0, fail:1,  cat:"Choke"},
      {t:"Arm Triangle",  fin:0, fail:5,  cat:"Choke"},
      {t:"Toe Hold",      fin:0, fail:1,  cat:"Leg"},
      {t:"Darce",         fin:1, fail:0,  cat:"Choke"},
      {t:"Ezekiel",       fin:0, fail:1,  cat:"Choke"},
      {t:"Omoplata",      fin:0, fail:1,  cat:"Arm"},
      {t:"Inv. Armbar",   fin:0, fail:2,  cat:"Arm"},
      {t:"Aoki Lock",     fin:2, fail:0,  cat:"Leg"},
      {t:"Rear Triangle", fin:1, fail:0,  cat:"Choke"},
      {t:"Estima Lock",   fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
  // WNO 32 — Apr 2026 — full attempt data (TGC chart, human-verified OCR)
  // 13 matches, 5 finishes / 60 attempts = 8.3% overall
  32: {
    date: "Apr 2026", matches: 13, source: "TGC WNO 32",
    data: [
      {t:"RNC",          fin:2, fail:3,  cat:"Choke"},
      {t:"Inside HH",    fin:0, fail:2,  cat:"Leg"},
      {t:"Armbar",       fin:0, fail:4,  cat:"Arm"},
      {t:"Ankle Lock",   fin:1, fail:23, cat:"Leg"},
      {t:"Guillotine",   fin:0, fail:4,  cat:"Choke"},
      {t:"Kneebar",      fin:0, fail:2,  cat:"Leg"},
      {t:"Arm Triangle", fin:0, fail:3,  cat:"Choke"},
      {t:"Kimura",       fin:0, fail:2,  cat:"Arm"},
      {t:"Choi Bar",     fin:0, fail:4,  cat:"Arm"},
      {t:"Smother",      fin:0, fail:1,  cat:"Choke"},
      {t:"Inv. Armbar",  fin:1, fail:1,  cat:"Arm"},
      {t:"Aoki Lock",    fin:1, fail:2,  cat:"Leg"},
      {t:"Linns Lock",   fin:0, fail:1,  cat:"Leg"},
      {t:"Calf Slicer",  fin:0, fail:1,  cat:"Leg"},
      {t:"Buggy Choke",  fin:0, fail:1,  cat:"Choke"},
      {t:"C.Terra",      fin:0, fail:1,  cat:"Leg"},
    ],
    partial: false,
  },
};

const processRaw = (raw) => raw.map(d => ({
  ...d, total: d.fin + d.fail,
  rate: d.fin + d.fail > 0 ? +((d.fin / (d.fin + d.fail)) * 100).toFixed(1) : 0,
}));

const WNO32_ATT = processRaw(WNO_EVENTS[32].data);

// Aggregate all WNO events with full attempt data
const WNO_AGG = (() => {
  const fullEvents = Object.values(WNO_EVENTS).filter(e => !e.partial);
  const byTech = {};
  for (const evt of fullEvents) {
    for (const d of evt.data) {
      if (!byTech[d.t]) byTech[d.t] = { t: d.t, fin: 0, fail: 0, cat: d.cat };
      byTech[d.t].fin += d.fin;
      byTech[d.t].fail += d.fail;
    }
  }
  return processRaw(Object.values(byTech));
})();

// ADCC 2022 — Source: The Grappling Conjecture ADCC 2022 meta
const ADCC22_ATT = [
  {t:"Guillotine",  fin:3,  fail:29, cat:"Choke"},
  {t:"RNC",         fin:11, fail:19, cat:"Choke"},
].map(d => ({ ...d, total: d.fin + d.fail, rate: +((d.fin / (d.fin + d.fail)) * 100).toFixed(1) }));

// 2023 Nogi Annual — completion rates only
const NOGI23_PCT = [
  {t:"RNC",         pct:41.8, cat:"Choke"},
  {t:"Armbar",      pct:31.8, cat:"Arm"},
  {t:"Kimura",      pct:28.8, cat:"Arm"},
  {t:"Inside HH",   pct:28.7, cat:"Leg"},
  {t:"Outside HH",  pct:15.7, cat:"Leg"},
];

// 2024 Nogi Annual — completion rates only
const NOGI24_PCT = [
  {t:"Kneebar",     pct:27.2, cat:"Leg"},
  {t:"RNC",         pct:25.7, cat:"Choke"},
  {t:"Anaconda",    pct:22.7, cat:"Choke"},
  {t:"Darce",       pct:22.5, cat:"Choke"},
  {t:"Inside HH",   pct:21.2, cat:"Leg"},
];

// UFC — FightMatrix.com
const UFC = [
  {y:1993,n:8,  ko:37.5,sub:62.5,dec:0},  {y:1994,n:31, ko:25.8,sub:74.2,dec:0},
  {y:1995,n:40, ko:25.0,sub:62.5,dec:12.5},{y:1996,n:43, ko:44.2,sub:44.2,dec:11.6},
  {y:1997,n:41, ko:34.1,sub:43.9,dec:19.5},{y:1998,n:25, ko:40.0,sub:32.0,dec:28.0},
  {y:1999,n:44, ko:52.3,sub:22.7,dec:25.0},{y:2000,n:43, ko:27.9,sub:30.2,dec:39.5},
  {y:2001,n:40, ko:42.5,sub:22.5,dec:30.0},{y:2002,n:53, ko:50.9,sub:18.9,dec:28.3},
  {y:2003,n:41, ko:43.9,sub:19.5,dec:34.1},{y:2004,n:39, ko:43.6,sub:30.8,dec:25.6},
  {y:2005,n:80, ko:47.5,sub:27.5,dec:23.8},{y:2006,n:158,ko:34.8,sub:32.3,dec:32.9},
  {y:2007,n:171,ko:30.4,sub:32.2,dec:36.3},{y:2008,n:201,ko:41.3,sub:26.9,dec:31.8},
  {y:2009,n:215,ko:33.0,sub:23.3,dec:42.8},{y:2010,n:253,ko:26.5,sub:24.1,dec:49.0},
  {y:2011,n:300,ko:31.0,sub:19.0,dec:49.0},{y:2012,n:341,ko:30.8,sub:20.5,dec:46.3},
  {y:2013,n:386,ko:33.4,sub:17.6,dec:46.4},{y:2014,n:503,ko:29.8,sub:19.3,dec:49.3},
  {y:2015,n:473,ko:32.8,sub:18.6,dec:46.7},{y:2016,n:493,ko:31.0,sub:18.1,dec:50.3},
  {y:2017,n:457,ko:31.7,sub:17.7,dec:49.2},{y:2018,n:474,ko:31.9,sub:19.0,dec:48.3},
  {y:2019,n:516,ko:29.5,sub:15.9,dec:53.9},{y:2020,n:456,ko:31.1,sub:18.4,dec:49.6},
  {y:2021,n:509,ko:33.4,sub:14.7,dec:50.5},{y:2022,n:538,ko:33.5,sub:19.7,dec:46.5},
  {y:2023,n:549,ko:30.8,sub:19.5,dec:47.7},{y:2024,n:548,ko:27.6,sub:16.1,dec:55.3},
  {y:2025,n:551,ko:32.8,sub:17.4,dec:49.2},
];

// Nogi annual sub rates
const NOGI = [
  {y:2021,sub:50.2},{y:2022,sub:48.3},
  {y:2023,sub:46.4,comp:17.8},{y:2024,sub:45.4,comp:15.0},
];

// Top 10 sub rankings
const TOP10 = {
  2022:[{t:"RNC",c:"Choke"},{t:"Inside HH",c:"Leg"},{t:"Armbar",c:"Arm"},{t:"Outside HH",c:"Leg"},
    {t:"Guillotine",c:"Choke"},{t:"Triangle",c:"Choke"},{t:"Ankle Lock",c:"Leg"},
    {t:"Kneebar",c:"Leg"},{t:"Arm Triangle",c:"Choke"},{t:"Kimura",c:"Arm"}],
  2023:[{t:"RNC",c:"Choke"},{t:"Inside HH",c:"Leg"},{t:"Outside HH",c:"Leg"},{t:"Armbar",c:"Arm"},
    {t:"Ankle Lock",c:"Leg"},{t:"Guillotine",c:"Choke"},{t:"Triangle",c:"Choke"},
    {t:"Kneebar",c:"Leg"},{t:"Arm Triangle",c:"Choke"},{t:"Darce/Toehold",c:"Choke"}],
  2024:[{t:"RNC",c:"Choke"},{t:"Inside HH",c:"Leg"},{t:"Armbar",c:"Arm"},{t:"Outside HH",c:"Leg"},
    {t:"Ankle Lock",c:"Leg"},{t:"Guillotine",c:"Choke"},{t:"Kneebar",c:"Leg"},
    {t:"Triangle",c:"Choke"},{t:"Arm Triangle",c:"Choke"},{t:"Aoki Lock",c:"Leg"}],
};

const GI23 = [
  {t:"Choke from Back",p:44.68,c:"Choke"},{t:"Armbar",p:21.28,c:"Arm"},
  {t:"Triangle",p:8.51,c:"Choke"},{t:"Other",p:25.53,c:"Other"},
];

// ── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "10px 14px",
      fontFamily: FONT, fontSize: S.base, color: P.text, minWidth: 140 }}>
      <div style={{ color: P.muted, marginBottom: 5, fontSize: S.chrome }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill || P.accent, marginBottom: 2 }}>
          {p.name}: <b style={{ color: P.text }}>
            {typeof p.value === "number" ? p.name?.includes("%") || p.dataKey?.includes("rate") || p.dataKey?.includes("pct") || p.dataKey === "rate"
              ? `${p.value.toFixed(1)}%` : p.value : p.value}
          </b>
        </div>
      ))}
    </div>
  );
};

const SL = ({ children, mt = 0 }) => (
  <div style={{ fontFamily: FONT, fontSize: S.chrome, letterSpacing: 3,
    textTransform: "uppercase", color: P.muted, marginBottom: 10, marginTop: mt,
    borderBottom: `1px solid ${P.border}`, paddingBottom: 5 }}>{children}</div>
);

const St = ({ label, value, sub, ac = P.accent }) => (
  <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px", flex: 1, minWidth: 120 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 2.5vw + 10px, 26px)", color: ac, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.text, marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    {sub && <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginTop: 3 }}>{sub}</div>}
  </div>
);

const Note = ({ children }) => (
  <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginTop: 5, textAlign: "right", lineHeight: 1.6 }}>{children}</div>
);

const Ins = ({ items }) => (
  <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px",
    fontFamily: FONT, fontSize: S.chrome, color: P.muted, lineHeight: 2 }}>
    {items.map((t, i) => <div key={i}><span style={{ color: P.accent }}>▶</span> {t}</div>)}
  </div>
);

// Attempts vs Finishes chart
const AttFinChart = ({ data, title, note, height = 280, sortBy = "total", minAtt = 0, minFin = 0 }) => {
  const sorted = [...data]
    .filter(d => d.total > 0 && d.total >= minAtt && d.fin >= minFin)
    .sort((a, b) => sortBy === "total" ? b.total - a.total : sortBy === "fin" ? b.fin - a.fin || b.rate - a.rate : b.rate - a.rate);

  return (
    <div>
      {title && <div style={{ fontFamily: FONT, fontSize: S.md, color: P.text,
        letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sorted} margin={{ top: 14, right: 10, left: -18, bottom: 60 }}>
          <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t"
            tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome, fontWeight: 600 }}
            angle={-45} textAnchor="end" interval={0}
          />
          <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} allowDecimals={false} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = sorted.find(x => x.t === label);
            return (
              <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "10px 14px",
                fontFamily: FONT, fontSize: S.base, color: P.text }}>
                <div style={{ color: catColor(d?.cat || ""), marginBottom: 5, fontWeight: 700 }}>{label}</div>
                <div style={{ color: P.fin }}>Finishes: {d?.fin}</div>
                <div style={{ color: P.muted }}>Defended: {d?.fail}</div>
                <div style={{ color: P.text }}>Total: {d?.total} attempts</div>
                <div style={{ color: P.accent, marginTop: 4, fontWeight: 700 }}>Completion: {d?.rate}%</div>
              </div>
            );
          }} />
          <Legend iconType="square" wrapperStyle={{ fontFamily: FONT, fontSize: S.chrome, paddingTop: 60 }} />
          <Bar dataKey="fail" name="Defended" stackId="a" fill={P.fail}>
            {sorted.map((_, i) => <Cell key={i} fill={P.dimBg} />)}
          </Bar>
          <Bar dataKey="fin" name="Finished" stackId="a" radius={[2, 2, 0, 0]}>
            {sorted.map((d, i) => <Cell key={i} fill={d.fin > 0 ? P.fin : P.dimBg} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Completion rate strip */}
      <div style={{ display: "flex", gap: 2, marginTop: -8, flexWrap: "nowrap", overflowX: "auto" }}>
        {sorted.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 32, textAlign: "center",
            background: `${catColor(d.cat)}${d.rate > 0 ? "22" : "11"}`,
            border: `1px solid ${catColor(d.cat)}${d.rate > 0 ? "66" : "22"}`,
            padding: "4px 2px" }}>
            <div style={{ fontFamily: FONT, fontSize: S.chrome,
              color: d.rate > 0 ? catColor(d.cat) : P.dim, fontWeight: d.rate > 0 ? 700 : 400 }}>
              {d.rate > 0 ? `${d.rate}%` : "—"}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, flexWrap: "nowrap", overflowX: "auto", marginTop: 1 }}>
        {sorted.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 32, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted }}>{d.total}att</div>
          </div>
        ))}
      </div>
      {note && <Note>{note}</Note>}
    </div>
  );
};

// Completion rate only chart
const PctChart = ({ data, height = 160, note }) => (
  <div>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={[...data].sort((a, b) => b.pct - a.pct)} layout="vertical"
        margin={{ top: 4, right: 50, left: 95, bottom: 4 }}>
        <CartesianGrid stroke={P.border} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }}
          tickFormatter={v => `${v}%`} domain={[0, 50]} />
        <YAxis type="category" dataKey="t" width={95}
          tick={{ fill: P.text, fontFamily: FONT, fontSize: S.sm }} />
        <Tooltip content={<TT />} />
        <Bar dataKey="pct" name="Completion %" radius={[0, 3, 3, 0]}>
          {data.map((d, i) => <Cell key={i} fill={catColor(d.cat)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    {note && <Note>{note}</Note>}
  </div>
);

// Family chart — grouped bars with hover detail
const FamilyChart = ({ data, height = 300, note, sortBy = "total" }) => {
  const sorted = [...data]
    .filter(d => sortBy === "famRate" ? d.total >= 5 : sortBy === "famFin" ? d.fin >= 1 : true)
    .sort((a, b) => sortBy === "famRate" ? b.rate - a.rate : sortBy === "famFin" ? b.fin - a.fin || b.rate - a.rate : b.total - a.total);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sorted} margin={{ top: 14, right: 10, left: -18, bottom: 60 }}>
          <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t"
            tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome, fontWeight: 600 }}
            angle={-35} textAnchor="end" interval={0}
          />
          <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} allowDecimals={false} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = sorted.find(x => x.t === label);
            if (!d) return null;
            return (
              <div style={{ background: P.bg, border: `1px solid ${catColor(d.cat)}`, padding: "10px 14px",
                fontFamily: FONT, fontSize: S.base, color: P.text, maxWidth: 280 }}>
                <div style={{ color: catColor(d.cat), marginBottom: 5, fontWeight: 700, fontSize: S.md }}>{label}</div>
                <div style={{ color: P.fin }}>Finished: {d.fin}</div>
                <div style={{ color: P.muted }}>Defended: {d.fail}</div>
                <div style={{ color: P.text }}>Total: {d.total} attempts</div>
                <div style={{ color: P.accent, marginTop: 4, fontWeight: 700 }}>{d.rate}% completion</div>
                {d.members && d.members.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: `1px solid ${P.border}`, paddingTop: 6 }}>
                    <div style={{ fontSize: S.chrome, color: P.muted, marginBottom: 4 }}>BREAKDOWN:</div>
                    {[...d.members].sort((a, b) => b.total - a.total).map((m, i) => (
                      <div key={i} style={{ fontSize: S.chrome, color: P.text, lineHeight: 1.8 }}>
                        {m.t}: <span style={{ color: P.fin }}>{m.fin}fin</span> / <span style={{ color: P.muted }}>{m.fail}def</span> = {m.total}att
                        {m.rate > 0 && <span style={{ color: P.accent }}> ({m.rate}%)</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }} />
          <Legend iconType="square" wrapperStyle={{ fontFamily: FONT, fontSize: S.chrome, paddingTop: 60 }} />
          <Bar dataKey="fail" name="Defended" stackId="a" fill={P.fail}>
            {sorted.map((d, i) => <Cell key={i} fill={P.dimBg} />)}
          </Bar>
          <Bar dataKey="fin" name="Finished" stackId="a" radius={[2, 2, 0, 0]}>
            {sorted.map((d, i) => <Cell key={i} fill={d.fin > 0 ? catColor(d.cat) : P.dimBg} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Completion rate strip */}
      <div style={{ display: "flex", gap: 2, marginTop: -8, flexWrap: "nowrap", overflowX: "auto" }}>
        {sorted.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 40, textAlign: "center",
            background: `${catColor(d.cat)}${d.rate > 0 ? "22" : "11"}`,
            border: `1px solid ${catColor(d.cat)}${d.rate > 0 ? "66" : "22"}`,
            padding: "4px 2px" }}>
            <div style={{ fontFamily: FONT, fontSize: S.chrome,
              color: d.rate > 0 ? catColor(d.cat) : P.dim, fontWeight: d.rate > 0 ? 700 : 400 }}>
              {d.rate > 0 ? `${d.rate}%` : "—"}
            </div>
          </div>
        ))}
      </div>
      {note && <Note>{note}</Note>}
    </div>
  );
};

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = ["WNO", "ADCC", "UFC / MMA", "Nogi Annual", "Technique Ranks", "Gi / IBJJF", "Sources"];

// ── ADCC DATA ───────────────────────────────────────────────────────────────

const ADCC_WORLDS = [
  {
    year: 2024, location: "Las Vegas, T-Mobile Arena", subRate: 42.7, totalSubs: 45,
    top: [
      { t: "RNC", pct: 25, cat: "Choke" },
      { t: "Armbar", pct: 20, cat: "Arm" },
      { t: "Guillotine", pct: 10, cat: "Choke" },
      { t: "Heel Hook", pct: 10, cat: "Leg" },
      { t: "Triangle", pct: 8, cat: "Choke" },
    ],
    catSplit: { chokes: 65, arms: 20, legs: 15 },
    action: { subAttRate: 19, tdRate: 22, passRate: 16, sweepRate: 21, actionScore: 7.33 },
    hhFinishes: 4,
    notes: [
      "Heel hook finishes at lowest recent ADCC — defense maturing",
      "Ankle lock used as IHH alternative — toe-point defense leaves ankle exposed",
      "Wrestling → back → RNC = dominant path",
      "HQ position widely used defensively",
      "Women's field expanded (new weight + absolute)",
    ],
  },
  {
    year: 2022, location: "Las Vegas, Thomas & Mack", subRate: 36, totalSubs: 40,
    top: [
      { t: "RNC", pct: 27.5, cat: "Choke", att: 30, fin: 11, rate: 36.6 },
      { t: "Guillotine", pct: null, cat: "Choke", att: 32, fin: 3, rate: 9.3 },
      { t: "Heel Hook", pct: 12.5, cat: "Leg", fin: 5 },
    ],
    catSplit: { chokes: 22.1, arms: 12.0, legs: 16.0 },  // completion rates
    catSplitLabel: "completion %",
    overallAttRate: 17.6,
    hhFinishes: 5,
    notes: [
      "Guillotine: most attempted (~32) but only 9.3% completion",
      "RNC: 36.6% completion — highest efficiency",
      "Overall attempt-to-finish rate: 17.6%",
      "-77kg: 56% sub rate (best division) — Kade Ruotolo 4/4 by sub",
      "Rare subs: Estima lock, Aoki lock, Z-lock, Linns lock, Choi bar",
      "Gordon Ryan sub'd Souza via outside HH in 11 seconds (absolute)",
    ],
  },
];

const ADCC_HH_TREND = [
  { year: "2017", pct: 30 },
  { year: "2019", pct: 29 },
  { year: "2022", pct: 28 },
  { year: "2024", pct: 9 },
];

const ADCC_TRIALS = [
  { name: "NA East Coast", year: 2024, subRate: null,
    notes: "RNC: 5/9 att = 55.6% (almost unheard of). Ankle lock most attempted, 0 finishes. Pattern: single leg → back → RNC." },
  { name: "SA Trials 1", year: 2024, subRate: 42,
    notes: "Chokes > legs > arms (normal ratio)." },
  { name: "SA Trials 2", year: 2024, subRate: 43.3,
    notes: "Armbar came out on top — unusual. Mostly chokes but notable arm count." },
  { name: "EU/AF/ME Trials 2", year: 2024, subRate: null,
    notes: "No arm submissions in semis onwards. Leg subs > chokes — unusual." },
  { name: "NA West Coast", year: 2022, subRate: null,
    notes: "Over 50% sub rate in multiple divisions. -88kg: 'one of best grappling events of all time'." },
  { name: "Asia/Oceania", year: 2022, subRate: null,
    notes: "Only 4 subs total (small field). 2 Americana from kesa gatame — unusual." },
];

// ── HASH UTILS ──────────────────────────────────────────────────────────────
const VALID_SORTS = ["total","fin","rate","family","famFin","famRate"];
const VALID_TABS = TABS.length;

function parseHash() {
  if (typeof window === "undefined") return {};
  const h = window.location.hash.replace("#", "");
  if (!h) return {};
  const p = {};
  for (const pair of h.split("&")) {
    const [k, v] = pair.split("=");
    if (k && v) p[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return p;
}

function buildHash(state) {
  const parts = [];
  if (state.tab !== 0) parts.push(`tab=${state.tab}`);
  if (state.sort !== "rate") parts.push(`sort=${state.sort}`);
  if (state.wno !== "agg") parts.push(`wno=${state.wno}`);
  if (state.yr !== 2024) parts.push(`yr=${state.yr}`);
  if (state.era !== "all") parts.push(`era=${state.era}`);
  return parts.length ? "#" + parts.join("&") : "";
}

export default function GrapplingMeta() {
  // Restore state from URL hash
  const initial = parseHash();
  const initTab = initial.tab !== undefined && Number(initial.tab) < VALID_TABS ? Number(initial.tab) : 0;
  const initSort = initial.sort && VALID_SORTS.includes(initial.sort) ? initial.sort : "rate";
  const initWno = initial.wno === "agg" || (initial.wno && WNO_EVENTS[initial.wno]) ? (initial.wno === "agg" ? "agg" : Number(initial.wno)) : "agg";
  const initYr = initial.yr && [2022,2023,2024].includes(Number(initial.yr)) ? Number(initial.yr) : 2024;
  const initEra = initial.era === "modern" ? "modern" : "all";

  const [tab, setTab] = useState(initTab);
  const [sortMode, setSortMode] = useState(initSort);
  const [yr, setYr] = useState(initYr);
  const [ufcEra, setUfcEra] = useState(initEra || "all");
  const [wnoView, setWnoView] = useState(initWno);
  const [hoveredDot, setHoveredDot] = useState(null);

  // Sync state to URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = buildHash({ tab, sort: sortMode, wno: wnoView, yr, era: ufcEra });
    window.history.replaceState(null, "", window.location.pathname + hash);
  }, [tab, sortMode, wnoView, yr, ufcEra]);

  const uData = ufcEra === "all" ? UFC : UFC.filter(d => d.y >= 2001);
  const peak = UFC.reduce((a, b) => b.sub > a.sub ? b : a);
  const mLow = UFC.filter(d => d.y >= 2010).reduce((a, b) => b.sub < a.sub ? b : a);

  // WNO data for current view
  const wnoData = wnoView === "agg" ? WNO_AGG : processRaw(WNO_EVENTS[wnoView]?.data || []);
  const wnoEvent = wnoView === "agg" ? null : WNO_EVENTS[wnoView];
  const wnoTotalAtt = wnoData.reduce((s, d) => s + d.total, 0);
  const wnoTotalFin = wnoData.reduce((s, d) => s + d.fin, 0);
  const wnoOverallRate = wnoTotalAtt > 0 ? +((wnoTotalFin / wnoTotalAtt) * 100).toFixed(1) : 0;
  const wnoLabel = wnoView === "agg"
    ? `WNO Aggregate (${Object.values(WNO_EVENTS).filter(e => !e.partial).map(e => `#${Object.keys(WNO_EVENTS).find(k => WNO_EVENTS[k] === e)}`).join("+")})`
    : `WNO ${wnoView}`;
  const wnoIsPartial = wnoEvent?.partial;

  const btnStyle = (active) => ({
    padding: "8px 14px",
    minHeight: 36,
    border: `1px solid ${active ? P.accent : P.border}`,
    cursor: "pointer",
    background: active ? `${P.accent}22` : "transparent",
    color: active ? P.accent : P.muted,
    fontFamily: FONT,
    fontSize: S.chrome,
    letterSpacing: 1,
  });

  return (
    <div style={{ color: P.text, fontFamily: FONT }}>

      {/* Tabs */}
      <div style={{ display: "flex", background: P.surface, borderBottom: `1px solid ${P.border}`, overflowX: "auto", marginBottom: 16 }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: "12px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
            minHeight: 44,
            fontFamily: FONT, fontSize: S.chrome, letterSpacing: 1.5, textTransform: "uppercase",
            background: tab === i ? P.card : "transparent", color: tab === i ? P.accent : P.muted,
            borderBottom: tab === i ? `2px solid ${P.accent}` : "2px solid transparent",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "0 14px", maxWidth: 920, margin: "0 auto" }}>

        {/* ── TAB 0 — ATTEMPTS → FINISHES ──────────────────────────────── */}
        {tab === 0 && <div>
          {/* WNO event selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, letterSpacing: 1, textTransform: "uppercase" }}>Event:</span>
            {Object.keys(WNO_EVENTS).map(num => (
              <button key={num} onClick={() => setWnoView(Number(num))} style={btnStyle(wnoView === Number(num))}>
                WNO {num}{WNO_EVENTS[num].partial ? " *" : ""}
              </button>
            ))}
            {Object.values(WNO_EVENTS).filter(e => !e.partial).length > 1 && (
              <button onClick={() => setWnoView("agg")} style={btnStyle(wnoView === "agg")}>Aggregate</button>
            )}
          </div>

          {wnoIsPartial && (
            <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.orange, marginBottom: 10, padding: "4px 8px", border: `1px solid ${P.orange}33`, background: `${P.orange}11` }}>
              ⚠ WNO {wnoView}: finishes only — attempt counts not yet extracted from TGC chart images
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <St label={`${wnoLabel} — Total Att`} value={wnoIsPartial ? "?" : `~${wnoTotalAtt}`} sub={wnoEvent ? `${wnoEvent.date} · ${wnoEvent.matches} matches` : "Full attempt data only"} />
            <St label={`${wnoLabel} — Finishes`} value={String(wnoTotalFin)} sub={wnoIsPartial ? "finishes only" : `${wnoOverallRate}% overall completion`} />
            {!wnoIsPartial && wnoData.length > 0 && (() => {
              const top = [...wnoData].sort((a,b) => b.total - a.total)[0];
              const eff = [...wnoData].filter(d => d.total >= 5).sort((a,b) => b.rate - a.rate)[0];
              return <>
                {top && <St label={top.t} value={`${top.total} att`} sub={`${top.fin} finished · ${top.fail} defended`} ac={catColor(top.cat)} />}
                {eff && <St label={`Best eff (5+)`} value={`${eff.rate}%`} sub={`${eff.t} — ${eff.total} att`} ac={catColor(eff.cat)} />}
              </>;
            })()}
          </div>

          <SL>{wnoLabel} — Submissions: Attempts vs Finishes</SL>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <button onClick={() => setSortMode("total")} style={btnStyle(sortMode === "total")}>Sort: attempt volume</button>
            <button onClick={() => setSortMode("fin")} style={btnStyle(sortMode === "fin")}>Sort: finish volume</button>
            <button onClick={() => setSortMode("rate")} style={btnStyle(sortMode === "rate")}>Sort: efficiency (5+ att)</button>
            <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.border, display: "flex", alignItems: "center" }}>|</span>
            <button onClick={() => setSortMode("family")} style={btnStyle(sortMode === "family")}>Family: volume</button>
            <button onClick={() => setSortMode("famFin")} style={btnStyle(sortMode === "famFin")}>Family: finishes</button>
            <button onClick={() => setSortMode("famRate")} style={btnStyle(sortMode === "famRate")}>Family: efficiency</button>
          </div>

          {!sortMode.startsWith("fam") && sortMode !== "family" ? (
          <AttFinChart
            data={wnoData}
            sortBy={sortMode}
            minAtt={sortMode === "rate" ? 5 : 0}
            minFin={sortMode === "fin" ? 1 : 0}
            height={270}
            note={`Source: The Grappling Conjecture — ${wnoLabel} · Red = finished · Dark = defended`}
          />
          ) : (
          <FamilyChart
            data={groupByFamily(wnoData)}
            sortBy={sortMode}
            height={300}
            note={`Source: The Grappling Conjecture — ${wnoLabel} · Grouped by submission family`}
          />
          )}

          <SL mt={22}>Efficiency Map — Volume vs Completion Rate ({wnoLabel}, ≥1 attempt)</SL>
          {!wnoIsPartial && <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "14px 12px" }}
            onMouseLeave={() => setHoveredDot(null)}>
            <div style={{ position: "relative", height: 220 }}>
              <div style={{ position: "absolute", top: 4, right: 8, fontFamily: FONT, fontSize: S.chrome, color: P.accent, opacity: 0.6 }}>HIGH VOL · HIGH EFF →</div>
              <div style={{ position: "absolute", bottom: 4, right: 8, fontFamily: FONT, fontSize: S.chrome, color: P.blue, opacity: 0.6 }}>HIGH VOL · LOW EFF</div>
              <div style={{ position: "absolute", top: 4, left: 8, fontFamily: FONT, fontSize: S.chrome, color: P.emerald, opacity: 0.6 }}>LOW VOL · HIGH EFF</div>
              <div style={{ position: "absolute", bottom: 4, left: 8, fontFamily: FONT, fontSize: S.chrome, color: P.muted, opacity: 0.6 }}>LOW VOL · LOW EFF</div>

              {(() => {
                const visible = wnoData.filter(d => d.total >= 1);
                const maxAtt = Math.max(...visible.map(x => x.total), 1);
                // Group overlapping dots (same total + same rate)
                const posMap = {};
                visible.forEach((d, i) => {
                  const key = `${d.total}:${d.rate}`;
                  if (!posMap[key]) posMap[key] = [];
                  posMap[key].push({ d, i });
                });
                return visible.map((d, i) => {
                const key = `${d.total}:${d.rate}`;
                const group = posMap[key];
                const groupIdx = group.findIndex(g => g.i === i);
                const xPct = (d.total / maxAtt) * 85 + 5;
                const yPct = 95 - (d.rate / 100) * 85;
                const sz = Math.max(d.total * 1.5, 6);
                // Offset overlapping dots horizontally
                const offsetPx = group.length > 1 ? (groupIdx - (group.length - 1) / 2) * (sz + 4) : 0;
                const isHovered = hoveredDot === i;
                // For overlapping groups, show combined label
                const siblings = group.length > 1 ? group.map(g => g.d.t).join(" / ") : null;
                return (
                  <div key={i}
                    onMouseEnter={() => setHoveredDot(i)}
                    onMouseLeave={() => setHoveredDot(null)}
                    style={{
                      position: "absolute",
                      left: `${xPct}%`, top: `${yPct}%`,
                      marginLeft: offsetPx,
                      width: Math.max(sz, 12), height: Math.max(sz, 12), borderRadius: "50%",
                      background: d.fin > 0 ? catColor(d.cat) : P.dimBg,
                      border: `${isHovered ? 2 : 1}px solid ${catColor(d.cat)}`,
                      transform: "translate(-50%,-50%)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: isHovered ? 20 : 1,
                      transition: "border-width 0.1s",
                    }}>
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                        background: P.bg, border: `1px solid ${catColor(d.cat)}`,
                        padding: "6px 10px", whiteSpace: "nowrap", zIndex: 30,
                        pointerEvents: "none",
                      }}>
                        <div style={{ fontFamily: FONT, fontSize: S.base, color: catColor(d.cat), fontWeight: 700, marginBottom: 3 }}>{d.t}</div>
                        {siblings && <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginBottom: 3 }}>same position: {siblings}</div>}
                        <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.text, lineHeight: 1.8 }}>
                          <div>{d.fail} defended · {d.fin} finished · {d.total} att</div>
                          <div style={{ color: d.rate > 0 ? P.accent : P.muted }}>{d.rate}% completion</div>
                          <div style={{ color: P.muted }}>{d.cat}</div>
                        </div>
                        {/* Arrow */}
                        <div style={{
                          position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                          width: 0, height: 0,
                          borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                          borderTop: `5px solid ${catColor(d.cat)}`,
                        }} />
                      </div>
                    )}
                    {/* Persistent label — show combined name for overlapping, first dot only */}
                    {!isHovered && group.length > 1 && groupIdx === 0 && <span style={{ fontFamily: FONT, fontSize: S.chrome,
                      color: P.text, whiteSpace: "nowrap", position: "absolute",
                      top: "110%", left: "50%", transform: "translateX(-50%)",
                      background: P.card, padding: "1px 3px", border: `1px solid ${P.border}`, zIndex: 2 }}>
                      {group.map(g => g.d.t.split(" ")[0]).join("/")}
                    </span>}
                    {/* Persistent label for high-volume single techniques */}
                    {d.total > 5 && !isHovered && group.length === 1 && <span style={{ fontFamily: FONT, fontSize: S.chrome,
                      color: P.text, whiteSpace: "nowrap", position: "absolute",
                      top: "110%", left: "50%", transform: "translateX(-50%)",
                      background: P.card, padding: "1px 3px", border: `1px solid ${P.border}` }}>
                      {d.t.split(" ")[0]}
                    </span>}
                  </div>
                );
              }); })()}

              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: P.border }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: P.dimBg }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6,
              fontFamily: FONT, fontSize: S.chrome, color: P.muted }}>
              <span>← Low volume</span>
              <span style={{ color: P.text }}>X: Attempt count</span>
              <span>High volume →</span>
            </div>
            <div style={{ textAlign: "center", fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginTop: 2 }}>
              Y: Completion rate · Bubble size = attempt count · Hover for details
            </div>
          </div>}
          {wnoIsPartial && <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, padding: "20px 0", textAlign: "center" }}>
            Efficiency map unavailable — attempt counts needed
          </div>}
          <Note>Source: TGC {wnoLabel}</Note>

          <SL mt={20}>ADCC 2022 — Guillotine vs RNC (Reconstructed from Reported %)</SL>
          <AttFinChart
            data={ADCC22_ATT}
            height={180}
            note="* Attempt counts reconstructed: RNC 11 fins ÷ 36.6% = ~30 att; Guillotine ~32 att at 9.3% · Source: TGC ADCC 2022 meta · Overall attempt rate: 17.6%"
          />

          <SL mt={20}>The Ankle Lock Paradox</SL>
          <Ins items={[
            "WNO 32: Ankle lock = 24 attempts (40% of all attempts in the event). 1 finish. 4.2% rate.",
            "RNC: 5 attempts. 2 finishes. 40% rate. 10x more efficient per attempt.",
            "Why so many ankle lock attempts? Entry is accessible from almost any scramble / leg entanglement.",
            "Athletes may be using it for position control, wrestling up, and sweep threat — not just finish.",
            "2024 annual: ankle lock #5 by total finishes (25 fins). Volume × low rate = bulk of finishes.",
            "Practical implication: if you want finish efficiency, RNC. If you want volume leverage, ankle lock.",
            "This attempt vs finish gap is the central tension in modern leglock meta.",
          ]} />

          <SL mt={20}>Data Availability — Attempts by Technique</SL>
          <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px",
            fontFamily: FONT, fontSize: S.chrome, color: P.muted, lineHeight: 2 }}>
            <div><span style={{ color: P.emerald }}>✓</span> WNO 32 (Apr 2026) — full attempts + finishes per technique</div>
            <div><span style={{ color: P.orange }}>◑</span> ADCC 2022 — partial (RNC + guillotine only, reconstructed)</div>
            <div><span style={{ color: P.orange }}>◑</span> 2023 nogi annual — completion % only (no per-technique attempt counts)</div>
            <div><span style={{ color: P.orange }}>◑</span> 2024 nogi annual — completion % only (no per-technique attempt counts)</div>
            <div><span style={{ color: P.red }}>□</span> WNO 1–31 — not yet retrieved</div>
            <div><span style={{ color: P.red }}>□</span> ADCC 2019, 2024 — not yet retrieved</div>
            <div style={{ marginTop: 8, color: P.text }}>
              → Priority: Get TGC's per-technique attempt counts from 2023/2024 annual data (embedded in their charts as images, not text)
            </div>
          </div>
        </div>}

        {/* ── TAB 1 — ADCC ──────────────────────────────────────────────── */}
        {tab === 1 && <div>
          {/* Worlds overview */}
          {ADCC_WORLDS.map((evt, ei) => (
            <div key={ei} style={{ marginBottom: ei < ADCC_WORLDS.length - 1 ? 28 : 0 }}>
              <SL>{`ADCC ${evt.year} — ${evt.location}`}</SL>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <St label="Sub Rate" value={`${evt.subRate}%`} sub={`${evt.totalSubs} total submissions`} />
                <St label="Heel Hooks" value={String(evt.hhFinishes)} sub={`${evt.year === 2024 ? "Lowest recent ADCC" : "Down from 30% in 2017"}`} ac={P.emerald} />
                {evt.overallAttRate && <St label="Att→Finish" value={`${evt.overallAttRate}%`} sub="Overall completion rate" ac={P.amber} />}
                {evt.action && <St label="Action/5min" value={String(evt.action.actionScore)} sub={`Sub att ${evt.action.subAttRate}% · TD ${evt.action.tdRate}%`} ac={P.cyan} />}
              </div>

              {/* Technique breakdown */}
              <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginBottom: 6 }}>TOP SUBMISSIONS — % OF ALL FINISHES</div>
              <ResponsiveContainer width="100%" height={Math.max(evt.top.length * 32, 120)}>
                <BarChart data={evt.top} layout="vertical" margin={{ top: 4, right: 50, left: 100, bottom: 4 }}>
                  <CartesianGrid stroke={P.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} tickFormatter={v => `${v}%`} domain={[0, 35]} />
                  <YAxis type="category" dataKey="t" width={100} tick={{ fill: P.text, fontFamily: FONT, fontSize: S.sm }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = evt.top.find(x => x.t === label);
                    return (
                      <div style={{ background: P.bg, border: `1px solid ${P.border}`, padding: "8px 12px", fontFamily: FONT, fontSize: S.base, color: P.text }}>
                        <div style={{ color: catColor(d?.cat), fontWeight: 700 }}>{label}</div>
                        {d?.pct != null && <div>{d.pct}% of all finishes</div>}
                        {d?.att && <div style={{ color: P.muted }}>{d.att} att → {d.fin} fin ({d.rate}%)</div>}
                      </div>
                    );
                  }} />
                  <Bar dataKey="pct" name="% of finishes" radius={[0, 3, 3, 0]}>
                    {evt.top.map((d, i) => <Cell key={i} fill={catColor(d.cat)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Category split */}
              {evt.catSplit && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <St label={`Chokes ${evt.catSplitLabel || ""}`} value={`${evt.catSplit.chokes}%`} ac={P.amber} />
                  <St label={`Arms ${evt.catSplitLabel || ""}`} value={`${evt.catSplit.arms}%`} ac={P.blue} />
                  <St label={`Legs ${evt.catSplitLabel || ""}`} value={`${evt.catSplit.legs}%`} ac={P.emerald} />
                </div>
              )}

              {/* Notes */}
              <Ins items={evt.notes} />
            </div>
          ))}

          {/* Heel hook trend */}
          <SL mt={22}>Heel Hook Share of ADCC Finishes — Declining</SL>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ADCC_HH_TREND} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} />
              <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} tickFormatter={v => `${v}%`} domain={[0, 35]} />
              <Tooltip content={<TT />} />
              <Bar dataKey="pct" name="HH % of finishes" radius={[3, 3, 0, 0]}>
                {ADCC_HH_TREND.map((d, i) => <Cell key={i} fill={i === ADCC_HH_TREND.length - 1 ? P.fin : P.emerald} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Note>30% → 9% in 7 years. Defense matured; ankle lock & kneebar filling the gap.</Note>

          {/* Trials */}
          <SL mt={22}>ADCC Trials — Regional Qualifiers</SL>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ADCC_TRIALS.map((t, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: S.md, color: P.accent }}>{t.name}</span>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted }}>{t.year}</span>
                </div>
                {t.subRate && <div style={{ fontFamily: FONT_DISPLAY, fontSize: S.lg, color: P.accent, marginBottom: 4 }}>{t.subRate}% sub rate</div>}
                <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, lineHeight: 1.8 }}>{t.notes}</div>
              </div>
            ))}
          </div>
          <Note>Trials data: semi-finals onwards only (TGC). Early rounds excluded — biases toward lower sub rates.</Note>

          {/* Cross-event patterns */}
          <SL mt={22}>Cross-Event Patterns</SL>
          <Ins items={[
            "RNC always #1 or #2 — consistent across all ADCC data",
            "Ankle lock most attempted, rarely finishes — same pattern as WNO",
            "Heel hook share declining: 30% (2017) → 9% (2024)",
            "Chokes > legs > arms in nearly all events",
            "Back take = dominant finishing position",
            "Wrestling → back → RNC = optimal ADCC path",
            "ADCC turtle rule creates more RNC opportunities than WNO",
          ]} />

          {/* Data gaps */}
          <SL mt={16}>Data Gaps — ADCC</SL>
          <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px",
            fontFamily: FONT, fontSize: S.chrome, color: P.muted, lineHeight: 2 }}>
            <div><span style={{ color: P.fin }}>□</span> Per-technique attempts vs finishes (WNO format) — not available</div>
            <div><span style={{ color: P.fin }}>□</span> ADCC 2017, 2019 detailed breakdowns</div>
            <div><span style={{ color: P.fin }}>□</span> Individual division stats for 2024 (TGC has 8 pages)</div>
            <div><span style={{ color: P.fin }}>□</span> BJJ Heroes ADCC data — site returns 403</div>
          </div>
        </div>}

        {/* ── TAB 2 — UFC / MMA ─────────────────────────────────────────── */}
        {tab === 2 && <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <St label="2025 Sub Rate" value="17.4%" sub="UFC (n=551)" />
            <St label="Peak" value={`${peak.sub}%`} sub={`${peak.y} — Gracie era`} ac={P.fin} />
            <St label="Post-2010 Low" value={`${mLow.sub}%`} sub={String(mLow.y)} ac={P.muted} />
            <St label="vs Nogi (2024)" value="+28pp" sub="nogi 45.4% vs MMA 16.1%" ac={P.emerald} />
          </div>

          <SL>UFC Finish Breakdown (%) — Historical</SL>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["all", "modern"].map(e => (
              <button key={e} onClick={() => setUfcEra(e)} style={btnStyle(ufcEra === e)}>
                {e === "all" ? "1993+" : "2001+ (unified rules)"}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={uData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" />
              <XAxis dataKey="y" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }}
                tickFormatter={v => `'${String(v).slice(2)}`} />
              <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }}
                tickFormatter={v => `${v}%`} domain={[0, 80]} />
              <Tooltip content={<TT />} />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: FONT, fontSize: S.base }} />
              <ReferenceLine y={20} stroke={P.accent} strokeDasharray="4 4" strokeOpacity={0.2} />
              <Line type="monotone" dataKey="sub" name="Submission %" stroke={P.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="ko" name="KO/TKO %" stroke={P.fin} strokeWidth={1.5} dot={false} strokeDasharray="5 2" />
              <Line type="monotone" dataKey="dec" name="Decision %" stroke={P.muted} strokeWidth={1.5} dot={false} strokeDasharray="2 3" />
            </LineChart>
          </ResponsiveContainer>
          <Note>Source: FightMatrix.com — all official UFC bouts 1993–2025</Note>
          <Ins items={[
            "1993–94: Gracie-era BJJ — 62–74% sub rate. No unified rules.",
            "1999–2002: Wrestling/striking normalize — sub% collapses to 19–23%.",
            "2006–08: Brief return to ~32% as leg lock culture spreads through MMA.",
            "2011–present: Stable 15–20%. 2021 modern low: 14.7%.",
            "2022–23 uptick ~19–20%. 2024 drops to 16.1% with 55.3% decision rate (record).",
          ]} />
        </div>}

        {/* ── TAB 2 — NOGI ANNUAL ───────────────────────────────────────── */}
        {tab === 3 && <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <St label="2021" value="50.2%" ac={P.orange} />
            <St label="2022" value="48.3%" />
            <St label="2023" value="46.4%" sub="17.8% att rate" ac={P.blue} />
            <St label="2024" value="45.4%" sub="15% att rate" ac={P.emerald} />
          </div>

          <SL>Annual Sub Rate + Attempt Completion Trend</SL>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={[...NOGI, { y: 2026, sub: 38.5, event: true }]} margin={{ top: 8, right: 20, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" />
              <XAxis dataKey="y" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.base }} />
              <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }} tickFormatter={v => `${v}%`} domain={[30, 60]} />
              <Tooltip content={<TT />} />
              <ReferenceLine y={17.4} stroke={P.fin} strokeDasharray="3 3"
                label={{ value: "UFC 2025: 17.4%", fill: P.fin, fontSize: S.chrome, fontFamily: FONT, position: "insideTopRight" }} />
              <Line type="monotone" dataKey="sub" name="Nogi sub %" stroke={P.accent} strokeWidth={2.5}
                dot={({ cx, cy, payload }) => (
                  <circle cx={cx} cy={cy} r={payload.event ? 6 : 4}
                    fill={payload.event ? P.cyan : P.accent} stroke={P.bg} strokeWidth={1.5} />
                )} />
            </LineChart>
          </ResponsiveContainer>
          <Note>◆ Cyan = WNO 32 single event (n=13), not annual avg · Source: The Grappling Conjecture</Note>

          <SL mt={18}>2023 — Completion % by Technique (min 5 finishes)</SL>
          <PctChart data={NOGI23_PCT} height={155} note="775 total attempts, 138 finishes (17.8% overall) · Source: TGC 2023 PT.2" />

          <SL mt={18}>2024 — Completion % by Technique (min 5 finishes)</SL>
          <PctChart data={NOGI24_PCT} height={155} note="2,495 total attempts, 329 finishes (15.0% overall) · Source: TGC 2024 PT.2" />

          <Ins items={[
            "Both years: per-technique attempt counts exist in TGC image charts but not scraped text.",
            "The chart above shows completion %, not attempt volume — different from WNO 32 tab.",
            "2023 vs 2024: overall completion rate dropped 2.8pp — defense accelerating.",
            "Kneebar jumped from outside top 5 in 2023 → #1 completion rate in 2024 (27.2%).",
            "Inside HH: dropped from 28.7% (2023) → 21.2% (2024). Elite defense catching up.",
          ]} />
        </div>}

        {/* ── TAB 3 — TECHNIQUE RANKS ───────────────────────────────────── */}
        {tab === 4 && <div>
          <SL>Top 10 by Year — Category Mix</SL>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[2022, 2023, 2024].map(y => ({
              year: y,
              legs: TOP10[y].filter(t => t.c === "Leg").length,
              chokes: TOP10[y].filter(t => t.c === "Choke").length,
              arms: TOP10[y].filter(t => t.c === "Arm").length,
            }))} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.base }} />
              <YAxis tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.base }} domain={[0, 10]} />
              <Tooltip content={<TT />} />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: FONT, fontSize: S.base }} />
              <Bar dataKey="legs" name="Leg Locks" fill={P.emerald} stackId="a" />
              <Bar dataKey="chokes" name="Chokes" fill={P.amber} stackId="a" />
              <Bar dataKey="arms" name="Arm Locks" fill={P.blue} stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <SL mt={16}>Year Detail</SL>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[2022, 2023, 2024].map(y => (
              <button key={y} onClick={() => setYr(y)} style={btnStyle(yr === y)}>{y}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginBottom: 8 }}>BY FINISH COUNT</div>
              {(TOP10[yr] || []).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3,
                  background: i < 2 ? `${catColor(d.c)}11` : P.card,
                  border: `1px solid ${i < 2 ? catColor(d.c) + "44" : P.border}`, padding: "5px 10px" }}>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: S.md, color: P.text }}>{d.t}</span>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: catColor(d.c), background: `${catColor(d.c)}22`, padding: "1px 5px" }}>{d.c}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginBottom: 8 }}>BY COMPLETION % (5+ FINS)</div>
              <PctChart data={{ 2022: NOGI23_PCT.map(d => ({ ...d })), 2023: NOGI23_PCT, 2024: NOGI24_PCT }[yr] || NOGI24_PCT} height={220} />
            </div>
          </div>
          <Note>Source: The Grappling Conjecture annual reviews 2022–2024</Note>
        </div>}

        {/* ── TAB 4 — GI / IBJJF ───────────────────────────────────────── */}
        {tab === 5 && <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <St label="Gi Worlds 2023" value="36.7%" sub="Black belt qtrs→finals" />
            <St label="Male" value="31.4%" sub="22/70 matches" ac={P.blue} />
            <St label="Female" value="43.1%" sub="25/58 matches" ac={P.purple} />
            <St label="Nogi Pan HH" value="28%" sub="IBJJF Nogi Pan 2024" ac={P.emerald} />
          </div>

          <SL>IBJJF Gi Worlds 2023 — Technique Breakdown</SL>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={GI23} layout="vertical" margin={{ top: 4, right: 50, left: 125, bottom: 4 }}>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: P.muted, fontFamily: FONT, fontSize: S.chrome }}
                tickFormatter={v => `${v}%`} domain={[0, 55]} />
              <YAxis type="category" dataKey="t" width={125}
                tick={{ fill: P.text, fontFamily: FONT, fontSize: S.md }} />
              <Tooltip content={<TT />} />
              <Bar dataKey="p" name="% of all subs" radius={[0, 3, 3, 0]}>
                {GI23.map((d, i) => <Cell key={i} fill={catColor(d.c)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Note>47 total subs from 128 matches · Source: ibjjf.com official 2023 Worlds submission breakdown</Note>

          <SL mt={18}>Gi vs Nogi — Technique Divergence</SL>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 14 }}>
            <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px" }}>
              <div style={{ fontFamily: FONT, fontSize: S.md, color: P.orange, textTransform: "uppercase", marginBottom: 8 }}>GI — 2023 Worlds</div>
              {[{ r: "01", t: "Choke from Back", c: "Choke", p: "44.7%" }, { r: "02", t: "Armbar", c: "Arm", p: "21.3%" },
                { r: "03", t: "Triangle", c: "Choke", p: "8.5%" }, { r: "—", t: "Heel Hooks", c: "Leg", p: "ILLEGAL" }].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, minWidth: 18 }}>{d.r}</span>
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: S.md, color: d.t === "Heel Hooks" ? P.fin : P.text }}>{d.t}</span>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: catColor(d.c) }}>{d.p}</span>
                </div>
              ))}
            </div>
            <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px" }}>
              <div style={{ fontFamily: FONT, fontSize: S.md, color: P.accent, textTransform: "uppercase", marginBottom: 8 }}>NOGI — 2024</div>
              {[{ r: "01", t: "RNC", c: "Choke" }, { r: "02", t: "Inside HH", c: "Leg" },
                { r: "03", t: "Armbar", c: "Arm" }, { r: "04", t: "Outside HH", c: "Leg" }, { r: "05", t: "Ankle Lock", c: "Leg" }].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, minWidth: 18 }}>{d.r}</span>
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: S.md, color: P.text }}>{d.t}</span>
                  <span style={{ fontFamily: FONT, fontSize: S.chrome, color: catColor(d.c), background: `${catColor(d.c)}22`, padding: "1px 5px" }}>{d.c}</span>
                </div>
              ))}
            </div>
          </div>

          <Ins items={[
            "Gi: choke from back = 44–50% of subs consistently. Rules push position hierarchy.",
            "IBJJF Nogi Pan 2024: heel hooks = 28% of subs (19 matches) — ruleset change = game change.",
            "Female sub rates: consistently higher than male. Both gi and nogi, every dataset.",
            "2023 Worlds historic: first time ever both open class finals ended in submission.",
            "Last male open class final sub at Worlds before 2023: 2009 (Roger Gracie, cross choke).",
          ]} />
        </div>}

        {/* ── TAB 5 — SOURCES ───────────────────────────────────────────── */}
        {tab === 6 && <div>
          <SL>Data Sources</SL>
          {[
            { n: "FightMatrix.com", u: "fightmatrix.com/ufc-records/ufc-fight-outcomes/",
              d: "Complete UFC fight outcomes 1993–2026 (KO/TKO, Sub, Decision, NC).", c: "HIGH — primary, complete" },
            { n: "The Grappling Conjecture", u: "thegrapplingconjecture.blogspot.com",
              d: "Annual nogi reviews 2021–2024: sub rates, technique rankings, completion %, positions, action metrics. WNO 32 attempts/finishes chart (image, hand-read).", c: "HIGH — hand-compiled" },
            { n: "IBJJF (official)", u: "ibjjf.com/news/2023-world-championships-submission-breakdown",
              d: "2023 Worlds, Pans, Europeans, Brasileiros sub breakdowns. Qtrs–finals only.", c: "HIGH — official" },
            { n: "BJJ Heroes", u: "bjjheroes.com/bjj-news/2024-ibjjf-pan-nogi-championship-results",
              d: "IBJJF Nogi Pan 2024 (heel hook 28% of subs). ADCC historical leg lock %.", c: "MED-HIGH" },
            { n: "Follmer et al. 2021 (peer-reviewed)", u: "Ido Mov. Cult. / PubMed",
              d: "1,903 UFC bouts 2014–2017. Male 17.3%, Female 21.1% sub rates.", c: "HIGH — peer-reviewed" },
          ].map((s, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, padding: "11px 13px", marginBottom: 7 }}>
              <div style={{ fontFamily: FONT, fontSize: S.lg, color: P.accent, marginBottom: 2 }}>{s.n}</div>
              <div style={{ fontFamily: FONT, fontSize: S.chrome, color: P.muted, marginBottom: 5 }}>{s.u}</div>
              <div style={{ fontFamily: FONT, fontSize: S.base, color: P.text, marginBottom: 5, lineHeight: 1.5 }}>{s.d}</div>
              <div style={{ fontFamily: FONT, fontSize: S.chrome, color: s.c.startsWith("HIGH") ? P.emerald : P.orange }}>◆ {s.c}</div>
            </div>
          ))}
          <SL mt={14}>Priority Gaps</SL>
          <div style={{ background: P.card, border: `1px solid ${P.border}`, padding: "12px 14px",
            fontFamily: FONT, fontSize: S.chrome, color: P.muted, lineHeight: 2.1 }}>
            {["WNO 1–31 attempts vs finishes charts (TGC has these as images in event posts)",
              "2023/2024 nogi annual per-technique attempt counts (in TGC's chart images, not text)",
              "ADCC 2022 full attempts chart (TGC ADCC 2022 meta has this as an image)",
              "ADCC 2019, 2024 complete breakdowns",
              "UFC submission type by year post-2017",
              "Polaris and EBI event-level attempt data",
            ].map((t, i) => <div key={i}><span style={{ color: P.fin }}>□</span> {t}</div>)}
          </div>
        </div>}
      </div>

      <div style={{ borderTop: `1px solid ${P.border}`, padding: "10px 18px", marginTop: 16,
        fontFamily: FONT, fontSize: S.chrome, color: P.muted,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, background: P.surface }}>
        <span>GRAPPLING META v0.3 · Apr 2026</span>
        <span>FightMatrix · The Grappling Conjecture · IBJJF · BJJ Heroes · Follmer et al.</span>
      </div>
    </div>
  );
}
