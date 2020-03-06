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
    <div
      class="player"
      class:current={player == ctx.currentPlayer}
      class:active={player == playerID}
      on:click={() => OnClick(player)}>
      {player}
    </div>
  {/each}
</div>
