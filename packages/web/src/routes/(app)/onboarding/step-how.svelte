<script lang="ts">
  import AtSignIcon from "@lucide/svelte/icons/at-sign";
  import MessageSquareTextIcon from "@lucide/svelte/icons/message-square-text";
  import PlayIcon from "@lucide/svelte/icons/play";
  import ServerCogIcon from "@lucide/svelte/icons/server-cog";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { onboardingLinks } from "#lib/onboarding.js";

  const flow = [
    { icon: AtSignIcon, title: "You mention @macaron-bot", text: "In a comment on an issue or a pull request of a trusted repository. It reacts with 👀 within a minute." },
    { icon: ServerCogIcon, title: "The controller decides", text: "It holds every credential. It checks your account and capability, the repository's budget and your key, then starts a run." },
    { icon: PlayIcon, title: "An agent runs on GitHub Actions", text: "On a throwaway GitHub-hosted runner of open-macaron/runner, with no GitHub token at all and one LLM key capped at the run's budget." },
    { icon: ShieldIcon, title: "The Gate checks its output", text: "Paths, sizes, secrets, media types: what the agent returns is untrusted until it passes." },
    { icon: MessageSquareTextIcon, title: "The controller answers", text: "One comment where you asked, edited until the cost settles, or a pull request from the fork. Then 👍, or 😕 with the reason." },
  ];
</script>

<div class="grid gap-6">
  <ol class="grid gap-4">
    {#each flow as item, position (item.title)}
      <li class="flex gap-4">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted">
          <item.icon class="size-4" />
        </div>
        <div class="grid gap-1">
          <p class="text-sm font-medium">{position + 1}. {item.title}</p>
          <p class="text-xs leading-relaxed text-muted-foreground">{item.text}</p>
        </div>
      </li>
    {/each}
  </ol>
  <p class="text-xs text-muted-foreground">
    Every run is public: follow it on <a class="underline underline-offset-4" href={onboardingLinks.runs} target="_blank" rel="external noopener noreferrer">open-macaron/runner's Actions</a>. Its comment links to it, with the runner and the cost in a small footer.
  </p>
</div>
