<script lang="ts">
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BrainIcon from "@lucide/svelte/icons/brain";
  import BugIcon from "@lucide/svelte/icons/bug";
  import ClipboardCheckIcon from "@lucide/svelte/icons/clipboard-check";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import PlayIcon from "@lucide/svelte/icons/play";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import { onboardingLinks } from "#lib/onboarding.js";

  const links = [
    { icon: BugIcon, title: "Report a problem", text: "Something wrong with the bot or this app: open an issue on open-macaron/macaron.", href: onboardingLinks.newIssue },
    { icon: BookOpenIcon, title: "How the bot works", text: "The README, then the design document: architecture and trust boundaries.", href: onboardingLinks.readme },
    { icon: SettingsIcon, title: "open-macaron/config", text: "The trusted projects and repositories, their owners and budgets.", href: onboardingLinks.config },
    { icon: BrainIcon, title: "open-macaron/knowledge", text: "The rules reviews check, and the lessons the bot learned.", href: onboardingLinks.knowledge },
    { icon: PlayIcon, title: "open-macaron/runner", text: "Where every run happens, in public.", href: onboardingLinks.runner },
    { icon: ClipboardCheckIcon, title: "Review locally", text: "The same review, before you push, with your own agent: npx @open-macaron/review.", href: onboardingLinks.localReview },
  ];
</script>

<div class="grid gap-3 sm:grid-cols-2">
  {#each links as link (link.href)}
    <a href={link.href} target="_blank" rel="external noopener noreferrer" class="group grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
      <link.icon class="mt-0.5 size-4 text-muted-foreground" />
      <span class="grid gap-1">
        <span class="text-sm font-medium">{link.title}</span>
        <span class="text-xs leading-relaxed text-muted-foreground">{link.text}</span>
      </span>
      <ExternalLinkIcon class="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  {/each}
</div>
