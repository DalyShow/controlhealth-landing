export type BiomarkerSystemKey =
  | "cardiovascular"
  | "metabolic"
  | "inflammation"
  | "hormone"
  | "nutrient"
  | "organ";

export type BiomarkerSystem = {
  label: string;
  /** The token this system paints itself with, as a CSS value. */
  tone: string;
};

export type Biomarker = {
  system: BiomarkerSystemKey;
  name: string;
  /** One plain line on what the marker tells you. Descriptive, never diagnostic. */
  note: string;
  /** Whether a standard annual physical already covers it — see STANDARD_PANEL. */
  covered: boolean;
};

/**
 * What "a standard physical" means everywhere in this file: the three panels
 * a routine annual visit almost always orders, and nothing else.
 */
export const STANDARD_PANEL =
  "a comprehensive metabolic panel, a complete blood count and a lipid panel";

/**
 * The six groups the strip is ordered by, running left to right. Hue carries
 * the system; how bright a marker sits carries whether you already have it.
 */
export const BIOMARKER_SYSTEMS = {
  cardiovascular: {
    label: "Cardiovascular",
    tone: "var(--color-marker-cardiovascular)",
  },
  metabolic: { label: "Metabolic", tone: "var(--color-marker-metabolic)" },
  inflammation: {
    label: "Inflammation",
    tone: "var(--color-marker-inflammation)",
  },
  hormone: {
    label: "Thyroid & hormones",
    tone: "var(--color-marker-hormone)",
  },
  nutrient: { label: "Nutrients", tone: "var(--color-marker-nutrient)" },
  organ: { label: "Kidney & liver", tone: "var(--color-marker-organ)" },
} as const satisfies Record<BiomarkerSystemKey, BiomarkerSystem>;

/**
 * A representative forty markers, grouped by body system. Not an exhaustive
 * list of what a comprehensive panel can measure, and not medical advice.
 *
 * Every line here is health copy on a marketing page and needs a clinical
 * review pass before launch.
 */
export const BIOMARKERS = [
  // Cardiovascular
  {
    system: "cardiovascular",
    name: "Total cholesterol",
    covered: true,
    note: "The sum of all cholesterol carried in your blood. Broad, and easy to misread on its own.",
  },
  {
    system: "cardiovascular",
    name: "LDL cholesterol",
    covered: true,
    note: "Usually calculated rather than measured. An estimate of the cholesterol inside artery-damaging particles.",
  },
  {
    system: "cardiovascular",
    name: "HDL cholesterol",
    covered: true,
    note: "Cholesterol being carried back away from the artery wall.",
  },
  {
    system: "cardiovascular",
    name: "Triglycerides",
    covered: true,
    note: "Circulating fat. Moves quickly with diet, alcohol and how recently you ate.",
  },
  {
    system: "cardiovascular",
    name: "Apolipoprotein B",
    covered: false,
    note: "Counts the artery-damaging particles themselves rather than estimating the cholesterol inside them.",
  },
  {
    system: "cardiovascular",
    name: "Lipoprotein(a)",
    covered: false,
    note: "Largely genetic and stable for life. One measurement tells you something a lifetime of lipid panels will not.",
  },
  {
    system: "cardiovascular",
    name: "Omega-3 index",
    covered: false,
    note: "The share of omega-3 in your red cell membranes. Reflects months of intake, not last week's.",
  },

  // Metabolic
  {
    system: "metabolic",
    name: "Fasting glucose",
    covered: true,
    note: "Blood sugar after an overnight fast. A single morning snapshot.",
  },
  {
    system: "metabolic",
    name: "Hemoglobin A1c",
    covered: false,
    note: "Average blood sugar across about three months. Not part of a basic physical until there is already a concern.",
  },
  {
    system: "metabolic",
    name: "Fasting insulin",
    covered: false,
    note: "What your pancreas is doing to hold glucose steady. Often moves years before glucose does.",
  },
  {
    system: "metabolic",
    name: "C-peptide",
    covered: false,
    note: "Released alongside insulin, so it shows how much your own pancreas is producing.",
  },
  {
    system: "metabolic",
    name: "Uric acid",
    covered: false,
    note: "A by-product of purine metabolism, tied to both joint and metabolic health.",
  },
  {
    system: "metabolic",
    name: "HOMA-IR",
    covered: false,
    note: "Derived from fasting glucose and insulin together. An estimate of insulin resistance.",
  },

  // Inflammation
  {
    system: "inflammation",
    name: "hs-CRP",
    covered: false,
    note: "High-sensitivity C-reactive protein. Picks up low-grade inflammation a standard CRP reads as zero.",
  },
  {
    system: "inflammation",
    name: "Homocysteine",
    covered: false,
    note: "An amino acid that accumulates when B-vitamin metabolism is not keeping up.",
  },
  {
    system: "inflammation",
    name: "Fibrinogen",
    covered: false,
    note: "A clotting protein that also climbs with inflammation.",
  },
  {
    system: "inflammation",
    name: "White blood cell count",
    covered: true,
    note: "Part of a standard blood count. A broad signal that something is active.",
  },
  {
    system: "inflammation",
    name: "ESR",
    covered: false,
    note: "How fast red cells settle. A slow, non-specific read on inflammation.",
  },

  // Thyroid & hormones
  {
    system: "hormone",
    name: "TSH",
    covered: false,
    note: "The pituitary's instruction to the thyroid. The usual first test, and rarely enough on its own.",
  },
  {
    system: "hormone",
    name: "Free T4",
    covered: false,
    note: "The storage form of thyroid hormone, unbound and available for conversion.",
  },
  {
    system: "hormone",
    name: "Free T3",
    covered: false,
    note: "The active form your cells actually use.",
  },
  {
    system: "hormone",
    name: "TPO antibodies",
    covered: false,
    note: "Whether your immune system is targeting the thyroid itself.",
  },
  {
    system: "hormone",
    name: "Testosterone, total",
    covered: false,
    note: "All circulating testosterone, most of it bound and unavailable to tissue.",
  },
  {
    system: "hormone",
    name: "DHEA-S",
    covered: false,
    note: "An adrenal precursor hormone that declines steadily with age.",
  },
  {
    system: "hormone",
    name: "Estradiol",
    covered: false,
    note: "The principal estrogen, relevant across the lifespan in both sexes.",
  },

  // Nutrients
  {
    system: "nutrient",
    name: "Vitamin D, 25-OH",
    covered: false,
    note: "The storage form. Low levels are common and entirely invisible without measuring.",
  },
  {
    system: "nutrient",
    name: "Vitamin B12",
    covered: false,
    note: "Needed for nerve function and red cell production.",
  },
  {
    system: "nutrient",
    name: "Folate",
    covered: false,
    note: "Works alongside B12, and a deficiency in one can mask the other.",
  },
  {
    system: "nutrient",
    name: "Ferritin",
    covered: false,
    note: "Stored iron. Falls long before a blood count shows anemia.",
  },
  {
    system: "nutrient",
    name: "Iron and TIBC",
    covered: false,
    note: "Circulating iron, and how much capacity is left to carry more.",
  },
  {
    system: "nutrient",
    name: "Magnesium, RBC",
    covered: false,
    note: "Measured inside the red cell, where most of the body's magnesium actually sits.",
  },

  // Kidney & liver
  {
    system: "organ",
    name: "Creatinine",
    covered: true,
    note: "A muscle by-product the kidneys clear. The standard kidney measure.",
  },
  {
    system: "organ",
    name: "eGFR",
    covered: true,
    note: "Estimated filtration rate, calculated from creatinine. How well the kidneys are clearing.",
  },
  {
    system: "organ",
    name: "Blood urea nitrogen",
    covered: true,
    note: "Another cleared waste product, sensitive to hydration and protein intake.",
  },
  {
    system: "organ",
    name: "Albumin",
    covered: true,
    note: "The main protein in blood. Reflects liver output and nutritional state.",
  },
  {
    system: "organ",
    name: "ALT",
    covered: true,
    note: "A liver enzyme that rises when liver cells are under stress.",
  },
  {
    system: "organ",
    name: "AST",
    covered: true,
    note: "Found in liver and muscle both, so it is read alongside ALT.",
  },
  {
    system: "organ",
    name: "Alkaline phosphatase",
    covered: true,
    note: "Comes from liver and bone. Context decides which one is talking.",
  },
  {
    system: "organ",
    name: "Cystatin C",
    covered: false,
    note: "A second, independent estimate of filtration that muscle mass does not skew.",
  },
  {
    system: "organ",
    name: "GGT",
    covered: false,
    note: "Sensitive to alcohol and to bile flow. Often the first liver enzyme to move.",
  },
] as const satisfies Biomarker[];

export const BIOMARKER_COUNT = BIOMARKERS.length;

export const COVERED_COUNT = BIOMARKERS.filter(
  (marker) => marker.covered
).length;
