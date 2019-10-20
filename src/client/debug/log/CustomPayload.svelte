<script>
  export let payload;
  const custompayload =
    payload !== undefined ? JSON.stringify(payload, null, 4) : '';
</script>

<div>{custompayload}</div>

