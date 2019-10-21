<script>
  export let root;
  export let visits;
  export let value;
  export let parentVisits;

  let uct = value / visits + Math.sqrt((2 * Math.log(parentVisits)) / visits);
  let ratio = value / visits;
  uct = Math.floor(100 * uct);
  ratio = Math.floor(100 * ratio);

  if (!parentVisits) uct = null;
</script>

<div class="mcts-node-preview" class:root>
  <div>
    <li>value {value}</li>
    <li>visits {visits}</li>
    <li>ratio {ratio}</li>
    {#if uct}<li>uct {uct}</li>{/if}
  </div>
</div>
