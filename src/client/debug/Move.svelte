<script>
  export let shortcut;
  export let name;
  export let fn;

  import Hotkey from './Hotkey.svelte';
  import InteractiveFunction from './InteractiveFunction.svelte';
  import * as logger from '../../core/logger';

  let error = '';
  let focus = false;
  let enterArg = false;
  let active = false;

  function Activate() {
    active = true;
  }

  function Deactivate() {
    error = '';
    active = false;
  }

  function Submit(e) {
    error = '';
    Deactivate();
    fn.apply(this, e.detail);
  }

  function Error(e) {
    error = e.detail;
    logger.error(e.detail);
  }
</script>

<style>
  .move-error {
    color: #a00;
    font-weight: bold;
  }

  .wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>

<div>
  <div class="wrapper">
    <Hotkey value={shortcut} onPress={Activate} />
    <InteractiveFunction
      {Activate}
      {Deactivate}
      {name}
      {active}
      on:submit={Submit}
      on:error={Error} />
  </div>
  {#if error}
    <span class="move-error">{error}</span>
  {/if}
</div>
