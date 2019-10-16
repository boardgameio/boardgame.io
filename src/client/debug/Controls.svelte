<script>
  import Hotkey from './Hotkey.svelte';
  import { sync } from '../../core/action-creators';
  import { parse, stringify } from 'flatted';

  export let client;
  export let dock = false;

  let expand = false;

  function Toggle() {
    expand = !expand;
  }

  function Simulate(iterations = 10000, sleepTimeout = 100) {
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await client.step();
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  }

  function Save() {
    const { G, ctx } = client.getState();
    const json = stringify({ G, ctx });
    window.localStorage.setItem('gamestate', json);
  }

  function Restore() {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      client.store.dispatch(sync(gamestate));
    }
  }
</script>

<section id="debug-controls" class="controls">
  <Hotkey value="1" onPress={client.reset} label="reset" />
  <Hotkey value="2" onPress={Save} label="save" />
  <Hotkey value="3" onPress={Restore} label="restore" />

  {#if client.step}
    <Hotkey value="4" onPress={client.step} label="step" />
    <Hotkey value="5" onPress={Simulate} label="simulate" />
  {/if}

  <Hotkey value="?" onPress={Toggle} label="show more" />

  {#if expand && !dock}
    <Hotkey value="d" disable={true} label="show/hide this pane" />
    <Hotkey value="t" disable={true} label="dock controls" />
  {/if}
</section>
