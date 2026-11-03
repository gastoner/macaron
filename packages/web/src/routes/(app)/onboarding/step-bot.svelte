<script lang="ts">
  import GitForkIcon from "@lucide/svelte/icons/git-fork";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import UserRoundCheckIcon from "@lucide/svelte/icons/user-round-check";
  import { onboardingLinks } from "#lib/onboarding.js";

  const facts = [
    { icon: GitForkIcon, text: "Works from its own forks, never with write access" },
    { icon: UserRoundCheckIcon, text: "Answers invited accounts only" },
    { icon: ShieldCheckIcon, text: "On trusted repositories only" },
  ];
</script>

<div class="grid gap-4">
  <p class="text-sm leading-relaxed">
    <a class="font-medium underline underline-offset-4" href={onboardingLinks.bot} target="_blank" rel="external noopener noreferrer">@macaron-bot</a> is a GitHub account of its own. Mention it on an issue or a pull request, and it gets to work.
  </p>
  <ul class="grid gap-2">
    {#each facts as fact (fact.text)}
      <li class="flex items-center gap-2 text-sm text-muted-foreground"><fact.icon class="size-4" />{fact.text}</li>
    {/each}
  </ul>
</div>
