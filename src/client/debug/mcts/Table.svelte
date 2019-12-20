<script>
  export let root;
  export let selectedIndex = null;

  import Action from './Action.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let parents = [];
  let children = [];

  $: {
    let t = root;
    parents = [];
    while (t.parent) {
      const parent = t.parent;
      const { type, args } = t.parentAction.payload;
      const argsFormatted = (args || []).join(',');
      const arrowText = `${type}(${argsFormatted})`;
      parents.push({ parent, arrowText });
      t = parent;
    }
    parents.reverse();

    children = [...root.children]
                   .sort((a, b) => (a.visits < b.visits ? 1 : -1))
                   .slice(0, 50);
  }

  function Select(node, i) {
    dispatch('select', { node, selectedIndex: i });
  }

  function Preview(node, i) {
    if (selectedIndex === null) {
      dispatch('preview', { node });
    }
  }
</script>

<style>
  table {
    font-size: 12px;
    border-collapse: collapse;
    border: 1px solid #ddd;
    padding: 0;
  }

  tr {
    cursor: pointer;
  }

  tr:hover td {
    background: #eee;
  }

  tr.selected td {
    background: #eee;
  }

  td {
    padding: 10px;
    height: 10px;
    line-height: 10px;
    font-size: 12px;
    border: none;
  }

  th {
    background: #888;
    color: #fff;
    padding: 10px;
    text-align: center;
  }
</style>

<table>
  <thead>
    <th>Value</th>
    <th>Visits</th>
    <th>Action</th>
  </thead>

  <tbody>
  {#each children as child, i}
    <tr class:clickable={children.length > 0}
        class:selected={i === selectedIndex}
        on:click={() => Select(child, i)}
        on:mouseout={() => Preview(null, i)}
        on:mouseover={() => Preview(child, i)}>
      <td>{child.value}</td>
      <td>{child.visits}</td>
      <td><Action action={child.parentAction}/></td>
    </tr>
  {/each}
  </tbody>
</table>
