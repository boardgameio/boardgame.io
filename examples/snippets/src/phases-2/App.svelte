<script>
  import Player from './Player.svelte';
</script>

<style>
  #board {
    width: 100%;
  }
</style>

<div>
  <div id="board">
    <Player />
  </div>
  <div class="container">
    <Player playerID="0" />
    <Player playerID="1" />
    <Player playerID="2" />
  </div>
</div>
