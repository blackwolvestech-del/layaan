// Snapshots the live catalogue (storefront_catalog + storefront_settings RPCs) into
// tests/fixtures/catalog.json, so unit tests run on real product data without network access.
// Usage: node --env-file=.env.local scripts/catalog-fixture.mjs
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
const db = createClient(url, key);
const [cat, settings] = await Promise.all([db.rpc("storefront_catalog"), db.rpc("storefront_settings")]);
if (cat.error) throw cat.error;
writeFileSync("tests/fixtures/catalog.json", JSON.stringify({ products: cat.data, settings: settings.data }, null, 2) + "\n");
console.log(`Saved ${cat.data.length} products.`);
