export interface ProvisionedKey {
  /** The bearer key, shown once at creation. */
  readonly key: string;
  /** The gateway's id for the key: what every later call (disable, usage, delete) refers to. */
  readonly hash: string;
}

/** Where a run's LLM calls go, and the key they're billed to: its payer's. */
export interface Upstream {
  readonly endpointId: string;
  readonly baseUrl: string;
  readonly key: string;
}

export interface KeyStatus {
  readonly hash: string;
  readonly name: string;
  readonly disabled: boolean;
  readonly createdAt: Date;
}

/**
 * Per-run LLM keys, capped and self-expiring: the only port BudgetService and Housekeeping see.
 * Implementations hold the credential that mints keys; it never leaves them.
 */
export abstract class RunKeys {
  /** Where runners send Anthropic Messages requests with a minted key. */
  abstract readonly baseUrl: string;
  /** How long after a key is frozen before its usage is complete enough to read. */
  abstract readonly usageLagMs: number;

  /** Checks the gateway is usable before the controller accepts work. */
  abstract init(): Promise<void>;
  /** A key capped at `limitUsd`, refused after `expiresAt`, usable only with `models`, over `upstream`'s key. */
  abstract create(name: string, limitUsd: number, expiresAt: Date, models: readonly string[], upstream: Upstream): Promise<ProvisionedKey>;
  /** The models among `models` that can't be billed, so a key's budget wouldn't limit them. */
  abstract unpriced(models: readonly string[]): Promise<string[]>;
  /** Immediate: the next request made with the key is refused. */
  abstract disable(hash: string): Promise<void>;
  /** Idempotent: deleting a key that is already gone is not an error. */
  abstract delete(hash: string): Promise<void>;
  /** Every key whose name starts with `prefix`, disabled ones included. */
  abstract listByPrefix(prefix: string): Promise<KeyStatus[]>;
  /** Removes users' keys named `prefix`… left by interrupted mints, except those `keep` names; returns their names. */
  abstract sweepUpstreamKeys(prefix: string, keep: ReadonlySet<string>): Promise<string[]>;
  /** What the key spent, in USD, between `since` (a little before the run started) and now. */
  abstract spentSince(hash: string, since: Date): Promise<number>;
}
