import type {
  EstimateFilters,
  EstimateResponse,
  EstimateSuccess,
} from "./types.ts";

export type DemographicAggregate = {
  weightedPopulation: number;
  weightLow: number;
  weightHigh: number;
  observations: number;
  genderDenominator: number;
  ageDenominator: number;
};

export type HeightAggregate = {
  meanCm: number;
  sdCm: number;
  observations: number;
};

const SOURCE: EstimateSuccess["source"] = {
  mode: "demo",
  label: "Synthetic test data",
  authoritative: false,
  validationStatus: "synthetic_fixture",
  notice: "Not a population estimate",
  demographic: "PLFS-shaped synthetic cube",
  demographicYear: 2025,
  height: "NFHS-shaped synthetic model",
  heightYear: "2019–2021",
};

function normalCdf(value: number, mean: number, sd: number) {
  const z = (value - mean) / (sd * Math.sqrt(2));
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z);
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    sign *
    (1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
        0.284496736) *
        t +
        0.254829592) *
        t *
        Math.exp(-x * x));
  return 0.5 * (1 + erf);
}

export function heightProbability(
  heightMin: number,
  heightMax: number,
  meanCm: number,
  sdCm: number,
) {
  const lowerEdge = heightMin - 0.5;
  const upperEdge = heightMax + 0.5;
  return Math.max(
    0,
    Math.min(
      1,
      normalCdf(upperEdge, meanCm, sdCm) -
        normalCdf(lowerEdge, meanCm, sdCm),
    ),
  );
}

export function roundToThreeSignificantDigits(value: number) {
  if (!Number.isFinite(value) || value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (2 - magnitude);
  return Math.round(value * factor) / factor;
}

function incomeTailMargin(minIncome: number) {
  if (minIncome >= 5_000_000) return 0.3;
  if (minIncome >= 3_000_000) return 0.22;
  if (minIncome >= 2_000_000) return 0.16;
  if (minIncome >= 1_500_000) return 0.1;
  if (minIncome >= 1_200_000) return 0.08;
  if (minIncome >= 1_000_000) return 0.05;
  return 0;
}

export function rangePrecisionFor(
  filters: EstimateFilters,
  observations: number,
  central: number,
  low: number,
  high: number,
) {
  const relativeHalfWidth =
    central > 0
      ? Math.max(0, high - low) / (2 * central)
      : Number.POSITIVE_INFINITY;
  const score = Number.isFinite(relativeHalfWidth)
    ? Math.round(100 / (1 + relativeHalfWidth))
    : 0;
  const relativeLabel = Number.isFinite(relativeHalfWidth)
    ? `${Math.round(relativeHalfWidth * 100)}%`
    : "unbounded";
  const incomeNote =
    filters.minIncome >= 1_000_000
      ? " High-income-tail widening is included."
      : "";

  return {
    score,
    reason: `The range half-width is ${relativeLabel} of the central estimate, based on ${observations} direct test records.${incomeNote}`,
    disclaimer:
      "Range-precision score, not a probability that the estimate is correct" as const,
  };
}

export function buildEstimate(
  filters: EstimateFilters,
  demographic: DemographicAggregate,
  height: HeightAggregate,
): EstimateResponse {
  const probability = heightProbability(
    filters.heightMin,
    filters.heightMax,
    height.meanCm,
    height.sdCm,
  );
  const heightMargin = Math.min(
    0.22,
    Math.max(0.035, 1.8 / Math.sqrt(Math.max(height.observations, 1))),
  );
  const probabilityLow = Math.max(0, probability * (1 - heightMargin));
  const probabilityHigh = Math.min(1, probability * (1 + heightMargin));
  const sparseMargin =
    demographic.observations >= 30
      ? 0
      : 0.75 * (1 - demographic.observations / 30);
  const tailMargin = incomeTailMargin(filters.minIncome);

  const central = demographic.weightedPopulation * probability;
  const low =
    demographic.weightLow *
    probabilityLow *
    Math.max(0, 1 - sparseMargin) *
    (1 - tailMargin);
  const high =
    demographic.weightHigh *
    probabilityHigh *
    (1 + sparseMargin) *
    (1 + tailMargin);
  const roundedLow = roundToThreeSignificantDigits(low);
  const roundedHigh = roundToThreeSignificantDigits(high);
  const roundedCentral = roundToThreeSignificantDigits(central);

  const percentOfGenderLow =
    (roundedLow / demographic.genderDenominator) * 100;
  const percentOfGenderHigh =
    (roundedHigh / demographic.genderDenominator) * 100;
  const percentOfAgeLow = (roundedLow / demographic.ageDenominator) * 100;
  const percentOfAgeHigh = (roundedHigh / demographic.ageDenominator) * 100;

  return {
    status: "ok",
    estimate: {
      low: roundedLow,
      high: roundedHigh,
      central: roundedCentral,
    },
    observations: demographic.observations,
    denominators: {
      selectedGender: roundToThreeSignificantDigits(
        demographic.genderDenominator,
      ),
      ageCohort: roundToThreeSignificantDigits(demographic.ageDenominator),
      percentOfGender: {
        low: roundToThreeSignificantDigits(percentOfGenderLow),
        high: roundToThreeSignificantDigits(percentOfGenderHigh),
      },
      percentOfAgeCohort: {
        low: roundToThreeSignificantDigits(percentOfAgeLow),
        high: roundToThreeSignificantDigits(percentOfAgeHigh),
      },
      oneInAgeCohort: {
        low: Math.max(
          1,
          roundToThreeSignificantDigits(
            demographic.ageDenominator / Math.max(roundedHigh, 1),
          ),
        ),
        high: Math.max(
          1,
          roundToThreeSignificantDigits(
            demographic.ageDenominator / Math.max(roundedLow, 1),
          ),
        ),
      },
    },
    rangePrecision: rangePrecisionFor(
      filters,
      demographic.observations,
      roundedCentral,
      roundedLow,
      roundedHigh,
    ),
    estimateBasis:
      demographic.observations < 30
        ? {
            mode: "best_effort",
            label: "Best-effort model",
            reason:
              demographic.observations === 0
                ? "No direct synthetic test records matched; the generated model cell supplies the central value and the range is widened."
                : "Fewer than 30 direct synthetic test records matched; the generated model cell supplies the central value and the range is widened.",
          }
        : {
            mode: "direct",
            label: "Direct cell estimate",
            reason:
              "At least 30 direct synthetic test records matched this generated model cell.",
          },
    heightModel: {
      probability: roundToThreeSignificantDigits(probability),
      low: roundToThreeSignificantDigits(probabilityLow),
      high: roundToThreeSignificantDigits(probabilityHigh),
      observations: height.observations,
      label: "Modelled across datasets",
    },
    source: SOURCE,
  };
}
