<script>
  export let ctx;
  export let playerID;
  export let onClick = () => {};

  const players = ctx ? [...Array(ctx.numPlayers).keys()] : [];
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
      on:click={() => onClick(playerID)}>
      {player}
    </div>
  {/each}
</div>
