<script>
  export let client;
  export let clientManager;
  export let ToggleVisibility;

  import Item from './Item.svelte';
</script>

<style>
.gameinfo {
  padding: 10px;
}
</style>

<section class="gameinfo">
  <Item name="matchID" value={client.matchID} />
  <Item name="playerID" value={client.playerID} />
  <Item name="isActive" value={$client.isActive} />
  {#if client.multiplayer}
    <Item name="isConnected" value={$client.isConnected} />
  {/if}
</section>
