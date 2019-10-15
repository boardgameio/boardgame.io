<script>
  export let client;

  import PlayerInfo from './PlayerInfo.svelte';
  import Hotkey from './Hotkey.svelte';

  let G = {};
  let ctx = {};

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
</script>

<style>
  .panel {
    text-align: left;
    overflow-x: hidden;
    overflow-y: scroll;
    background: #fefefe;
    border-left: 1px solid #ddd;
    box-shadow: -1px 0 10px #aaa;
    position: absolute;
    width: 300px;
    right: 0;
    top: 0;
    height: 100%;
    font-family: monospace;
    font-size: 14px;
  }

  .pane {
    float: left;
    padding: 20px;
    box-sizing: border-box;
    min-width: 300px;
    max-width: 400px;
    opacity: 0.8;
  }

  section {
    margin-bottom: 20px;
  }
</style>

<div class="panel">
  <div class="pane">
    <h3>Players</h3>
    <PlayerInfo {ctx} />

    <h3>Moves</h3>

    <h3>Events</h3>
    <Hotkey value="A" />

    <section>
      <pre class="json">
        <strong>G</strong>: {JSON.stringify(G, null, 2)}
      </pre>
    </section>

    <section>
      <pre class="json">
        <strong>ctx</strong>: {JSON.stringify(SanitizeCtx(ctx), null, 2)}
      </pre>
    </section>
  </div>
</div>
