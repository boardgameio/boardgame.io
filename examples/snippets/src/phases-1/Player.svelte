<script>
  export let playerID;

  import { Client } from 'boardgame.io/client';
  import Game from './game';

  let hand = {};
  let deck = 0;
  let c = 'client';

  const client = Client({
    ...Game,
    gameID: 'default',
    playerID,
  });

  function update() {
    const { G, ctx, isActive } = client.getState();
    hand = G.hand;
    deck = G.deck;
    c = isActive ? 'client active' : 'client';
  }

  client.connect();
  client.subscribe(update);
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
    <div>{deck}</div>
    <div>cards</div>
  </div>
{:else}
  <div class={c}>
    <li>
      <strong>Player {playerID}</strong>
    </li>
    <li>{hand[playerID]} cards</li>
    <li>
      <button on:click={client.moves.DrawCard}>Draw Card</button>
    </li>
    <li>
      <button on:click={client.moves.PlayCard}>Play Card</button>
    </li>
  </div>
{/if}
