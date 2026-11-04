import { readFileSync } from "node:fs";
import { z } from "zod";

const Prices = z.record(z.string(), z.object({ input_cost_per_token: z.number().optional(), output_cost_per_token: z.number().optional() }));

/** The models the gateway prices (deploy/bifrost/pricing.json), as the controller's PriceList reads them: input and output both above $0. */
export const PRICED: readonly string[] = Object.entries(Prices.parse(JSON.parse(readFileSync(new URL("../../../deploy/bifrost/pricing.json", import.meta.url), "utf8"))))
  .filter(([, price]) => (price.input_cost_per_token ?? 0) > 0 && (price.output_cost_per_token ?? 0) > 0)
  .map(([model]) => model)
  .sort();
