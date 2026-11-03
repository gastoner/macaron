<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import LockIcon from "@lucide/svelte/icons/lock";
  import { capabilityInfo } from "#lib/capabilities.js";
  import * as Alert from "#lib/components/ui/alert/index.js";
  import { Badge } from "#lib/components/ui/badge/index.js";
  import { Skeleton } from "#lib/components/ui/skeleton/index.js";
  import * as Table from "#lib/components/ui/table/index.js";
  import { botCommands } from "#lib/onboarding.js";
  import { getMe } from "../me.remote.ts";
</script>

<svelte:boundary>
  {@const me = await getMe()}
  {@const granted = botCommands.filter((command) => command.capability === null || me.capabilities.includes(command.capability))}
  {@const locked = botCommands.filter((command) => command.capability !== null && !me.capabilities.includes(command.capability))}
  <div class="grid gap-4">
    <p class="text-sm leading-relaxed">Write <code class="rounded bg-muted px-1 py-0.5 text-xs">@macaron-bot &lt;command&gt;</code> in a comment, followed by anything it should know. It answers in the same thread.</p>
    <div class="overflow-hidden rounded-lg border">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="ps-4">Comment</Table.Head>
            <Table.Head>On</Table.Head>
            <Table.Head class="pe-4">What happens</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each granted as command (command.command)}
            <Table.Row>
              <Table.Cell class="ps-4 align-top"><code class="text-xs font-medium whitespace-nowrap">@macaron-bot {command.command}</code></Table.Cell>
              <Table.Cell class="align-top">
                <div class="flex gap-1">
                  {#each command.where as place (place)}<Badge variant="outline">{place}</Badge>{/each}
                </div>
              </Table.Cell>
              <Table.Cell class="pe-4 text-xs whitespace-normal text-muted-foreground">{command.does}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    {#if me.capabilities.includes("implement")}
      <Alert.Root>
        <CheckIcon />
        <Alert.Title>On its own pull requests, no mention is needed</Alert.Title>
        <Alert.Description>Review the pull request it opened for you: it addresses each review comment with a new commit and an answer in the thread.</Alert.Description>
      </Alert.Root>
    {/if}
    {#if locked.length > 0}
      <div class="grid gap-2 rounded-lg border border-dashed p-4">
        <p class="flex items-center gap-2 text-sm font-medium"><LockIcon class="size-4" /> Not granted to you</p>
        <div class="flex flex-wrap gap-1">
          {#each locked as command (command.command)}
            {#if command.capability !== null}
              {@const info = capabilityInfo[command.capability]}
              <Badge variant="secondary"><info.icon />{info.label}</Badge>
            {/if}
          {/each}
        </div>
        <p class="text-xs text-muted-foreground">Asking for these is refused with a reply. An administrator grants capabilities: ask one if you need them.</p>
      </div>
    {/if}
  </div>
  {#snippet pending()}
    <Skeleton class="h-64 rounded-lg" />
  {/snippet}
  {#snippet failed()}
    <p class="text-sm text-muted-foreground">Your capabilities could not be loaded. Try again in a moment.</p>
  {/snippet}
</svelte:boundary>
