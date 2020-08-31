<script>
  export let client;

  import Item from './Item.svelte';
</script>

<style>
.gameinfo {
  padding: 10px;
}
</style>

<section class="gameinfo">
  <Item name="gameID" value={client.gameID} />
  <Item name="playerID" value={client.playerID} />
  <Item name="isActive" value={$client.isActive} />
  {#if client.multiplayer}
    <Item name="isConnected" value={$client.isConnected} />
  {/if}
</section>
