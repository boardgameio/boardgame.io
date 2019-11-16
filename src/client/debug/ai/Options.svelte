<script>
  export let bot;

  let values = {};
  for ([key, value] of Object.entries(bot.opts())) {
    values[key] = value.value;
  }

  function OnChange() {
    for ([key, value] of Object.entries(values)) {
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
</style>

{#each Object.entries(bot.opts()) as [key, value]}
  <div class="option">
  <label>{key}</label>
  <span class="value">{values[key]}</span>
  {#if value.range}
    <input type=range bind:value={values[key]} min={value.range.min} max={value.range.max} on:change={OnChange}>
  {/if}
  </div>
{/each}
