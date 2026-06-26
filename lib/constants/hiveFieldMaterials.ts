import type { ImpactCategory } from "@/lib/constants/hiveProjects";

export type MaterialType =
  | "article"
  | "glossary"
  | "standard"
  | "dataset"
  | "video"
  | "tool"
  | "regulation";

export type FieldMaterial = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: MaterialType;
  impactCategory: ImpactCategory;
  /** Plain-language note for students outside this domain */
  outsiderNote: string;
};

export const materialTypeLabels: Record<MaterialType, string> = {
  article: "Article",
  glossary: "Glossary",
  standard: "Standard",
  dataset: "Dataset",
  video: "Video",
  tool: "Tool",
  regulation: "Regulation",
};

export const fieldMaterials: FieldMaterial[] = [
  // Agriculture
  {
    id: "ag-soil-basics",
    title: "Soil moisture & pH — why they matter",
    description:
      "Intro to volumetric water content, soil pH ranges, and how small shifts affect crop windows.",
    url: "https://www.fao.org/soils-portal/soil-management/nutrient-management/en/",
    type: "article",
    impactCategory: "agriculture",
    outsiderNote:
      "Farmers often decide planting dates from rainfall memory — sensors quantify what intuition misses.",
  },
  {
    id: "ag-mqtt-iot",
    title: "MQTT for low-bandwidth field sensors",
    description:
      "Lightweight pub/sub protocol used when cellular data is expensive and devices sleep between readings.",
    url: "https://mqtt.org/getting-started/",
    type: "glossary",
    impactCategory: "agriculture",
    outsiderNote:
      "Rural deployments rarely use REST polling — MQTT is the usual pattern for battery-powered nodes.",
  },
  {
    id: "ag-extension",
    title: "FAO digital agriculture overview",
    description:
      "How extension services, cooperatives, and SMS alerts fit into smallholder tech adoption.",
    url: "https://www.fao.org/digital-agriculture/en/",
    type: "article",
    impactCategory: "agriculture",
    outsiderNote:
      "Hardware is only half the story; local language alerts and trust networks determine uptake.",
  },
  // Healthcare
  {
    id: "hc-queueing",
    title: "Queueing theory primer for clinics",
    description:
      "Arrival rates, service times, and why small utilisation spikes create long visible waits.",
    url: "https://en.wikipedia.org/wiki/Queueing_theory",
    type: "glossary",
    impactCategory: "healthcare",
    outsiderNote:
      "A clinic at 85% capacity can still look 'fine' on paper while walk-ins wait an hour.",
  },
  {
    id: "hc-triage",
    title: "WHO emergency triage standards",
    description:
      "How urgency categories (e.g. red/yellow/green) prioritise who is seen first in constrained settings.",
    url: "https://www.who.int/teams/integrated-health-services/patient-safety/standards",
    type: "standard",
    impactCategory: "healthcare",
    outsiderNote:
      "Simulation models must respect triage rules — not all patients are interchangeable arrivals.",
  },
  {
    id: "hc-privacy",
    title: "POPIA & health data (South Africa)",
    description:
      "Basics of processing personal health information and lawful bases for campus health systems.",
    url: "https://popia.co.za/",
    type: "regulation",
    impactCategory: "healthcare",
    outsiderNote:
      "Even anonymised queue metrics can become identifiable when combined with timetables.",
  },
  // Finance
  {
    id: "fin-stokvel",
    title: "What is a stokvel?",
    description:
      "Informal rotating savings clubs — contribution cycles, payouts, and record-keeping pain points.",
    url: "https://en.wikipedia.org/wiki/Stokvel",
    type: "glossary",
    impactCategory: "finance",
    outsiderNote:
      "Trust is social, not cryptographic; ledgers must mirror how groups already settle disputes.",
  },
  {
    id: "fin-informal",
    title: "FinMark Trust — informal finance research",
    description:
      "Surveys and reports on how unbanked households save, borrow, and reconcile group funds.",
    url: "https://finmark.org.za/",
    type: "article",
    impactCategory: "finance",
    outsiderNote:
      "Features like 'export for treasurer' often matter more than slick UI for adoption.",
  },
  {
    id: "fin-mobile-money",
    title: "GSMA mobile money glossary",
    description:
      "Agent networks, float, KYC tiers — vocabulary for apps that sit beside cash economies.",
    url: "https://www.gsma.com/mobilefordevelopment/resources/",
    type: "glossary",
    impactCategory: "finance",
    outsiderNote:
      "Many users reconcile app balances with SMS receipts, not in-app history alone.",
  },
  // Community
  {
    id: "com-ngo-brief",
    title: "TechSoup NGO digital needs assessment",
    description:
      "How nonprofits scope volunteer tech projects without over-promising deliverables.",
    url: "https://www.techsoup.org/",
    type: "article",
    impactCategory: "community",
    outsiderNote:
      "NGOs often need maintenance handover docs more than a polished v1 demo.",
  },
  {
    id: "com-impact",
    title: "Theory of change (NPC guide)",
    description:
      "Linking outputs to outcomes — useful when presenting Hive sprint results to partners.",
    url: "https://www.thinknpc.org/resource-hub/theory-of-change/",
    type: "article",
    impactCategory: "community",
    outsiderNote:
      "Partners judge student work on sustained capacity, not feature count.",
  },
  {
    id: "com-volunteer",
    title: "Pro bono tech — expectations checklist",
    description:
      "Scope, IP ownership, accessibility, and support windows for short volunteer engagements.",
    url: "https://www.catchafire.org/",
    type: "tool",
    impactCategory: "community",
    outsiderNote:
      "Clarify who hosts the app after semester ends before writing code.",
  },
  // Environment
  {
    id: "env-open-data",
    title: "Open environmental data portals",
    description:
      "Satellite, air quality, and watershed datasets students reuse instead of collecting from scratch.",
    url: "https://www.opendata.gov.za/",
    type: "dataset",
    impactCategory: "environment",
    outsiderNote:
      "Licence terms vary — always note attribution and redistribution limits in READMEs.",
  },
  {
    id: "env-sensors",
    title: "Low-cost air & water sensor caveats",
    description:
      "Calibration drift, placement bias, and why consumer-grade readings need disclaimers.",
    url: "https://www.epa.gov/air-sensor-toolbox",
    type: "article",
    impactCategory: "environment",
    outsiderNote:
      "A chart of 'PM2.5' means little without stating sensor model and calibration date.",
  },
  // Education (still useful for cross-cohort viewers)
  {
    id: "edu-pwa",
    title: "MDN Progressive Web Apps guide",
    description:
      "Install prompts, offline caches, and service workers for campus tools without app-store friction.",
    url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps",
    type: "article",
    impactCategory: "education",
    outsiderNote:
      "PWAs suit one-off visitors (open day, campus tours) who will not install a native app.",
  },
  {
    id: "edu-fts",
    title: "PostgreSQL full-text search",
    description:
      "tsvector, GIN indexes, and ranking — the pattern behind shared study-note search APIs.",
    url: "https://www.postgresql.org/docs/current/textsearch.html",
    type: "glossary",
    impactCategory: "education",
    outsiderNote:
      "Module codes and slang need custom dictionaries or search feels broken to students.",
  },
];

const materialById = new Map(fieldMaterials.map((m) => [m.id, m]));

export function getMaterialById(id: string): FieldMaterial | undefined {
  return materialById.get(id);
}

export function getMaterialsForCategory(
  category: ImpactCategory,
): FieldMaterial[] {
  return fieldMaterials.filter((m) => m.impactCategory === category);
}

export function getMaterialsForCategories(
  categories: ImpactCategory[],
): FieldMaterial[] {
  const set = new Set(categories);
  return fieldMaterials.filter((m) => set.has(m.impactCategory));
}

export function getMaterialsByIds(ids: string[]): FieldMaterial[] {
  return ids
    .map((id) => materialById.get(id))
    .filter((m): m is FieldMaterial => m !== undefined);
}

/** Categories where domain context helps outsiders most */
export const nicheImpactCategories: ImpactCategory[] = [
  "agriculture",
  "healthcare",
  "finance",
  "community",
  "environment",
];
