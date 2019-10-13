<script>
  export let playerID;

  import { Client } from 'boardgame.io/client';
  import Game from './game';

  let hand = {};
  let deck = 0;
  let c = 'client';
  let phase = '';
  let active = false;
  let discard = false;

  const client = Client({
    ...Game,
    gameID: 'default',
    playerID,
  });

  function update() {
    const { G, ctx, isActive } = client.getState();
    hand = G.hand;
    deck = G.deck;
    phase = ctx.phase;
    active = isActive;
    discard = ctx.activePlayers && ctx.activePlayers[playerID] == 'discard';
    c = isActive ? 'client active' : 'client';
  }

  client.connect();
  client.subscribe(update);
</script>

<style>
  .client {
    border-radius: 5px;
    width: 100px;
    border: 1px solid #ddd;
    background: #fafafa;
    opacity: .8;
  }

  .client.active {
    box-shadow: 0 0 5px #aaa;
    background: #fff;
    opacity: 1;
  }

  .client li {
    list-style: none;
    padding: 5px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-family: monospace;
  }
</style>

<div class={c}>
  <li>
    <strong>Player {playerID}</strong>
  </li>

  {#if active}
    <li>
    {#if discard}
      <button on:click={() => client.moves.discard()}>Discard</button>
    {:else}
      <button on:click={() => client.moves.militia()}>Play Card</button>
    {/if}
    </li>
  <li>
    <button on:click={() => client.events.endTurn()}>End Turn</button>
  </li>
  {/if}
</div>
