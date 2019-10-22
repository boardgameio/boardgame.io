<script>
  export let client;

  import { writable } from 'svelte/store';
  import { setContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Menu from './Menu.svelte';
  import Main from './main/Main.svelte';
  import Info from './info/Info.svelte';
  import Log from './log/Log.svelte';

  const disableHotkeys = writable(false);
  const secondaryPane = writable(null);

  setContext('hotkeys', { disableHotkeys });
  setContext('secondaryPane', { secondaryPane });

  const panes = {
    main: { label: 'Main', component: Main },
    log: { label: 'Log', component: Log },
    info: { label: 'Info', component: Info },
  };

  let pane = 'main';
  function MenuChange(e) {
    pane = e.detail;
  }

  let visible = true;
  function Keypress(e) {
    switch (e.key) {
      case '.': {
        visible = !visible;
        break;
      }
      case 'm': {
        pane = 'main';
        break;
      }
      case 'l': {
        pane = 'log';
        break;
      }
      case 'i': {
        pane = 'info';
        break;
      }
    }
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
    box-sizing: border-box;
    width: 280px;
  }

  .secondary-pane {
    background: #fefefe;
  }
</style>

<svelte:window on:keypress={Keypress} />

{#if visible}
  <div class="debug-panel" transition:fly={{ x: 400 }}>
    <Menu on:change={MenuChange} {panes} {pane} />
    <div class="pane">
      <svelte:component this={panes[pane].component} {client} />
    </div>
    {#if $secondaryPane}
      <div class="secondary-pane">
        <svelte:component this={$secondaryPane.component} metadata={$secondaryPane.metadata} />
      </div>
    {/if}
  </div>
{/if}
