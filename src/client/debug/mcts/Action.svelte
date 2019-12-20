<script>
  export let action;

  let text;

  $: {
    const { type, args } = action.payload;
    const argsFormatted = (args || []).join(',');
    text = `${type}(${argsFormatted})`;
  }
</script>

<style>
  div {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 500px;
  }
</style>

<div alt={text}>{text}</div>
