<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import CheckIcon from "@lucide/svelte/icons/check";
  import type { Component } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { Button } from "#lib/components/ui/button/index.js";
  import * as Dialog from "#lib/components/ui/dialog/index.js";
  import { Progress } from "#lib/components/ui/progress/index.js";
  import { completeOnboarding } from "../me.remote.ts";
  import StepBot from "./step-bot.svelte";
  import StepCommands from "./step-commands.svelte";
  import StepHow from "./step-how.svelte";
  import StepKey from "./step-key.svelte";
  import StepLinks from "./step-links.svelte";
  import StepProject from "./step-project.svelte";

  let { onboarded }: { onboarded: boolean } = $props();

  // Opens until the user closes it, whichever way: Skip, Finish, the close button or Escape.
  let closed = $state(false);
  const open = $derived(!onboarded && !closed);

  function close(): void {
    closed = true;
    // Not awaited: should it fail, the onboarding opens again at the next visit, nothing worse.
    completeOnboarding().catch(() => undefined);
  }

  // Following a link of a step ("Save your key") is finishing too.
  beforeNavigate(() => {
    if (open) close();
  });

  interface Step {
    readonly title: string;
    readonly description: string;
    readonly body: Component;
  }

  // The key last: without one the bot refuses every request, so it's what the user does next.
  const steps: readonly Step[] = [
    { title: "Meet macaron-bot", description: "An AI contributor for open-source projects.", body: StepBot },
    { title: "How it works", description: "From your mention to its comment, on GitHub Actions.", body: StepHow },
    { title: "What you can ask", description: "The comments it answers, and where to write them.", body: StepCommands },
    { title: "Bring a project", description: "Where the bot may work, and how a repository is added.", body: StepProject },
    { title: "Help and links", description: "Where to read more, and to report a problem.", body: StepLinks },
    { title: "Your key and cost", description: "Every run is paid for by whoever asks.", body: StepKey },
  ];

  let index = $state(0);
  const step = $derived(steps[index]);
  const last = $derived(index === steps.length - 1);
</script>

<Dialog.Root {open} onOpenChange={(next) => { if (!next) close(); }}>
  <Dialog.Content class="max-h-[calc(100dvh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)_auto] sm:max-w-2xl">
    {#if step !== undefined}
      <Dialog.Header>
        <Dialog.Title class="text-xl">{step.title}</Dialog.Title>
        <Dialog.Description>{step.description}</Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-1">
        <Progress value={((index + 1) / steps.length) * 100} aria-label="Onboarding progress" />
        <span class="text-end text-xs text-muted-foreground">{index + 1} of {steps.length}</span>
      </div>
      <div class="overflow-y-auto">
        <step.body />
      </div>
    {/if}
    <Dialog.Footer class="sm:justify-between">
      <Button variant="ghost" onclick={close}>Skip</Button>
      <div class="flex gap-2">
        <Button variant="outline" disabled={index === 0} onclick={() => (index -= 1)}>
          <ArrowLeftIcon />
          Back
        </Button>
        {#if last}
          <Button onclick={close}>
            <CheckIcon />
            Finish
          </Button>
        {:else}
          <Button onclick={() => (index += 1)}>
            Next
            <ArrowRightIcon />
          </Button>
        {/if}
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
