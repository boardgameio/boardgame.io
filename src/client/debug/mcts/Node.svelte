<script>
  export let children;
  export let visits;
</script>

<style>
.mcts-node {
  overflow: hidden;
  font-size: 14px;
  border-radius: 100%;
  margin-right: 30px;
  border: 1px solid #ccc;
  width: 30px;
  height: 30px;
  line-height: 30px;
  padding: 10px;
  color: #bbb;
  background: #444;
  text-align: center;
}

.mcts-node.clickable {
  cursor: pointer;
  color: #777;
  background: #eee;
}

.mcts-node.clickable:hover {
  background: #ddd;
}
</style>

<div
  class="mcts-node"
  class:clickable={children.length > 0}
  on:click
  on:mouseout
  on:mouseover
>
  {visits}
</div>
