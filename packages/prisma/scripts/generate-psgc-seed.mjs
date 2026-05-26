#!/usr/bin/env node

/**
 * Fetches the Philippine Standard Geographic Code (PSGC) dataset from the
 * public API at psgc.gitlab.io and generates a SQL seed file that populates
 * the lgus and barangays tables.
 *
 * Data source: Philippine Statistics Authority (PSA) via psgc.gitlab.io/api
 *
 * Usage:  node packages/prisma/scripts/generate-psgc-seed.mjs
 * Output: packages/prisma/scripts/seed-psgc.sql
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = 'https://psgc.gitlab.io/api';

async function fetchJson(path) {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

async function main() {
  console.log('Fetching PSGC data from psgc.gitlab.io ...');

  const [regions, provinces, cities, barangays] = await Promise.all([
    fetchJson('regions.json'),
    fetchJson('provinces.json'),
    fetchJson('cities-municipalities.json'),
    fetchJson('barangays.json'),
  ]);

  console.log(
    `  Regions: ${regions.length}, Provinces: ${provinces.length}, ` +
      `Cities/Municipalities: ${cities.length}, Barangays: ${barangays.length}`
  );

  const regionByCode = Object.fromEntries(regions.map((r) => [r.code, r.name]));
  const provinceByCode = Object.fromEntries(provinces.map((p) => [p.code, p.name]));

  const cityCodeSet = new Set(cities.map((c) => c.code));

  const lines = [];
  lines.push('-- PSGC (Philippine Standard Geographic Code) seed data.');
  lines.push('-- Generated from https://psgc.gitlab.io/api (PSA official data).');
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push('--');
  lines.push(`-- LGUs: ${cities.length}`);
  lines.push(`-- Barangays: ${barangays.length}`);
  lines.push('--');
  lines.push('-- This file is idempotent. It deletes psgc_* rows before inserting.');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');
  lines.push("DELETE FROM \"barangays\" WHERE \"id\" LIKE 'psgc_brgy_%';");
  lines.push("DELETE FROM \"lgus\" WHERE \"id\" LIKE 'psgc_lgu_%';");
  lines.push('');

  // --- LGUs (cities/municipalities) ---
  lines.push('-- LGUs');
  const BATCH = 500;
  for (let i = 0; i < cities.length; i += BATCH) {
    const batch = cities.slice(i, i + BATCH);
    lines.push(
      'INSERT INTO "lgus" ("id", "name", "province", "city_or_municipality", "created_at", "updated_at") VALUES'
    );
    const rows = batch.map((c) => {
      const id = `psgc_lgu_${c.code}`;
      const provinceName = c.provinceCode
        ? provinceByCode[c.provinceCode] || 'Unknown'
        : c.regionCode === '130000000'
          ? 'Metro Manila'
          : regionByCode[c.regionCode] || 'Unknown';
      const displayName = c.name;
      const alreadyPrefixed =
        c.name.startsWith('City of ') || c.name.startsWith('Municipality of ');
      const cityOrMunicipality = alreadyPrefixed
        ? c.name
        : c.isCity
          ? `City of ${c.name}`
          : `Municipality of ${c.name}`;

      return (
        `  ('${id}', '${escapeSql(displayName)}', '${escapeSql(provinceName)}', ` +
        `'${escapeSql(cityOrMunicipality)}', NOW(), NOW())`
      );
    });
    lines.push(rows.join(',\n') + ';');
    lines.push('');
  }

  // --- Barangays ---
  lines.push('-- Barangays');
  for (let i = 0; i < barangays.length; i += BATCH) {
    const batch = barangays.slice(i, i + BATCH);
    lines.push(
      'INSERT INTO "barangays" ("id", "lgu_id", "name", "risk_level", "created_at", "updated_at") VALUES'
    );
    const rows = [];
    for (const b of batch) {
      const parentCode = b.cityCode || b.municipalityCode;
      if (!parentCode || !cityCodeSet.has(parentCode)) continue;

      const id = `psgc_brgy_${b.code}`;
      const lguId = `psgc_lgu_${parentCode}`;
      rows.push(`  ('${id}', '${lguId}', '${escapeSql(b.name)}', 'low', NOW(), NOW())`);
    }
    if (rows.length > 0) {
      lines.push(rows.join(',\n') + ';');
    }
    lines.push('');
  }

  lines.push('COMMIT;');

  const outPath = resolve(__dirname, 'seed-psgc.sql');
  writeFileSync(outPath, lines.join('\n'), 'utf-8');

  console.log(`\nWrote ${outPath}`);
  console.log(`  ${cities.length} LGUs, ${barangays.length} barangays`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
