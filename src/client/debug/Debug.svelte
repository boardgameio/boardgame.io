<script>
  export let client;

  import { fly } from 'svelte/transition';
  import Menu from './Menu.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import Hotkey from './Hotkey.svelte';

  let G = {};
  let ctx = {};
  let visible = true;
  let pane = 'main';

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
    display: flex;
    flex-direction: row;
    text-align: left;
    overflow-x: hidden;
    overflow-y: scroll;
    background: #fefefe;
    width: 320px;
    right: 0;
    top: 0;
    height: 100%;
    font-family: monospace;
    font-size: 14px;
    box-sizing: border-box;
    opacity: 0.8;
  }

  .pane {
    flex-grow: 2;
    padding: 20px;
    border-left: 1px solid #ddd;
    box-shadow: -1px 0 5px #aaa;
  }

  section {
    margin-top: 20px;
  }

  label {
    font-weight: bold;
    font-size: 1.1em;
    display: inline;
  }
</style>

<svelte:window on:keypress={Keypress} />

{#if visible}
  <div class="debug-panel" transition:fly={{ x: 400 }}>
    <Menu on:change={MenuChange} {pane} />

    <div class="pane">
      {#if pane == 'main'}
        <h3>Players</h3>
        <PlayerInfo {ctx} />

        <h3>Moves</h3>

        <h3>Events</h3>
        <Hotkey value="A" />

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
