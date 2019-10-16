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

<style>
  li {
    list-style: none;
    margin: none;
    margin-bottom: 5px;
  }
</style>

<section id="debug-controls" class="controls">
  <li><Hotkey value="1" onPress={client.reset} label="reset" /></li>
  <li><Hotkey value="2" onPress={Save} label="save" /></li>
  <li><Hotkey value="3" onPress={Restore} label="restore" /></li>

  {#if client.step}
    <li><Hotkey value="4" onPress={client.step} label="step" /></li>
    <li><Hotkey value="5" onPress={Simulate} label="simulate" /></li>
  {/if}

  <li><Hotkey value="?" onPress={Toggle} label="show more" /></li>

  {#if expand && !dock}
    <li><Hotkey value="d" disable={true} label="show/hide this pane" /></li>
    <li><Hotkey value="t" disable={true} label="dock controls" /></li>
  {/if}
</section>
