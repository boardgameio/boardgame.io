<script>
  export let turn;
  export let numEvents;
  const style = `grid-row: span ${numEvents}`;
</script>

<style>
.turn-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column: 1;
  background: #555;
  color: #eee;
  text-align: center;
  font-weight: bold;
  border: 1px solid #888;
}
</style>

<div class="turn-marker" style={style}>
  {turn}
</div>
