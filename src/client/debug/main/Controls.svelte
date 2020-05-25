<script>
  export let client;

  import Hotkey from './Hotkey.svelte';
  import { sync } from '../../../core/action-creators';
  import { parse, stringify } from 'flatted';

  function Save() {
    window.localStorage.setItem('gamestate', stringify(client.getState()));
  }

  function Restore() {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      client.store.dispatch(sync({ state: gamestate }));
    }
  }
</script>

<style>
  li {
    list-style: none;
    margin: none;
    margin-bottom: 5px;
  }
</style>

<section id="debug-controls" class="controls">
  <li>
    <Hotkey value="1" onPress={client.reset} label="reset" />
  </li>
  <li>
    <Hotkey value="2" onPress={Save} label="save" />
  </li>
  <li>
    <Hotkey value="3" onPress={Restore} label="restore" />
  </li>
  <li>
    <Hotkey value="." disable={true} label="hide" />
  </li>
</section>
