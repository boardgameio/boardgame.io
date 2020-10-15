<script>
  export let clientManager;
  $: client = $clientManager.client;

  import { writable } from 'svelte/store';
  import { setContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Menu from './Menu.svelte';
  import Main from './main/Main.svelte';
  import Info from './info/Info.svelte';
  import Log from './log/Log.svelte';
  import AI from './ai/AI.svelte';

  const panes = {
    main: { label: 'Main', shortcut: 'm', component: Main },
    log: { label: 'Log', shortcut: 'l', component: Log },
    info: { label: 'Info', shortcut: 'i', component: Info },
    ai: { label: 'AI', shortcut: 'a', component: AI },
  };

  const disableHotkeys = writable(false);
  const secondaryPane = writable(null);

  setContext('hotkeys', { disableHotkeys });
  setContext('secondaryPane', { secondaryPane });

  let paneDiv;
  let pane = 'main';
  function MenuChange(e) {
    pane = e.detail;
    paneDiv.focus();
  }

  let visible = true;
  function Keypress(e) {
    // Toggle debugger visibilty
    if (e.key == '.') {
      visible = !visible;
      return;
    }
    // Set displayed pane
    if (!visible) return;
    Object.entries(panes).forEach(([key, { shortcut }]) => {
      if (e.key == shortcut) {
        pane = key;
      }
    });
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
    /* we want the debug panel to be above any other elements */
    z-index: 99999;
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
    overflow-y: scroll;
  }

  .debug-panel :global(button),
  .debug-panel :global(select) {
    cursor: pointer;
    font-size: 14px;
    font-family: monospace;
  }

  .debug-panel :global(select) {
    background: #eee;
    border: 1px solid #bbb;
    color: #555;
    padding: 3px;
    border-radius: 3px;
  }

  .debug-panel :global(section) {
    margin-bottom: 20px;
  }

  .debug-panel :global(.screen-reader-only) {
    clip: rect(0 0 0 0); 
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap; 
    width: 1px;
  }
</style>

<svelte:window on:keypress={Keypress} />

{#if visible}
  <section aria-label="boardgame.io Debug Panel" class="debug-panel" transition:fly={{ x: 400 }}>
    <Menu on:change={MenuChange} {panes} {pane} />
    <div
      bind:this={paneDiv}
      class="pane"
      role="region"
      aria-label={pane}
      tabindex="-1"
    >
      <svelte:component this={panes[pane].component} {client} {clientManager} />
    </div>
    {#if $secondaryPane}
      <div class="secondary-pane">
        <svelte:component
          this={$secondaryPane.component}
          metadata={$secondaryPane.metadata} />
      </div>
    {/if}
  </section>
{/if}
