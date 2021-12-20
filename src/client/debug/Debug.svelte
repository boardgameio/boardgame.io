<script>
  export let clientManager;
  $: client = $clientManager.client;

  import { writable } from 'svelte/store';
  import { setContext } from 'svelte';
  import { crossfade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Chevron from 'svelte-icons/fa/FaChevronRight.svelte';
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

  // Toggle debugger visibilty
  function ToggleVisibility() {
    visible = !visible;
  }

  const debugOpt = $clientManager.client.debugOpt
  let visible = !debugOpt || !debugOpt.hidePanel;
  const showToggleButton = !debugOpt || !debugOpt.hideButton

  function Keypress(e) {
    if (e.key == '.') {
      ToggleVisibility();
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

  const transitionOpts = {
    duration: 150,
    easing: cubicOut,
  };
  const [send, receive] = crossfade(transitionOpts);
</script>

<style>
  .debug-panel {
    position: fixed;
    color: #555;
    font-family: monospace;
    right: 0;
    top: 0;
    height: 100%;
    font-size: 14px;
    opacity: 0.9;
    /* we want the debug panel to be above any other elements */
    z-index: 99999;
  }

  .panel {
    display: flex;
    position: relative;
    flex-direction: row;
    height: 100%;
  }

  .visibility-toggle {
    position: absolute;
    box-sizing: border-box;
    top: 7px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 48px;
    height: 48px;
    padding: 8px;
    background: white;
    color: #555;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  }

  .visibility-toggle:hover,
  .visibility-toggle:focus {
    background: #eee;
  }

  .opener {
    right: 10px;
  }

  .closer {
    left: -326px;
  }

  /* Rotate chevron icon on toggle. */
  @keyframes rotateFromZero {
    from {
      transform: rotateZ(0deg);
    }
    to {
      transform: rotateZ(180deg);
    }
  }

  .icon {
    display: flex;
    height: 100%;
    animation: rotateFromZero 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0s 1
      normal forwards;
  }

  .closer .icon {
    animation-direction: reverse;
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

<section aria-label="boardgame.io Debug Panel" class="debug-panel">
  {#if !visible}
    {#if showToggleButton}
    <button
      on:click={ToggleVisibility}
      class="visibility-toggle opener"
      title="Show Debug Panel"
      in:receive={{ key: 'toggle' }}
      out:send={{ key: 'toggle' }}
    >
      <span class="icon" aria-hidden="true">
        <Chevron />
      </span>
    </button>
    {/if}
  {:else}
    <div transition:fly={{ x: 400, ...transitionOpts }} class="panel">
      {#if showToggleButton}
      <button
        on:click={ToggleVisibility}
        class="visibility-toggle closer"
        title="Hide Debug Panel"
        in:receive={{ key: 'toggle' }}
        out:send={{ key: 'toggle' }}
      >
        <span class="icon" aria-hidden="true">
          <Chevron />
        </span>
      </button>
      {/if}
      <Menu on:change={MenuChange} {panes} {pane} />
      <div
        bind:this={paneDiv}
        class="pane"
        role="region"
        aria-label={pane}
        tabindex="-1"
      >
        <svelte:component
          this={panes[pane].component}
          {client}
          {clientManager}
          {ToggleVisibility}
        />
      </div>
      {#if $secondaryPane}
        <div class="secondary-pane">
          <svelte:component
            this={$secondaryPane.component}
            metadata={$secondaryPane.metadata}
          />
        </div>
      {/if}
    </div>
  {/if}
</section>
