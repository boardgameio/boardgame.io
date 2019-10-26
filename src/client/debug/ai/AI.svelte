<script>
  export let client;

  import Hotkey from '../main/Hotkey.svelte';
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
  {#if client.step}
    <h3>Controls</h3>
    <li>
      <Hotkey value="1" onPress={client.reset} label="reset" />
    </li>
    <li>
      <Hotkey value="2" onPress={client.step} label="step" />
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
