<script>
  export let playerID = null;

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
</script>

<style>
  .phase {
    font-size: 1.2em;
    margin-top: 20px;
    color: #aaa;
  }

  .deck {
    font-family: monospace;
    width: 40px;
    height: 60px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid #ddd;
    padding: 20px;
    text-align: center;
    border-radius: 5px;
    margin-bottom: 50px;
  }

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
    font-family: monospace;
    list-style: none;
    padding: 5px;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }
</style>

{#if !playerID}
  <div class="deck">
    <div>{$client.G.deck}</div>
    <div>cards</div>
  </div>
{:else}
  <div class="client" class:active={$client.isActive}>
    <li>
      <strong>Player {playerID}</strong>
    </li>
    <li>{$client.G.hand[playerID]} cards</li>
    <li>
      <button on:click={client.moves.DrawCard}>Draw Card</button>
    </li>
    <li>
      <button on:click={client.moves.PlayCard}>Play Card</button>
    </li>
  </div>
{/if}
