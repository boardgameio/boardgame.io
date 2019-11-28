<script>
  export let bot;

  let values = {};
  for (let [key, value] of Object.entries(bot.opts())) {
    values[key] = value.value;
  }

  function OnChange() {
    for (let [key, value] of Object.entries(values)) {
      bot.setOpt(key, value);
    }
  }
</script>

<style>
  label {
    font-weight: bold;
    color: #999;
  }

  .option {
    margin-bottom: 20px;
  }

  .value {
    font-weight: bold;
  }

  input[type='checkbox'] {
    vertical-align: middle;
  }
</style>

{#each Object.entries(bot.opts()) as [key, value]}
  <div class="option">
    <label>{key}</label>

    {#if value.range}
      <span class="value">{values[key]}</span>
      <input type=range bind:value={values[key]} min={value.range.min} max={value.range.max} on:change={OnChange}>
    {/if}

    {#if typeof value.value === 'boolean'}
      <input type=checkbox bind:checked={values[key]} on:change={OnChange}>
    {/if}
  </div>
{/each}
