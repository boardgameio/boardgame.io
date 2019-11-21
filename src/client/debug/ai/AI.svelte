<script>
  export let client;

  import { MAKE_MOVE } from '../../../core/action-types';
  import Hotkey from '../main/Hotkey.svelte';
  import Options from './Options.svelte';
  import { MCTSBot } from '../../../ai/mcts-bot';
  import { RandomBot } from '../../../ai/random-bot';
  import MCTS from '../mcts/MCTS.svelte';
  import { Step as _Step } from '../../../ai/ai';
  import { getContext, onDestroy } from 'svelte';

  const { secondaryPane } = getContext('secondaryPane');

  const bots = {
    'MCTS': MCTSBot,
    'Random': RandomBot,
  };

  let iterationCounter = 0;
  const iterationCallback = (counter) => {
    iterationCounter = counter;
  }

  let bot;
  if (client.ai) {
    bot = new MCTSBot({
      game: client.game,
      enumerate: client.ai.enumerate,
      iterationCallback,
    });
  }

  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    bot = new botConstructor({
      game: client.game,
      enumerate: client.ai.enumerate,
      iterationCallback,
    });
    botAction = null;
    iterationCounter = 0;
  }

  async function Step() {
    iterationCounter = 0;
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

  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
  }

  function Reset() {
    client.reset();
    botAction = null;
    iterationCounter = 0;
  }

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Reset();
    }
  }

  onDestroy(Exit);
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
        <Hotkey value="1" onPress={Reset} label="reset" />
      </li>
      <li>
        <Hotkey value="2" onPress={Step} label="step" />
      </li>
      <li>
        <Hotkey value="3" onPress={Simulate} label="simulate" />
      </li>
    </section>

    <section>
      <h3>Bot</h3>
      <select bind:value={selectedBot} on:change={ChangeBot}>
        {#each Object.keys(bots) as bot}
          <option value={bot}>{bot}</option>
        {/each}
      </select>
    </section>

    {#if Object.keys(bot.opts()).length}
      <section>
        <h3>Options</h3>
        <Options bot={bot}/>
      </section>
    {/if}

    {#if botAction || iterationCounter}
    <section>
      <h3>Result</h3>
      {#if iterationCounter}
        <li>Iterations: {iterationCounter}</li>
      {/if}

      {#if botAction}
        <li>Action: {botAction}</li>
        <li>Args: {JSON.stringify(botActionArgs)}</li>
        <p>
        <button on:click={DebugLastMove}>Debug</button>
        </p>
      {/if}
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
