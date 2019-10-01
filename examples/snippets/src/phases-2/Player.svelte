<script>
  export let playerID;

  import { Client } from 'boardgame.io/client';
  import Game from './game';

  let hand = {};
  let deck = 0;
  let c = 'client';
  let phase = '';

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
    c = isActive ? 'client active' : 'client';
  }

  client.connect();
  client.subscribe(update);

  update();
</script>

<style>
  .phase {
    font-size: 1.2em;
    margin-top: 20px;
    color: #aaa;
  }
</style>

{#if !playerID}
  <div class="deck">
    <div>{deck}</div>
    <div>cards</div>
    <div class="phase">{phase}</div>
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
