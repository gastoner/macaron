import type { Capability } from "@open-macaron/contracts/capability";

/** Where a comment to the bot is written. */
export type Place = "issue" | "pull request";

export interface BotCommand {
  /** What to write, after the mention. Empty for a bare mention. */
  readonly command: string;
  /** What the account needs to ask for it; null: anyone with an account, for runs they may ask for. */
  readonly capability: Capability | null;
  readonly where: readonly Place[];
  readonly does: string;
}

/** The comments the bot answers, in the order a newcomer meets them (README's table). */
export const botCommands: readonly BotCommand[] = [
  { command: "implement", capability: "implement", where: ["issue"], does: "Implements the issue and opens a draft pull request from its fork." },
  { command: "plan", capability: "plan", where: ["issue"], does: "Posts an implementation plan on the issue, changes nothing." },
  { command: "reproduce", capability: "reproduce", where: ["issue"], does: "Reproduces the reported problem, with the commands it ran, their output, and screenshots or videos." },
  { command: "review", capability: "review", where: ["pull request"], does: "Reviews the changes against the knowledge base's rules: one review, an inline comment per violation." },
  { command: "verify", capability: "verify", where: ["pull request"], does: "Checks that the change does what it should, the way reproduce does." },
  { command: "triage", capability: "triage", where: ["issue", "pull request"], does: "Decides what the request needs: an answer, or one of the above. A bare mention does the same." },
  { command: "remember: …", capability: "remember", where: ["issue", "pull request"], does: "Proposes a lesson to the knowledge base, once it has checked the claim." },
  { command: "retry", capability: null, where: ["issue", "pull request"], does: "Runs the last failed or stopped request again." },
  { command: "stop", capability: null, where: ["issue", "pull request"], does: "Stops the running request now." },
];

/** Where to read more, ask, or report. */
export const onboardingLinks = {
  bot: "https://github.com/macaron-bot",
  issues: "https://github.com/open-macaron/macaron/issues",
  newIssue: "https://github.com/open-macaron/macaron/issues/new",
  readme: "https://github.com/open-macaron/macaron#readme",
  design: "https://github.com/open-macaron/macaron/blob/main/docs/DESIGN.md",
  runner: "https://github.com/open-macaron/runner",
  runs: "https://github.com/open-macaron/runner/actions",
  config: "https://github.com/open-macaron/config",
  configReadme: "https://github.com/open-macaron/config#readme",
  knowledge: "https://github.com/open-macaron/knowledge",
  localReview: "https://github.com/open-macaron/macaron/tree/main/packages/review#readme",
};
