<script>
  export let phase;
  export let numEvents;

  const style = `grid-row: span ${numEvents}`;
</script>

<style>
.phase-marker {
  grid-column: 3;
  background: #555;
  border: 1px solid #888;
  color: #eee;
  text-align: center;
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  text-orientation: sideways;
  writing-mode: vertical-rl;
  line-height: 30px;
  width: 100%;
}
</style>

<div class="phase-marker" style={style}>
  {phase || ''}
</div>
