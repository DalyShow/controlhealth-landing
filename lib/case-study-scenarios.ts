import {
  BIOMARKERS,
  type BiomarkerName,
  type CaseStudyResults,
} from "@/lib/biomarkers";

/**
 * The case study wall: eighteen situations people come to testing with, and
 * the tests each one points to.
 *
 * Every line here is health copy on a marketing page and needs a clinical
 * review pass before launch. The photographs are Unsplash placeholders.
 */

export type CaseStudyScenario = {
  title: string;
  /** What the person notices, in a sentence. */
  body: string;
  /** The relevant tests, as written, including the ones the strip lacks. */
  tests: string;
  /** A caveat on how the tests are read, where there is one. */
  note?: string;
  /** The guidance the tests follow, where one is named. */
  source?: string;
  /** Which of the strip’s forty markers the tests include. */
  markers: readonly BiomarkerName[];
  image: {
    src: string;
    alt: string;
  };
};

/**
 * The panels the tests are ordered as, spelled out as the strip markers they
 * include, so a scenario can list a panel once and still light every marker
 * in it. Tests the strip does not carry, such as electrolytes or a clotting
 * screen, are listed on the card and simply have nothing to light.
 */
const CBC = ["Hemoglobin", "MCV", "White blood cell count"] as const;
const IRON = [
  "Ferritin",
  "Serum iron",
  "Total iron-binding capacity",
  "Transferrin saturation",
] as const;
const CMP = [
  "Fasting glucose",
  "Creatinine",
  "Blood urea nitrogen",
  "Albumin",
  "ALT",
  "AST",
  "Alkaline phosphatase",
] as const;
const LIPIDS = [
  "Total cholesterol",
  "LDL cholesterol",
  "HDL cholesterol",
  "Triglycerides",
] as const;
const THYROID = ["TSH", "Free T4"] as const;
const KIDNEY = ["Creatinine", "eGFR", "Blood urea nitrogen"] as const;

/** An Unsplash photograph, cropped tall for a card at twice its size. */
const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=680&h=960&q=70`;

export const CASE_STUDY_SCENARIOS = [
  {
    title: "The runner who suddenly can’t recover",
    body: "Her resting heart rate is rising, recovery is falling, and familiar workouts feel unusually difficult.",
    tests:
      "CBC, ferritin, serum iron, TIBC, transferrin saturation, TSH, free T4, vitamin B12, folate, CMP.",
    markers: [...CBC, ...IRON, ...THYROID, "Vitamin B12", "Folate", ...CMP],
    image: {
      src: unsplash("photo-1594882645126-14020914d58d"),
      alt: "A woman in silhouette running on a rocky trail against a low sun",
    },
  },
  {
    title: "The period that became a monthly energy drain",
    body: "Heavier or longer periods are followed by fatigue, breathlessness, headaches, or slower workouts.",
    tests:
      "CBC, ferritin and iron studies; pregnancy test and TSH when appropriate; clotting studies if heavy bleeding has been lifelong or occurs with easy bruising.",
    source: "ACOG guidance",
    markers: [...CBC, ...IRON, "TSH"],
    image: {
      src: unsplash("photo-1601881557868-34ad67bd4633"),
      alt: "A woman lying down, resting",
    },
  },
  {
    title: "The plant-based eater with brain fog",
    body: "Despite a thoughtful diet, they develop fatigue, trouble concentrating, numbness, or tingling.",
    tests:
      "CBC, vitamin B12, methylmalonic acid if B12 is borderline, folate, ferritin and iron studies.",
    source: "NIH vitamin B12 guidance",
    markers: [...CBC, "Vitamin B12", "Folate", ...IRON],
    image: {
      src: unsplash("photo-1512621776951-a57141f2eefd"),
      alt: "A bowl of vegetables and grains",
    },
  },
  {
    title: "The new parent who still doesn’t feel like herself",
    body: "Months after giving birth, the exhaustion, temperature sensitivity, mood changes, or racing heart feel different from ordinary sleep deprivation.",
    tests:
      "CBC, ferritin and iron studies, TSH, free T4, vitamin B12, folate, CMP.",
    markers: [...CBC, ...IRON, ...THYROID, "Vitamin B12", "Folate", ...CMP],
    image: {
      src: unsplash("photo-1583710457367-47de0ea21fef"),
      alt: "A woman carrying her baby",
    },
  },
  {
    title: "The healthy adult with heart disease in the family",
    body: "They exercise and feel well, but a parent or sibling experienced cardiovascular disease unusually early.",
    tests:
      "Standard lipid panel, ApoB, lipoprotein(a), A1C or fasting glucose; hs-CRP in selected risk assessments.",
    source: "ACC/AHA lipid guidance",
    markers: [
      ...LIPIDS,
      "Apolipoprotein B",
      "Lipoprotein(a)",
      "Hemoglobin A1c",
      "Fasting glucose",
      "hs-CRP",
    ],
    image: {
      src: unsplash("photo-1503431153573-96e959f4d9b7"),
      alt: "A family walking together along a dirt road",
    },
  },
  {
    title: "The afternoon crash that keeps getting louder",
    body: "Energy drops after meals, weight or waist size is creeping upward, and wearable trends show less activity and poorer recovery.",
    tests:
      "A1C, fasting plasma glucose, lipid panel, CMP and, when symptoms suggest it, TSH and free T4.",
    markers: ["Hemoglobin A1c", "Fasting glucose", ...LIPIDS, ...CMP, ...THYROID],
    image: {
      src: unsplash("photo-1752650735615-9829d8008a01"),
      alt: "A woman looking drained while working at a laptop",
    },
  },
  {
    title: "The thirst and bathroom trips that feel new",
    body: "They are constantly thirsty, urinating more often, losing weight unexpectedly, or waking repeatedly at night.",
    tests:
      "Plasma glucose, A1C, CMP with electrolytes and kidney function, urinalysis.",
    note: "A1C or glucose abnormalities generally require confirmation unless symptoms and glucose are unequivocal.",
    source: "ADA diagnostic guidance",
    markers: ["Fasting glucose", "Hemoglobin A1c", ...CMP, ...KIDNEY, "eGFR"],
    image: {
      src: unsplash("photo-1624948465121-96e87ae34a87"),
      alt: "A woman drinking a glass of water",
    },
  },
  {
    title: "The blood-pressure change with no obvious explanation",
    body: "Blood pressure is trending upward despite no major change in exercise, diet, or weight.",
    tests:
      "CMP with creatinine and electrolytes, eGFR, urine albumin-to-creatinine ratio, urinalysis, A1C, lipid panel and TSH.",
    markers: [...CMP, "eGFR", "Hemoglobin A1c", ...LIPIDS, "TSH"],
    image: {
      src: unsplash("photo-1615486511484-92e172cc4fe0"),
      alt: "A digital blood pressure monitor with its cuff on an arm",
    },
  },
  {
    title: "The kidney risk that produces no symptoms",
    body: "Someone with diabetes, hypertension, or a family history of kidney disease wants to check what blood pressure and glucose data cannot show.",
    tests:
      "Creatinine with eGFR and urine albumin-to-creatinine ratio; CMP, urinalysis and A1C as appropriate.",
    note: "Kidney assessment requires both filtration and urine-albumin information.",
    source: "National Kidney Foundation guidance",
    markers: ["Creatinine", "eGFR", ...CMP, "Hemoglobin A1c"],
    image: {
      src: unsplash("photo-1614698298859-4ab15bd3c0b2"),
      alt: "A man walking along a riverside path",
    },
  },
  {
    title: "The cycles that stopped being predictable",
    body: "Irregular periods appear alongside acne, unwanted hair growth, weight changes, or difficulty conceiving.",
    tests:
      "Pregnancy test, total and free testosterone, SHBG, TSH, prolactin; DHEAS when indicated; lipid panel and A1C, fasting glucose or OGTT for metabolic risk.",
    source: "International PCOS guidance",
    markers: [
      "Testosterone, total",
      "TSH",
      ...LIPIDS,
      "Hemoglobin A1c",
      "Fasting glucose",
    ],
    image: {
      src: unsplash("photo-1506784983877-45594efa4cbe"),
      alt: "A coffee mug resting on an open planner",
    },
  },
  {
    title: "The hairbrush collecting more than usual",
    body: "Hair shedding increases alongside fatigue, cold sensitivity, constipation, or changes in menstrual bleeding.",
    tests: "CBC, ferritin and iron studies, TSH, free T4 and vitamin B12.",
    note: "Symptoms alone cannot confirm thyroid disease.",
    source: "American Thyroid Association guidance",
    markers: [...CBC, ...IRON, ...THYROID, "Vitamin B12"],
    image: {
      src: unsplash("photo-1747398690600-ffe8ecda9df1"),
      alt: "A hand combing through long brown hair",
    },
  },
  {
    title: "The strength and libido drop he can’t explain",
    body: "A man notices reduced libido, fewer spontaneous erections, declining strength, fatigue, or unexplained anemia.",
    tests:
      "Morning fasting total testosterone on two separate days; SHBG and calculated free testosterone when indicated; LH, FSH, prolactin, TSH, CBC and A1C.",
    note: "Testosterone should not be used as general screening without compatible symptoms.",
    source: "Endocrine Society guidance",
    markers: ["Testosterone, total", "TSH", ...CBC, "Hemoglobin A1c"],
    image: {
      src: unsplash("photo-1641337221253-fdc7237f6b61"),
      alt: "A man holding a dumbbell in a gym",
    },
  },
  {
    title: "The gut symptoms that never quite add up",
    body: "Bloating, diarrhea, abdominal discomfort, weight loss, or unexplained iron deficiency keeps returning.",
    tests:
      "CBC, ferritin and iron studies, CMP, vitamin B12, folate, CRP, tissue-transglutaminase IgA and total IgA.",
    note: "Celiac testing should occur while the person is still eating gluten.",
    source: "American College of Gastroenterology guidance",
    markers: [...CBC, ...IRON, ...CMP, "Vitamin B12", "Folate", "hs-CRP"],
    image: {
      src: unsplash("photo-1536914561643-9e3a7a8d063d"),
      alt: "A woman drinking from a cup",
    },
  },
  {
    title: "The legs that won’t settle at night",
    body: "Sleep duration looks normal, but restless or uncomfortable legs repeatedly interrupt rest.",
    tests:
      "Ferritin and iron studies, CBC, vitamin B12, folate and kidney function.",
    note: "Low ferritin can be relevant even before obvious anemia develops.",
    source: "Ferritin testing guidance",
    markers: [...IRON, ...CBC, "Vitamin B12", "Folate", ...KIDNEY],
    image: {
      src: unsplash("photo-1531353826977-0941b4779a1c"),
      alt: "A woman asleep in bed under blankets",
    },
  },
  {
    title: "The bruises that keep appearing",
    body: "Bruising becomes easier, gums bleed, periods become unusually heavy, or small cuts take longer to stop bleeding.",
    tests:
      "CBC with platelet count, PT/INR, aPTT, CMP with liver markers; ferritin and iron studies when blood loss is ongoing.",
    source: "NHLBI bleeding-disorder guidance",
    markers: [...CBC, ...CMP, ...IRON],
    image: {
      src: unsplash("photo-1609840534195-e6385ca0d10a"),
      alt: "A hand holding an adhesive bandage",
    },
  },
  {
    title: "The stress fracture that shouldn’t have happened",
    body: "An active person experiences repeated stress injuries, loses height, or has a fracture after minimal impact.",
    tests:
      "Calcium, phosphorus, alkaline phosphatase, 25-hydroxy vitamin D, PTH, TSH, free T4, CBC and CMP; celiac screening or testosterone when indicated.",
    note: "Labs complement, not replace, a bone-density evaluation.",
    source: "Bone Health & Osteoporosis Foundation guidance",
    markers: [
      "Alkaline phosphatase",
      "Vitamin D, 25-OH",
      ...THYROID,
      ...CBC,
      ...CMP,
      "Testosterone, total",
    ],
    image: {
      src: unsplash("photo-1580058572462-98e2c0e0e2f0"),
      alt: "A runner in green trainers standing on rock",
    },
  },
  {
    title: "The workouts that now end in cramps and weakness",
    body: "Cramping, unusual weakness, or prolonged soreness starts appearing after otherwise familiar training.",
    tests:
      "CMP with sodium, potassium, calcium and kidney and liver markers; magnesium, CBC, ferritin and iron studies, TSH; creatine kinase when symptoms are persistent or severe.",
    note: "CK must be interpreted in the context of recent exercise.",
    markers: [...CMP, ...CBC, ...IRON, "TSH"],
    image: {
      src: unsplash("photo-1562771379-eafdca7a02f8"),
      alt: "A man in a sleeveless top, training",
    },
  },
  {
    title: "The midlife changes that feel bigger than “just hormones”",
    body: "Cycle changes, hot flashes, poor sleep, fatigue, or brain fog begin to overlap, making it difficult to tell what is driving what.",
    tests:
      "CBC and ferritin if bleeding is heavy, TSH and free T4, pregnancy test when applicable, A1C and lipid panel based on risk.",
    note: "Routine FSH or estradiol testing usually is not needed after age 45; it can be more useful in suspected early menopause.",
    markers: [...CBC, "Ferritin", ...THYROID, "Hemoglobin A1c", ...LIPIDS],
    image: {
      src: unsplash("photo-1758600433041-a8de32e651b1"),
      alt: "A woman with short blonde hair, deep in thought",
    },
  },
] satisfies CaseStudyScenario[];

/** What the strip says about a marker a scenario includes. */
const INCLUDED = { status: "clear", reading: "Included" } as const;

/**
 * A scenario as results for the strip: a pin over each marker its tests
 * include, reading "Included", with the marker’s own note kept as what it
 * means. No readings are invented; these are situations, not people.
 */
export const scenarioResults = (
  scenario: CaseStudyScenario
): CaseStudyResults => {
  const included = new Set<string>(scenario.markers);
  const results: CaseStudyResults["results"] = {};

  for (const marker of BIOMARKERS) {
    if (included.has(marker.name)) {
      results[marker.name] = { ...INCLUDED, meaning: marker.note };
    }
  }

  return { person: "This scenario", results };
};

/** How many of the strip’s markers a scenario includes, without repeats. */
export const markerCount = (scenario: CaseStudyScenario) =>
  new Set(scenario.markers).size;
