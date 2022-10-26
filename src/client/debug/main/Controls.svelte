<script>
  export let client;
  export let ToggleVisibility;

  import Hotkey from './Hotkey.svelte';
  import { sync } from '../../../core/action-creators';
  import { parse, stringify } from 'flatted';

  function Save() {
    // get state to persist and overwrite deltalog, _undo, and _redo
    const state = client.getState();
    const json = stringify({
      ...state,
      _undo: [],
      _redo: [],
      deltalog: [],
    });
    window.localStorage.setItem('gamestate', json);
    window.localStorage.setItem('initialState', stringify(client.initialState));
  }

  function Restore() {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    const initialStateJSON = window.localStorage.getItem('initialState');
    if (gamestateJSON !== null && initialStateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      const initialState = parse(initialStateJSON);
      client.store.dispatch(sync({ state: gamestate, initialState }));
    }
  }
</script>

<style>
  ul {
    padding-left: 0;
  }

  li {
    list-style: none;
    margin: 0;
    margin-bottom: 5px;
  }
</style>

<ul id="debug-controls" class="controls">
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
    <Hotkey value="." onPress={ToggleVisibility} label="hide" />
  </li>
</ul>
