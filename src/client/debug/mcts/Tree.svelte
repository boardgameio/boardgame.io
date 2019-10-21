<script>
  export let root;
  let preview = null;

  import Node from './Node.svelte';
  import NodeDetails from './NodeDetails.svelte';

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

    children = root.children.map((child) => {
      const { type, args } = child.parentAction.payload;
      const argsFormatted = (args || []).join(',');
      const arrowText = `${type}(${argsFormatted})`;
      return { arrowText, child };
    });
  }
</script>

<style>
.mcts {
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.mcts .description {
  text-align: right;
}

.mcts-tree {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.mcts-tree .preview {
  display: flex;
  justify-content: center;
  text-align: center;
  height: 300px;
  width: 300px;
  padding: 10px;
}

.mcts-node-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  list-style: none;
  text-align: left;
  font-size: 12px;
  border-radius: 10px;
  padding: 20px;
}

.mcts-tree .parents {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.mcts-tree .children {
  display: grid;
  font-weight: bold;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 10px;
}

.mcts-action-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.mcts-action {
  color: #888;
  font-size: 11px;
  font-weight: normal;
  background: #ddd;
  height: 25px;
  line-height: 25px;
  padding-left: 10px;
  padding-right: 10px;
}

.arrow-right {
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid #ddd;
  margin-right: 30px;
}
</style>

<div class="mcts">
  <div class="description">
    <h4>MCTS Visualizer</h4>

    <p>
      The following diagram explains why the bot made this particular
      move.
    </p>
    <p>
      Interactively browse through the MCTS tree by clicking on various
      nodes.
    </p>
    <p>
      The numbers inside the nodes are the number of visits made by the
      algorithm.
    </p>
    <p>
      Unexpanded nodes are marked black. Read more about MCTS{' '}
      <a href="https://jeffbradberry.com/posts/2015/09/intro-to-monte-carlo-tree-search/">
        here
      </a>
      .
    </p>
  </div>

  <div class="mcts-tree">
    <section class="parents">
      {#each parents as { parent, arrowText }}
        <div class="mcts-action-wrapper">
          <Node
            on:click={() => { root = parent }}
            on:mouseout={() => { preview = null }}
            on:mouseover={() => { preview = parent }}
            {...parent}
          />

          <div class="mcts-action">{arrowText}</div>
          <div class="arrow-right" />
        </div>
      {/each}
    </section>

    <section class="root">
      <Node
        {...root}
        root={true}
        on:mouseout={() => { preview = null }}
        on:mouseover={() => { preview = root }}
      />
    </section>

    <section class="children">
      {#each children as { child, arrowText }}
        <div class="mcts-action-wrapper">
          <div class="mcts-action">{arrowText}</div>
          <div class="arrow-right" />

          <Node
            on:click={() => { root = child }}
            on:mouseout={() => { preview = null }}
            on:mouseover={() => { preview = child }}
            {...child}
            parentVisits={root.visits}
          />
        </div>
      {/each}
    </section>

    <section class="preview">
      {#if preview}
        <NodeDetails {...preview} />
      {/if}
    </section>
  </div>
</div>
