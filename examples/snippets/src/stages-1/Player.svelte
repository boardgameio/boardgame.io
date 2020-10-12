<script>
  export let playerID;

  import { Client } from 'boardgame.io/client';
  import { Local } from 'boardgame.io/multiplayer';
  import Game from './game';

  const client = Client({
    game: Game,
    matchID: 'default',
    playerID,
    debug: false,
    numPlayers: 3,
    multiplayer: Local(),
  });

  client.start();

  $: discard = $client.ctx.activePlayers && $client.ctx.activePlayers[playerID] == 'discard';
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

<div class="client" class:active={$client.isActive}>
  <li>
    <strong>Player {playerID}</strong>
  </li>

  {#if $client.isActive}
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
