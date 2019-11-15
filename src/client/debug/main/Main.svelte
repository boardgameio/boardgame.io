<script>
  export let client;

  import Move from './Move.svelte';
  import Controls from './Controls.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import { AssignShortcuts } from '../utils/shortcuts';

  const shortcuts = AssignShortcuts(client.moves, client.events, 'mlia');

  function SanitizeCtx(ctx) {
    let r = {};
    for (const key in ctx) {
      if (!key.startsWith('_')) {
        r[key] = ctx[key];
      }
    }
    return r;
  }

  let playerID = client.playerID;
  let ctx = {};
  let G = {};
  client.subscribe((state) => {
    if (state) {
      G = state.G;
      ctx = state.ctx;
    }
    playerID = client.playerID;
  });
</script>

<style>
  .json {
    font-family: monospace;
    color: #888;
  }

  label {
    font-weight: bold;
    font-size: 1.1em;
    display: inline;
  }

  h3 {
    text-transform: uppercase;
  }

  li {
    list-style: none;
    margin: none;
    margin-bottom: 5px;
  }

  .events {
    display: flex;
    flex-direction: column;
  }

  .events button {
    width: 100px;
  }

  .events button:not(:last-child) {
    margin-bottom: 10px;
  }
</style>

<section>
  <h3>Controls</h3>
  <Controls {client} />
</section>

<section>
  <h3>Players</h3>
  <PlayerInfo
    on:change={(e) => client.updatePlayerID(e.detail.playerID)}
    ctx={ctx}
    playerID={playerID}
  />
</section>

<section>
  <h3>Moves</h3>
  {#each Object.entries(client.moves) as [name, fn]}
    <li>
      <Move shortcut={shortcuts[name]} {fn} {name} />
    </li>
  {/each}
</section>

<section>
  <h3>Events</h3>

  <div class="events">
  {#if client.events.endTurn}
    <button on:click={() => client.events.endTurn()}>End Turn</button>
  {/if}
  {#if ctx.phase && client.events.endPhase}
    <button on:click={() => client.events.endPhase()}>End Phase</button>
  {/if}
  {#if ctx.activePlayers && client.events.endStage}
    <button on:click={() => client.events.endStage()}>End Stage</button>
  {/if}
  </div>
</section>

<section>
  <label>G</label>
  <pre class="json">{JSON.stringify(G, null, 2)}</pre>
</section>

<section>
  <label>ctx</label>
  <pre class="json">
    {JSON.stringify(SanitizeCtx(ctx), null, 2)}
  </pre>
</section>
