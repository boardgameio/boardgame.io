<script>
  export let onPress;
  export let value;
  export let child;

  let active = false;

  function deactivate() {
    active = false;
  }

  function activate() {
    active = true;
    if (onPress) {
      onPress();
      active = false;
    }
  }

  function onKeydown(e) {
    if (e.key == value) {
      e.preventDefault();
      activate();
    }
  }
</script>

<style>
  .key {
    margin-bottom: 5px;
  }

  .key-box {
    display: inline-block;
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

  .key-box:hover {
    background: #ddd;
  }

  .key.active .key-box {
    background: #ddd;
    border: 1px solid #999;
    box-shadow: none;
  }

  .key-child {
    display: inline-block;
    height: 20px;
    margin-left: 10px;
  }
</style>

<svelte:window on:keydown={onKeydown} />

<div class="key" class:active>
  <div class="key-box" on:click={activate}>{value}</div>
  <div class="key-child">
    <svelte:component this={child} {active} {activate} {deactivate} />
  </div>
</div>
