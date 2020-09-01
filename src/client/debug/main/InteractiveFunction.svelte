<script>
  export let Activate;
  export let Deactivate;
  export let name;
  export let active;
  let value;
  let span;

  import { afterUpdate, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function Submit() {
    try {
      const value = span.innerText;
      let argArray = new Function(`return [${value}]`)();
      dispatch('submit', argArray);
    } catch (error) {
      dispatch('error', error);
    }
    span.innerText = '';
  }

  function OnKeyDown(e) {
    if (e.key == 'Enter') {
      e.preventDefault();
      Submit();
    }

    if (e.key == 'Escape') {
      e.preventDefault();
      Deactivate();
    }
  }

  afterUpdate(() => {
    if (active) {
      span.focus();
    } else {
      span.blur();
    }
  });
</script>

<style>
  .move {
    display: flex;
    flex-direction: row;
    cursor: pointer;
    margin-left: 10px;
    color: #666;
  }

  .move:hover {
    color: #333;
  }

  .move.active {
    color: #111;
    font-weight: bold;
  }

  .move-error {
    color: #a00;
    font-weight: bold;
  }

  .arg-field {
    outline: none;
    font-family: monospace;
  }
</style>

<div class="move" class:active on:click={Activate}>
  <span>{name}</span>
  <span>(</span>
  <span
    class="arg-field"
    bind:this={span}
    on:focus={Activate}
    on:blur={Deactivate}
    on:keypress|stopPropagation={() => {}}
    on:keydown={OnKeyDown}
    contentEditable />
  <span>)</span>
</div>
