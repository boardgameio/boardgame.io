<script>
export let clientManager;

$: ({ client, debuggableClients } = $clientManager);
$: selected = debuggableClients.indexOf(client);

const selectId = 'bgio-debug-select-client';
const handleSelection = (e) => {
  // Request to switch to the selected client.
  const selectedClient = debuggableClients[e.target.value];
  clientManager.switchToClient(selectedClient);
  // Maintain focus on the client select menu after switching clients.
  // Necessary because switching clients will usually trigger a mount/unmount.
  const select = document.getElementById(selectId);
  if (select) select.focus();
};
</script>

<style>
  * { box-sizing: border-box; }

  section.switcher {
    position: sticky;
    bottom: 0;
    transform: translateY(20px);
    margin: 40px -20px 0;
    border-top: 1px solid #999;
    padding: 20px;
    background: #fff;
  }

  label {
    display: flex;
    align-items: baseline;
    gap: 5px;
    font-weight: bold;
  }

  select { min-width: 140px; }
</style>

{#if debuggableClients.length > 1}
  <section class="switcher">
    <label>
      Client
      <!-- svelte-ignore a11y-no-onchange -->
      <select id={selectId} on:change={handleSelection} bind:value={selected}>
        {#each debuggableClients as clientOption, index}
          <option value={index}>
            {index} —
            playerID: {JSON.stringify(clientOption.playerID)},
            matchID: {JSON.stringify(clientOption.matchID)}
            ({clientOption.game.name})
          </option>
        {/each}
      </select>
    </label>
  </section>
{/if}
