<script lang="ts">
  import FolderGit2Icon from "@lucide/svelte/icons/folder-git-2";
  import StatusBadge from "#lib/components/admin/status-badge.svelte";
  import TableSkeleton from "#lib/components/admin/table-skeleton.svelte";
  import { Button } from "#lib/components/ui/button/index.js";
  import * as Card from "#lib/components/ui/card/index.js";
  import * as Empty from "#lib/components/ui/empty/index.js";
  import * as Table from "#lib/components/ui/table/index.js";
  import * as Tooltip from "#lib/components/ui/tooltip/index.js";
  import { getProjects } from "./projects.remote.ts";
</script>

<Card.Root class="pb-0">
  <Card.Header>
    <Card.Title>Projects</Card.Title>
    <Card.Description>Where the bot works, and whether each repository finished onboarding.</Card.Description>
  </Card.Header>
  <Card.Content class="px-0">
    <!-- Its own boundary: a failure here leaves the rest of the overview on screen. -->
    <svelte:boundary>
      {@const { projects } = await getProjects()}
      {#if projects.length === 0}
        <Empty.Root class="mx-6 mb-6 border border-dashed">
          <Empty.Header>
            <Empty.Media variant="icon"><FolderGit2Icon /></Empty.Media>
            <Empty.Title>No project yet</Empty.Title>
            <Empty.Description>Projects are added to open-macaron/config by pull request.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="ps-6">Project</Table.Head>
              <Table.Head>Repository</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head class="pe-6">Fork</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each projects as project (project.name)}
              {#each project.repos as { repo, fork } (repo)}
                <Table.Row>
                  <Table.Cell class="ps-6 text-muted-foreground">{project.name}</Table.Cell>
                  <Table.Cell><a class="font-medium hover:underline" href="https://github.com/{repo}" target="_blank" rel="noopener noreferrer">{repo}</a></Table.Cell>
                  <Table.Cell>
                    {#if fork !== null}
                      <StatusBadge tone="success" label="Ready" />
                    {:else}
                      <!-- "Not ready", never "in progress": a failed onboarding looks the same from here. -->
                      <Tooltip.Root>
                        <Tooltip.Trigger><StatusBadge tone="inactive" label="Not ready" /></Tooltip.Trigger>
                        <Tooltip.Content>The bot refuses requests here until its fork is ready. If this lasts, onboarding failed: see the comment on the config pull request.</Tooltip.Content>
                      </Tooltip.Root>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="pe-6">
                    {#if fork !== null}<a class="font-medium hover:underline" href="https://github.com/{fork}" target="_blank" rel="noopener noreferrer">{fork}</a>{/if}
                  </Table.Cell>
                </Table.Row>
              {:else}
                <Table.Row>
                  <Table.Cell class="ps-6 text-muted-foreground">{project.name}</Table.Cell>
                  <Table.Cell class="pe-6 text-muted-foreground" colspan={3}>No repository yet</Table.Cell>
                </Table.Row>
              {/each}
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}

      {#snippet pending()}
        <TableSkeleton rows={3} />
      {/snippet}
      {#snippet failed(error, reset)}
        <Empty.Root>
          <Empty.Header>
            <Empty.Title>The projects could not be loaded</Empty.Title>
            <Empty.Description>{error instanceof Error ? error.message : "Try again in a moment."}</Empty.Description>
          </Empty.Header>
          <Empty.Content><Button variant="outline" onclick={reset}>Try again</Button></Empty.Content>
        </Empty.Root>
      {/snippet}
    </svelte:boundary>
  </Card.Content>
</Card.Root>
