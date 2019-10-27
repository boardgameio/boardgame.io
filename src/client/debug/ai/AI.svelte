<script>
  export let client;

  import Hotkey from '../main/Hotkey.svelte';
  import { MCTSBot } from '../../../ai/mcts-bot';
  import { Step as _Step } from '../../../ai/ai';

  const bot = new MCTSBot({
    game: client.game,
    enumerate: client.ai.enumerate,
  });

  async function Step() {
    await _Step(client, bot);
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

<section>
  {#if client.ai && !client.multiplayer}
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
