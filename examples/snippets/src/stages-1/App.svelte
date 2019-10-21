<script>
  import Player from './Player.svelte';
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }
</style>

<div>
  <div class="container">
    <Player playerID="0" />
    <Player playerID="1" />
    <Player playerID="2" />
  </div>
</div>
