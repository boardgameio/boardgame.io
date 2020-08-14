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
  <Item name="matchID" value={client.matchID} />
  <Item name="playerID" value={client.playerID} />
  <Item name="isActive" value={$client.isActive} />
  {#if $client.isMultiplayer}
    <span>
      <Item name="isConnected" value={$client.isConnected} />
      <Item name="isMultiplayer" value={$client.isMultiplayer} />
    </span>
  {/if}
</section>
