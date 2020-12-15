<script>
  export let metadata;
  const renderedMetadata =
    metadata !== undefined ? JSON.stringify(metadata, null, 4) : '';
</script>

<div>{renderedMetadata}</div>
