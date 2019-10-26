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
</script>

<style>
  .json {
    font-family: monospace;
    color: #888;
  }

  section {
    margin-bottom: 20px;
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
</style>

<section>
  <h3>Controls</h3>
  <Controls {client} />
</section>

<section>
  <h3>Players</h3>
  <PlayerInfo ctx={$client ? $client.ctx : {}} playerID={client.playerID} />
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
  {#each Object.entries(client.events) as [name, fn]}
    <li>
      <Move shortcut={shortcuts[name]} {fn} {name} />
    </li>
  {/each}
</section>

<section>
  <label>G</label>
  <pre class="json">{JSON.stringify($client ? $client.G : {}, null, 2)}</pre>
</section>

<section>
  <label>ctx</label>
  <pre class="json">
    {JSON.stringify(SanitizeCtx($client ? $client.ctx : {}), null, 2)}
  </pre>
</section>
