<script>
  export let client;
  export let clientManager;
  export let ToggleVisibility;

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

  let debug = false;
  let progress = null;
  let iterationCounter = 0;
  let metadata = null;
  const iterationCallback = ({ iterationCounter: c, numIterations, metadata: m }) => {
    iterationCounter = c;
    progress = c / numIterations;
    metadata = m;

    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    }
  }

  function OnDebug() {
    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    } else {
      secondaryPane.set(null);
    }
  }

  let bot;
  if (client.game.ai) {
    bot = new MCTSBot({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    });
    bot.setOpt('async', true);
  }

  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    bot = new botConstructor({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    });
    bot.setOpt('async', true);
    botAction = null;
    metadata = null;
    secondaryPane.set(null);
    iterationCounter = 0;
  }

  async function Step() {
    botAction = null;
    metadata = null;
    iterationCounter = 0;

    const t = await _Step(client, bot);

    if (t) {
      botAction = t.payload.type;
      botActionArgs = t.payload.args;
    }
  }

  function Simulate(iterations = 10000, sleepTimeout = 100) {
    botAction = null;
    metadata = null;
    iterationCounter = 0;
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await _Step(client, bot);
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  }

  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
    debug = false;
  }

  function Reset() {
    client.reset();
    botAction = null;
    metadata = null;
    iterationCounter = 0;
    Exit();
  }

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Exit();
    }
  }

  onDestroy(Exit);
</script>

<style>
  ul {
    padding-left: 0;
  }

  li {
    list-style: none;
    margin: 0;
    margin-bottom: 5px;
  }

  h3 {
    text-transform: uppercase;
  }

  label {
    color: #666;
  }

  input[type='checkbox'] {
    vertical-align: middle;
  }
</style>

<svelte:window on:keydown={OnKeyDown}/>

<section>
  {#if client.game.ai && !client.multiplayer}
    <section>
      <h3>Controls</h3>
      <ul>
        <li>
          <Hotkey value="1" onPress={Reset} label="reset" />
        </li>
        <li>
          <Hotkey value="2" onPress={Step} label="play" />
        </li>
        <li>
          <Hotkey value="3" onPress={Simulate} label="simulate" />
        </li>
      </ul>
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
        <label for="ai-option-debug">debug</label>
        <input id="ai-option-debug" type=checkbox bind:checked={debug} on:change={OnDebug}>
        <Options bot={bot}/>
      </section>
    {/if}

    {#if botAction || iterationCounter}
    <section>
      <h3>Result</h3>
      {#if progress && progress < 1.0}
        <progress value={progress}></progress>
      {/if}

      {#if botAction}
        <ul>
          <li>Action: {botAction}</li>
          <li>Args: {JSON.stringify(botActionArgs)}</li>
        </ul>
      {/if}
    </section>
    {/if}
  {:else}
    {#if client.multiplayer}
      <p>The bot debugger is only available in singleplayer mode.</p>
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
  {/if}
</section>
