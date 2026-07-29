export const GENDERS = ["men", "women"] as const;
export const MARITAL_STATUSES = [
  "any",
  "never_married",
  "married",
  "widowed_divorced",
] as const;
export const EDUCATION_LEVELS = [
  "any",
  "below_secondary",
  "secondary",
  "graduate",
  "postgraduate",
] as const;
export const AREA_TYPES = ["all", "urban", "rural"] as const;

export const INCOME_THRESHOLDS = [
  0, 100_000, 250_000, 500_000, 750_000, 1_000_000, 1_200_000, 1_500_000,
  2_000_000, 3_000_000, 5_000_000,
] as const;

export const DEMO_STATES = [
  "all",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other States / UTs",
] as const;

export type Gender = (typeof GENDERS)[number];
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];
export type Education = (typeof EDUCATION_LEVELS)[number];
export type AreaType = (typeof AREA_TYPES)[number];
export type DemoState = (typeof DEMO_STATES)[number];

export type EstimateFilters = {
  gender: Gender;
  ageMin: number;
  ageMax: number;
  minIncome: number;
  maritalStatus: MaritalStatus;
  education: Education;
  state: DemoState;
  area: AreaType;
  heightMin: number;
  heightMax: number;
};

export type EstimateSuccess = {
  status: "ok";
  estimate: {
    low: number;
    high: number;
    central: number;
  };
  observations: number;
  denominators: {
    selectedGender: number;
    ageCohort: number;
    percentOfGender: {
      low: number;
      high: number;
    };
    percentOfAgeCohort: {
      low: number;
      high: number;
    };
    oneInAgeCohort: {
      low: number;
      high: number;
    };
  };
  rangePrecision: {
    score: number;
    reason: string;
    disclaimer: "Range-precision score, not a probability that the estimate is correct";
  };
  estimateBasis: {
    mode: "direct" | "best_effort";
    label: "Direct cell estimate" | "Best-effort model";
    reason: string;
  };
  heightModel: {
    probability: number;
    low: number;
    high: number;
    observations: number;
    label: "Modelled across datasets";
  };
  source: {
    mode: "demo";
    label: "Synthetic test data";
    authoritative: false;
    validationStatus: "synthetic_fixture";
    notice: "Not a population estimate";
    demographic: "PLFS-shaped synthetic cube";
    demographicYear: 2025;
    height: "NFHS-shaped synthetic model";
    heightYear: "2019–2021";
  };
};

export type EstimateResponse = EstimateSuccess;

export const DEFAULT_FILTERS: EstimateFilters = {
  gender: "men",
  ageMin: 25,
  ageMax: 27,
  minIncome: 1_200_000,
  maritalStatus: "never_married",
  education: "graduate",
  state: "all",
  area: "all",
  heightMin: 170,
  heightMax: 183,
};
