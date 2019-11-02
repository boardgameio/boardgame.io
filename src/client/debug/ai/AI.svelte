<script>
  export let client;

  import { MAKE_MOVE } from '../../../core/action-types';
  import Hotkey from '../main/Hotkey.svelte';
  import { MCTSBot } from '../../../ai/mcts-bot';
  import MCTS from '../mcts/MCTS.svelte';
  import { Step as _Step } from '../../../ai/ai';
  import { getContext, onDestroy } from 'svelte';

  const { secondaryPane } = getContext('secondaryPane');

  const bot = new MCTSBot({
    game: client.game,
    enumerate: client.ai.enumerate,
  });

  let botAction;
  let botActionArgs;
  async function Step() {
    const t = await _Step(client, bot);
    botAction = t.payload.type;
    botActionArgs = t.payload.args;
  }

  function Simulate(iterations = 10000, sleepTimeout = 100) {
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await _Step(client, bot);
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  }

  function DebugLastMove() {
    const { log } = client.getState();
    const renderedLogEntries = log.filter(e => e.action.type == MAKE_MOVE);

    if (renderedLogEntries.length > 0) {
      const index = renderedLogEntries.length - 1;
      const { metadata } = renderedLogEntries[index].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }

  function Reset() {
    client.overrideGameState(null);
    secondaryPane.set(null);
  }

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Reset();
    }
  }

  onDestroy(Reset);
</script>

<style>
  li {
    list-style: none;
    margin: none;
    margin-bottom: 5px;
  }

  h3 {
    text-transform: uppercase;
  }
</style>

<svelte:window on:keydown={OnKeyDown}/>

<section>
  {#if client.ai && !client.multiplayer}
    <section>
      <h3>Controls</h3>
      <li>
        <Hotkey value="1" onPress={client.reset} label="reset" />
      </li>
      <li>
        <Hotkey value="2" onPress={Step} label="step" />
      </li>
      <li>
        <Hotkey value="3" onPress={Simulate} label="simulate" />
      </li>
    </section>

    {#if botAction}
    <section>
      <h3>Bot Action</h3>
      <li>{botAction}</li>
      <li>Args: {JSON.stringify(botActionArgs)}</li>
      <p>
      <button on:click={DebugLastMove}>Debug</button>
      </p>
    </section>
    {/if}
  {:else}
    <p>No bots available.</p>

    <p>
      Follow the instructions
      <a
        href="https://boardgame.io/documentation/#/tutorial?id=bots"
        target="_blank">
        here</a>
      to set up bots.
    </p>
  {/if}
</section>
