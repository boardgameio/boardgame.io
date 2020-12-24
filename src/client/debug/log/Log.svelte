<script>
  export let client;

  import { getContext, onDestroy } from 'svelte';

  const { secondaryPane } = getContext('secondaryPane');

  import { CreateGameReducer } from '../../../core/reducer';
  import TurnMarker from './TurnMarker.svelte';
  import PhaseMarker from './PhaseMarker.svelte';
  import LogEvent from './LogEvent.svelte';
  import MCTS from '../mcts/MCTS.svelte';

  const reducer = CreateGameReducer({ game: client.game });
  const initialState = client.getInitialState();
  let { log } = $client;
  let pinned = null;

  function rewind(logIndex) {
    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];

      if (!automatic) {
        state = reducer(state, action);

        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx, plugins: state.plugins };
  }

  function OnLogClick(e) {
    const { logIndex } = e.detail;
    const state = rewind(logIndex);
    const renderedLogEntries = log.filter(e => !e.automatic);
    client.overrideGameState(state);

    if (pinned == logIndex) {
      pinned = null;
      secondaryPane.set(null);
    } else {
      pinned = logIndex;
      const { metadata } = renderedLogEntries[logIndex].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }

  function OnMouseEnter(e) {
    const { logIndex } = e.detail;
    if (pinned === null) {
      const state = rewind(logIndex);
      client.overrideGameState(state);
    }
  }

  function OnMouseLeave() {
    if (pinned === null) {
      client.overrideGameState(null);
    }
  }

  function Reset() {
    pinned = null;
    client.overrideGameState(null);
    secondaryPane.set(null);
  }

  onDestroy(Reset);

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Reset();
    }
  }

  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};

  $: {
    log = $client.log;
    renderedLogEntries = log.filter(e => !e.automatic);

    let eventsInCurrentPhase = 0;
    let eventsInCurrentTurn = 0;

    turnBoundaries = {};
    phaseBoundaries = {};

    for (let i = 0; i < renderedLogEntries.length; i++) {
      const { action, payload, turn, phase } = renderedLogEntries[i];

      eventsInCurrentTurn++;
      eventsInCurrentPhase++;

      if (
        i == renderedLogEntries.length - 1 ||
        renderedLogEntries[i + 1].turn != turn
      ) {
        turnBoundaries[i] = eventsInCurrentTurn;
        eventsInCurrentTurn = 0;
      }

      if (
        i == renderedLogEntries.length - 1 ||
        renderedLogEntries[i + 1].phase != phase
      ) {
        phaseBoundaries[i] = eventsInCurrentPhase;
        eventsInCurrentPhase = 0;
      }
    }
  }
</script>

<style>
  .gamelog {
    display: grid;
    grid-template-columns: 30px 1fr 30px;
    grid-auto-rows: auto;
    grid-auto-flow: column;
  }
</style>

<svelte:window on:keydown={OnKeyDown}/>

<div class="gamelog" class:pinned>
  {#each renderedLogEntries as { turn }, i}
    {#if i in turnBoundaries}
      <TurnMarker {turn} numEvents={turnBoundaries[i]} />
    {/if}
  {/each}

  {#each renderedLogEntries as { action, metadata }, i}
    <LogEvent
      pinned={i === pinned}
      logIndex={i}
      on:click={OnLogClick}
      on:mouseenter={OnMouseEnter}
      on:mouseleave={OnMouseLeave}
      {action}
      {metadata} />
  {/each}

  {#each renderedLogEntries as { phase }, i}
    {#if i in phaseBoundaries}
      <PhaseMarker {phase} numEvents={phaseBoundaries[i]} />
    {/if}
  {/each}
</div>
