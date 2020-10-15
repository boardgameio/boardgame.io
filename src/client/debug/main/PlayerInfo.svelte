<script>
  export let ctx;
  export let playerID;

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  function OnClick(player) {
    if (player == playerID) {
      dispatch("change", { playerID: null });
    } else {
      dispatch("change", { playerID: player });
    }
  }

  function playerLabel(player) {
    const properties = [];
    if (player == ctx.currentPlayer) properties.push('current');
    if (player == playerID) properties.push('active');
    let label = `Player ${player}`;
    if (properties.length) label += ` (${properties.join(', ')})`;
    return label;
  }

  let players;
  $: players = ctx ? [...Array(ctx.numPlayers).keys()].map(i => i.toString()) : [];
</script>

<style>
  .player-box {
    display: flex;
    flex-direction: row;
  }

  .player {
    cursor: pointer;
    text-align: center;
    width: 30px;
    height: 30px;
    line-height: 30px;
    background: #eee;
    border: 3px solid #fefefe;
    box-sizing: content-box;
    padding: 0;
  }

  .player.current {
    background: #555;
    color: #eee;
    font-weight: bold;
  }

  .player.active {
    border: 3px solid #ff7f50;
  }
</style>

<div class="player-box">
  {#each players as player}
    <button
      class="player"
      class:current={player == ctx.currentPlayer}
      class:active={player == playerID}
      on:click={() => OnClick(player)}
      aria-label={playerLabel(player)}
    >
      {player}
    </button>
  {/each}
</div>
