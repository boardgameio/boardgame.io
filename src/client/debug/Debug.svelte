<!--
  Copyright 2017 The boardgame.io Authors

  Use of this source code is governed by a MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
-->

<script>
export let client;
</script>

<style>
.panel {
  text-align: left;
  overflow-x: hidden;
  overflow-y: scroll;
  background: #fefefe;
  border-left: 1px solid #ddd;
  box-shadow: -1px 0 10px #aaa;
  position: absolute;
  width: 300px;
  right: 0;
  top: 0;
  height: 100%;
  font-family: monospace;
  font-size: 14px;
}
</style>

<div class="panel">
  <pre>
  {JSON.stringify($client, null, 2)}
  </pre>
</div>
