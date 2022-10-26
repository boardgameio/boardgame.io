<script>
  export let client;
  export let clientManager;
  export let ToggleVisibility;

  import { onDestroy } from 'svelte';
  import JSONTree from 'svelte-json-tree-auto/src/Root.svelte';
  import ClientSwitcher from './ClientSwitcher.svelte';
  import Move from './Move.svelte';
  import Controls from './Controls.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import { AssignShortcuts } from '../utils/shortcuts';

  const shortcuts = AssignShortcuts(client.moves, 'mlia');

  function SanitizeCtx(ctx) {
    let r = {};
    for (const key in ctx) {
      if (!key.startsWith('_')) {
        r[key] = ctx[key];
      }
    }
    return r;
  }

  let { playerID, moves, events } = client;
  let ctx = {};
  let G = {};
  const unsubscribe = client.subscribe((state) => {
    if (state) ({ G, ctx } = state);
    ({ playerID, moves, events } = client);
  });

  onDestroy(unsubscribe);
</script>

<style>
  .tree {
    --json-tree-font-family: monospace;
    --json-tree-font-size: 14px;
    --json-tree-null-color: #757575;
  }

  .label {
    margin-bottom: 0;
    text-transform: none;
  }

  h3 {
    text-transform: uppercase;
  }

  ul {
    padding-left: 0;
  }

  li {
    list-style: none;
    margin: 0;
    margin-bottom: 5px;
  }
</style>

<section>
  <h3>Controls</h3>
  <Controls {client} {ToggleVisibility} />
</section>

<section>
  <h3>Players</h3>
  <PlayerInfo
    on:change={(e) => clientManager.switchPlayerID(e.detail.playerID)}
    ctx={ctx}
    playerID={playerID}
  />
</section>

<section>
  <h3>Moves</h3>
  <ul>
    {#each Object.entries(moves) as [name, fn]}
    <li>
      <Move shortcut={shortcuts[name]} {fn} {name} />
    </li>
    {/each}
  </ul>
</section>

<section>
  <h3>Events</h3>

  <ul>
  {#if ctx.activePlayers && events.endStage}
    <li>
      <Move name="endStage" shortcut={7} fn={events.endStage} />
    </li>
  {/if}
  {#if events.endTurn}
    <li>
      <Move name="endTurn" shortcut={8} fn={events.endTurn} />
    </li>
  {/if}
  {#if ctx.phase && events.endPhase}
    <li>
      <Move name="endPhase" shortcut={9} fn={events.endPhase} />
    </li>
  {/if}
  </ul>
</section>

<section class="tree">
  <h3 class="label">G</h3>
  <JSONTree value={G} />
</section>

<section class="tree">
  <h3 class="label">ctx</h3>
  <JSONTree value={SanitizeCtx(ctx)} />
</section>

<ClientSwitcher {clientManager} />
