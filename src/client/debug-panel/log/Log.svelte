<script>
  export let client;
  export let onHover = () => {};
  export let payloadComponent;

  import { MAKE_MOVE } from '../../../core/action-types';
  import TurnMarker from './TurnMarker.svelte';
  import PhaseMarker from './PhaseMarker.svelte';
  import LogEvent from './LogEvent.svelte';

  let { log, _initial: initialState} = $client;
  let pinned = null;

  function rewind(logIndex) {
    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];

      if (!automatic) {
        state = client.reducer(state, action);
      }

      if (action.type == MAKE_MOVE) {
        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx };
  }

  function onLogClick(logIndex) {
    const state = rewind(logIndex);
    const renderedLogEntries = log.filter(
      e => e.action.type == MAKE_MOVE
    );
    const metadata = renderedLogEntries[logIndex].action.payload.metadata;

    if (pinned === logIndex) {
      onHover({ logIndex, state, metadata: undefined });
      pinned = null;
      return;
    }

    onHover({ logIndex, state, metadata });
    pinned = logIndex;
  }

  function onMouseEnter(logIndex) {
    if (pinned === null) {
      const state = rewind(logIndex);
      onHover({ logIndex, state });
    }
  }

  function onMouseLeave() {
    if (pinned === null) {
      onHover({ state: null });
    }
  }

  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};

  $: {
    log = $client.log;
    renderedLogEntries = log.filter(
      e => e.action.type == MAKE_MOVE
    );

    let eventsInCurrentPhase = 0;
    let eventsInCurrentTurn = 0;

    turnBoundaries = {};
    phaseBoundaries = {};

    for (let i = 0; i < renderedLogEntries.length; i++) {
      const { action, payload, turn, phase } = renderedLogEntries[i];

      eventsInCurrentTurn++;
      eventsInCurrentPhase++;

      if (i == renderedLogEntries.length - 1 ||
          renderedLogEntries[i+1].turn != turn) {
        turnBoundaries[i] = eventsInCurrentTurn;
        eventsInCurrentTurn = 0;
      }

      if (i == renderedLogEntries.length - 1 ||
          renderedLogEntries[i+1].phase != phase) {
        phaseBoundaries[i] = eventsInCurrentPhase;
        eventsInCurrentPhase = 0;
      }
    }

    console.log(phaseBoundaries);
  }
</script>

<style>
.gamelog {
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  grid-auto-rows: auto;
  grid-auto-flow: column;
}

.gamelog.pinned .log-event {
  opacity: 0.2;
}
</style>

<div class="gamelog" class:pinned>
  {#each renderedLogEntries as {turn}, i}
    {#if i in turnBoundaries}
      <TurnMarker turn={turn} numEvents={turnBoundaries[i]} />
    {/if}
  {/each}

  {#each renderedLogEntries as {action, payload}, i}
    <LogEvent
      pinned={i === pinned}
      logIndex={i}
      onLogClick={onLogClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      action={action}
      payload={payload}
      payloadComponent={payloadComponent}
    />
  {/each}

  {#each renderedLogEntries as {phase}, i}
    {#if i in phaseBoundaries}
      <PhaseMarker phase={phase} numEvents={phaseBoundaries[i]} />
    {/if}
  {/each}
</div>
