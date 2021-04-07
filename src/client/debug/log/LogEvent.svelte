<script>
  export let logIndex;
  export let action;
  export let pinned;
  export let metadata;
  export let metadataComponent;

  import LogMetadata from './LogMetadata.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const args = action.payload.args;
  const renderedArgs = Array.isArray(args)
    ? args.map(arg => JSON.stringify(arg, null, 2)).join(',')
    : JSON.stringify(args, null, 2) || '';
  const playerID = action.payload.playerID;
  let actionType;
  switch (action.type) {
    case 'UNDO':
      actionType = 'undo';
      break;
    case 'REDO':
      actionType = 'redo';
    case 'GAME_EVENT':
    case 'MAKE_MOVE':
    default:
      actionType = action.payload.type;
      break;
  }
</script>

<style>
  .log-event {
    grid-column: 2;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #fff;
    border: 1px dotted #ccc;
    border-left: 5px solid #ccc;
    padding: 5px;
    text-align: center;
    color: #666;
    font-size: 14px;
    min-height: 25px;
    line-height: 25px;
  }

  .log-event:hover,
  .log-event:focus {
    border-style: solid;
    background: #eee;
  }

  .log-event.pinned {
    border-style: solid;
    background: #eee;
    opacity: 1;
  }

  .args {
    text-align: left;
    white-space: pre-wrap;
  }

  .player0 {
    border-left-color: #ff851b;
  }

  .player1 {
    border-left-color: #7fdbff;
  }

  .player2 {
    border-left-color: #0074d9;
  }

  .player3 {
    border-left-color: #39cccc;
  }

  .player4 {
    border-left-color: #3d9970;
  }

  .player5 {
    border-left-color: #2ecc40;
  }

  .player6 {
    border-left-color: #01ff70;
  }

  .player7 {
    border-left-color: #ffdc00;
  }

  .player8 {
    border-left-color: #001f3f;
  }

  .player9 {
    border-left-color: #ff4136;
  }

  .player10 {
    border-left-color: #85144b;
  }

  .player11 {
    border-left-color: #f012be;
  }

  .player12 {
    border-left-color: #b10dc9;
  }

  .player13 {
    border-left-color: #111111;
  }

  .player14 {
    border-left-color: #aaaaaa;
  }

  .player15 {
    border-left-color: #dddddd;
  }
</style>

<button
  class="log-event player{playerID}"
  class:pinned
  on:click={() => dispatch('click', { logIndex })}
  on:mouseenter={() => dispatch('mouseenter', { logIndex })}
  on:focus={() => dispatch('mouseenter', { logIndex })}
  on:mouseleave={() => dispatch('mouseleave')}
  on:blur={() => dispatch('mouseleave')}
>
  <div class="args">{actionType}({renderedArgs})</div>
  {#if metadataComponent}
    <svelte:component this={metadataComponent} {metadata} />
  {:else}
    <LogMetadata {metadata} />
  {/if}
</button>
