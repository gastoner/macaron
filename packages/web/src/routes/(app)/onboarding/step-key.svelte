<script lang="ts">
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import KeyRoundIcon from "@lucide/svelte/icons/key-round";
  import { resolve } from "$app/paths";
  import * as Alert from "#lib/components/ui/alert/index.js";
  import { Button } from "#lib/components/ui/button/index.js";
  import { Skeleton } from "#lib/components/ui/skeleton/index.js";
  import { getMyKey } from "../settings/key/key.remote.ts";
</script>

<div class="grid gap-4">
  <ul class="grid list-disc gap-2 ps-5 text-sm leading-relaxed">
    <li>Every run is billed to the LLM key of whoever asked for it: <strong>yours</strong>. There is no shared key.</li>
    <li>Your key is sealed when saved, and never shown, logged or given to a runner: each run gets its own key, capped at its budget.</li>
    <li>Set a monthly cap, and the bot refuses your requests once it is reached. Each comment of the bot shows what its run cost.</li>
  </ul>
  <svelte:boundary>
    {@const mine = await getMyKey()}
    {#if mine.key === null}
      <Alert.Root variant="destructive">
        <KeyRoundIcon />
        <Alert.Title>You haven't saved a key yet</Alert.Title>
        <Alert.Description>Until you do, the bot answers your mentions with a refusal.</Alert.Description>
        <Button href={resolve("/(app)/settings/key")} size="sm" class="col-start-2 mt-2 w-fit">Save your key</Button>
      </Alert.Root>
    {:else}
      <Alert.Root>
        <CircleCheckIcon />
        <Alert.Title>Your {mine.key.endpoint.name} key is saved</Alert.Title>
        <Alert.Description>Ending in {mine.key.last4}. Change it or set a monthly cap on the LLM key page.</Alert.Description>
      </Alert.Root>
    {/if}
    {#snippet pending()}
      <Skeleton class="h-20 rounded-lg" />
    {/snippet}
    {#snippet failed()}
      <p class="text-sm text-muted-foreground">Your key could not be loaded. Try again in a moment.</p>
    {/snippet}
  </svelte:boundary>
</div>
