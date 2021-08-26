<script>
  export let pane;
  export let panes;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<style>
  .menu {
    display: flex;
    margin-top: 43px;
    flex-direction: row-reverse;
    border: 1px solid #ccc;
    border-radius: 5px 5px 0 0;
    height: 25px;
    line-height: 25px;
    margin-right: -500px;
    transform-origin: bottom right;
    transform: rotate(-90deg) translate(0, -500px);
  }

  .menu-item {
    line-height: 25px;
    cursor: pointer;
    border: 0;
    background: #fefefe;
    color: #555;
    padding-left: 15px;
    padding-right: 15px;
    text-align: center;
  }

  .menu-item:first-child {
    border-radius: 0 5px 0 0;
  }

  .menu-item:last-child {
    border-radius: 5px 0 0 0;
  }

  .menu-item.active {
    cursor: default;
    font-weight: bold;
    background: #ddd;
    color: #555;
  }

  .menu-item:hover,
  .menu-item:focus {
    background: #eee;
    color: #555;
  }
</style>

<nav class="menu">
  {#each Object.entries(panes) as [key, {label}]}
    <button
      class="menu-item"
      class:active={pane == key}
      on:click={() => dispatch('change', key)}>
      {label}
    </button>
  {/each}
</nav>
