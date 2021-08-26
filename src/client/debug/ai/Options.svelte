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

  const makeID = (key) => 'ai-option-' + key;
</script>

<style>
  label {
    color: #666;
  }

  .option {
    margin-bottom: 20px;
  }

  .value {
    font-weight: bold;
    color: #000;
  }

  input[type='checkbox'] {
    vertical-align: middle;
  }
</style>

{#each Object.entries(bot.opts()) as [key, value]}
  <div class="option">
    <label for={makeID(key)}>{key}</label>

    {#if value.range}
      <span class="value">{values[key]}</span>
      <input id={makeID(key)} type=range bind:value={values[key]} min={value.range.min} max={value.range.max} on:change={OnChange}>
    {:else if typeof value.value === 'boolean'}
      <input id={makeID(key)} type=checkbox bind:checked={values[key]} on:change={OnChange}>
    {/if}
  </div>
{/each}
