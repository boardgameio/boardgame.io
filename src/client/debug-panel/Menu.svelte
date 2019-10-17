<script>
  export let pane;
  export let panes;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<style>
  .menu-item {
    cursor: pointer;
    margin-bottom: 5px;
    border: 1px solid #ccc;
    background: #eee;
    padding: 3px;
    padding-top: 15px;
    padding-bottom: 15px;
    writing-mode: vertical-lr;
    text-orientation: sideways;
    transform: rotate(180deg);
  }

  .menu-item.active {
    cursor: default;
    border-left: 1px solid #fefefe;
    background: #fefefe;
  }

  .menu-item:hover {
    background: #fff;
  }
</style>

<div>
  {#each Object.entries(panes) as [key, {label}]}
    <div
      class="menu-item"
      class:active={pane == key}
      on:click={() => dispatch('change', key)}>
      {label}
    </div>
  {/each}
</div>
