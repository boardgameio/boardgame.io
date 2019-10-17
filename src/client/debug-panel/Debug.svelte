<script>
  export let client;

  import {writable} from 'svelte/store';
  import {setContext} from 'svelte';
  import { fly } from 'svelte/transition';
  import Menu from './Menu.svelte';
  import Move from './Move.svelte';
  import Controls from './Controls.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import { AssignShortcuts } from './assign-shortcuts';

  let G = {};
  let ctx = {};
  let visible = true;
  let pane = 'main';

  const disableHotkeys = writable(false);
  setContext('store', { disableHotkeys });

  $: if ($client !== null) {
    G = $client.G;
    ctx = $client.ctx;
  }

  function SanitizeCtx(ctx) {
    let r = {};
    for (const key in ctx) {
      if (!key.startsWith('_')) {
        r[key] = ctx[key];
      }
    }
    return r;
  }

  const shortcuts = AssignShortcuts(client.moves, client.events, 'dlit');

  function Keypress(e) {
    if (e.key == 'd') {
      visible = !visible;
    }
  }

  function MenuChange(e) {
    pane = e.detail;
  }
</script>

<style>
  .debug-panel {
    position: fixed;
    color: #555;
    font-family: monospace;
    display: flex;
    flex-direction: row;
    text-align: left;
    width: 320px;
    right: 0;
    top: 0;
    height: 100%;
    font-size: 14px;
    box-sizing: border-box;
    opacity: 0.9;
  }

  .pane {
    flex-grow: 2;
    overflow-x: hidden;
    overflow-y: scroll;
    background: #fefefe;
    padding: 20px;
    border-left: 1px solid #ccc;
    box-shadow: -1px 0 5px rgba(0, 0, 0, 0.2);
  }

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

<svelte:window on:keypress={Keypress} />

{#if visible}
  <div class="debug-panel" transition:fly={{ x: 400 }}>
    <Menu on:change={MenuChange} {pane} />

    <div class="pane">
      {#if pane == 'main'}
        <section>
          <h3>Controls</h3>
          <Controls {client} />
        </section>

        <section>
          <h3>Players</h3>
          <PlayerInfo {ctx} />
        </section>

        <section>
          <h3>Moves</h3>
          {#each Object.entries(client.moves) as [name, fn]}
            <li><Move shortcut={shortcuts[name]} {fn} {name} /></li>
          {/each}
        </section>

        <section>
          <h3>Events</h3>
          {#each Object.entries(client.events) as [name, fn]}
            <li><Move shortcut={shortcuts[name]} {fn} {name} /></li>
          {/each}
        </section>

        <section>
          <label>G</label>
          <pre class="json">{JSON.stringify(G, null, 2)}</pre>
        </section>

        <section>
          <label>ctx</label>
          <pre class="json">{JSON.stringify(SanitizeCtx(ctx), null, 2)}</pre>
        </section>
      {:else if pane == 'log'}Log{/if}
    </div>
  </div>
{/if}
