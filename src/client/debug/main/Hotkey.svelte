<script>
  export let value;
  export let onPress = null;
  export let label = null;
  export let disable = false;

  import { getContext } from 'svelte';

  const { disableHotkeys } = getContext('hotkeys');

  let active = false;
  let id = `key-${value}`;

  function Deactivate() {
    active = false;
  }

  function Activate() {
    active = true;
    setTimeout(Deactivate, 200);
    if (onPress) {
      setTimeout(onPress, 1);
    }
  }

  function Keypress(e) {
    if (
      !$disableHotkeys && !disable &&
      !e.ctrlKey && !e.metaKey &&
      e.key == value
    ) {
      e.preventDefault();
      Activate();
    }
  }
</script>

<style>
  .key {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  button {
    cursor: pointer;
    min-width: 10px;
    padding-left: 5px;
    padding-right: 5px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border: 1px solid #ccc;
    box-shadow: 1px 1px 1px #888;
    background: #eee;
    color: #444;
  }

  button:hover {
    background: #ddd;
  }

  .key.active button {
    background: #ddd;
    border: 1px solid #999;
    box-shadow: none;
  }

  label {
    margin-left: 10px;
  }
</style>

<svelte:window on:keydown={Keypress} />

<div class="key" class:active>
  <button {id} on:click={Activate} disabled={disable}>{value}</button>
  {#if label}
    <label for={id}>
      {label}
      <span class="screen-reader-only">{`(shortcut: ${value})`}</span>
    </label>
  {/if}
</div>
