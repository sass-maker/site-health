import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import { assertSourceManifestCanServe } from "./accuracy";
import { buildEstimate, type DemographicAggregate, type HeightAggregate } from "./estimate-core";
import type { EstimateFilters, EstimateResponse } from "./types";

const databasePath = path.join(
  process.cwd(),
  "data",
  "india-standards.duckdb",
);

let instancePromise: Promise<DuckDBInstance> | undefined;

async function getInstance() {
  if (!instancePromise) {
    instancePromise = access(databasePath)
      .then(() => DuckDBInstance.fromCache(databasePath))
      .catch(() => {
        instancePromise = undefined;
        throw new Error(
          "The local demo database is missing. Run `pnpm db:seed`, then retry.",
        );
      });
  }
  return instancePromise;
}

function numberValue(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error("The local database returned a non-numeric aggregate.");
  }
  return number;
}

export async function estimatePopulation(
  filters: EstimateFilters,
): Promise<EstimateResponse> {
  const instance = await getInstance();
  const connection = await instance.connect();

  try {
    const metadataReader = await connection.runAndReadAll(`
      SELECT data_mode, validation_status, authoritative
      FROM dataset_metadata
      LIMIT 1
    `);
    const [metadata] = metadataReader.getRowObjectsJson();
    if (!metadata) {
      throw new Error("The local database has no source-validation manifest.");
    }
    assertSourceManifestCanServe({
      dataMode: metadata.data_mode,
      validationStatus: metadata.validation_status,
      authoritative: metadata.authoritative,
    });

    const params = {
      gender: filters.gender,
      ageMin: filters.ageMin,
      ageMax: filters.ageMax,
      minIncome: filters.minIncome,
      maritalStatus: filters.maritalStatus,
      education: filters.education,
      state: filters.state,
      area: filters.area,
    };

    const demographicReader = await connection.runAndReadAll(
      `WITH selected AS (
        SELECT
          coalesce(sum(weighted_population), 0) AS weighted_population,
          coalesce(sum(weight_low), 0) AS weight_low,
          coalesce(sum(weight_high), 0) AS weight_high,
          coalesce(sum(observation_count), 0) AS observations
        FROM demographic_cube
        WHERE gender = $gender
          AND age BETWEEN $ageMin AND $ageMax
          AND income_floor >= $minIncome
          AND ($maritalStatus = 'any' OR marital_status = $maritalStatus)
          AND ($education = 'any' OR education = $education)
          AND ($state = 'all' OR state = $state)
          AND ($area = 'all' OR area = $area)
      ),
      gender_total AS (
        SELECT sum(weighted_population) AS denominator
        FROM demographic_cube
        WHERE gender = $gender
      ),
      age_total AS (
        SELECT sum(weighted_population) AS denominator
        FROM demographic_cube
        WHERE gender = $gender
          AND age BETWEEN $ageMin AND $ageMax
      )
      SELECT
        selected.*,
        gender_total.denominator AS gender_denominator,
        age_total.denominator AS age_denominator
      FROM selected, gender_total, age_total`,
      params,
    );
    const [demographicRow] = demographicReader.getRowObjectsJson();

    const heightReader = await connection.runAndReadAll(
      `SELECT
        sum(mean_cm * observation_count) /
          nullif(sum(observation_count), 0) AS mean_cm,
        sum(sd_cm * observation_count) /
          nullif(sum(observation_count), 0) AS sd_cm,
        sum(observation_count) AS observations
      FROM height_model
      WHERE gender = $gender
        AND age_min <= $ageMax
        AND age_max >= $ageMin
        AND ($state = 'all' OR state = $state)
        AND ($area = 'all' OR area = $area)`,
      {
        gender: filters.gender,
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        state: filters.state,
        area: filters.area,
      },
    );
    const [heightRow] = heightReader.getRowObjectsJson();

    if (!demographicRow || !heightRow) {
      throw new Error("The local database did not return model aggregates.");
    }

    const demographic: DemographicAggregate = {
      weightedPopulation: numberValue(demographicRow.weighted_population),
      weightLow: numberValue(demographicRow.weight_low),
      weightHigh: numberValue(demographicRow.weight_high),
      observations: numberValue(demographicRow.observations),
      genderDenominator: numberValue(demographicRow.gender_denominator),
      ageDenominator: numberValue(demographicRow.age_denominator),
    };
    const height: HeightAggregate = {
      meanCm: numberValue(heightRow.mean_cm),
      sdCm: numberValue(heightRow.sd_cm),
      observations: numberValue(heightRow.observations),
    };

    return buildEstimate(filters, demographic, height);
  } finally {
    connection.closeSync();
  }
}
