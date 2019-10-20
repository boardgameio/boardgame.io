<script>
  export let logIndex;
  export let onLogClick;
  export let onMouseEnter;
  export let onMouseLeave;
  export let action;
  export let pinned;
  export let payload;
  export let payloadComponent;

  import CustomPayload from './CustomPayload.svelte';

  const args = action.payload.args || [];
  const playerID = action.payload.playerID;
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
  color: #888;
  font-size: 14px;
  min-height: 25px;
  line-height: 25px;
}

.log-event:hover {
  border-style: solid;
  background: #eee;
}

.log-event.pinned {
  border-style: solid;
  background: #eee;
  opacity: 1;
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

<div
  class="log-event player{playerID}"
  class:pinned
  on:click={() => onLogClick(logIndex)}
  on:mouseenter={() => onMouseEnter(logIndex)}
  on:mouseleave={() => onMouseLeave()}
>
  <div>
    {action.payload.type}({args.join(',')})
  </div>

  {#if payloadComponent}
    <svelte:component this={payloadComponent} {payload} />
  {:else}
    <CustomPayload {payload} />
  {/if}
</div>
