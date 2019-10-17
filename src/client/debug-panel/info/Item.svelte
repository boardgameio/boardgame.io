<script>
  export let name;
  export let value;
</script>

<style>
.item {
  padding: 10px;
}

.item:not(:first-child) {
  border-top: 1px dashed #aaa;
}

.item div {
  float: right;
  text-align: right;
}
</style>

<div class="item">
  <strong>{name} </strong>
  <div>{JSON.stringify(value)}</div>
</div>
