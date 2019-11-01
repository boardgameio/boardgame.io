<script>
  export let pane;
  export let panes;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<style>
  .menu {
    display: flex;
    margin-top: -10px;
    flex-direction: row;
    border: 1px solid #ccc;
    border-radius: 5px 5px 0 0;
    height: 25px;
    line-height: 25px;
    transform-origin: bottom right;
    transform: rotate(-90deg);
    font-weight: bold;
  }

  .menu-item {
    line-height: 25px;
    cursor: pointer;
    background: #999;
    color: #eee;
    padding-left: 15px;
    padding-right: 15px;
    text-align: center;
  }

  .menu-item:last-child {
    border-radius: 0 5px 0 0;
  }

  .menu-item:first-child {
    border-radius: 5px 0 0 0;
  }

  .menu-item.active {
    cursor: default;
    background: #eee;
    color: #555;
  }

  .menu-item:hover {
    background: #eee;
    color: #777;
  }
</style>

<div class="menu">
  {#each Object.entries(panes).reverse() as [key, {label}]}
    <div
      class="menu-item"
      class:active={pane == key}
      on:click={() => dispatch('change', key)}>
      {label}
    </div>
  {/each}
</div>
