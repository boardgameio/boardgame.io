import React from 'react';

export const Configurator = ({
  isHost,
  setIsHost,
  playerID,
  setPlayerID,
  matchID,
  setMatchID,
  onSubmit,
}) => (
  <>
    <h2>Configure this client</h2>
    <form
      style={{
        display: 'grid',
        gap: '2rem',
        maxWidth: '30rem',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label>
        <code>isHost</code>{' '}
        <input
          type="checkbox"
          checked={isHost}
          onChange={(e) => setIsHost(e.currentTarget.checked)}
        />
      </label>
      <label>
        <code>playerID</code>{' '}
        <select
          value={playerID}
          onChange={(e) => setPlayerID(e.currentTarget.value)}
        >
          <option value={''}>spectator</option>
          <option value="0">0</option>
          <option value="1">1</option>
        </select>
      </label>
      <label>
        <code>matchID</code>{' '}
        <input
          type="text"
          value={matchID}
          onInput={(e) => setMatchID(e.currentTarget.value)}
        />
      </label>
      <button type="submit">Connect</button>
    </form>
    <Instructions />
  </>
);

function Instructions() {
  return (
    <small style={{ display: 'block', marginTop: '4rem' }}>
      <h2>Instructions</h2>
      <h3>Window/Computer 1</h3>
      <ol>
        <li>
          Click <code>isHost</code> and select your choice of{' '}
          <code>playerID</code>.
        </li>
        <li>
          Copy the <code>matchID</code>.
        </li>
        <li>
          Click <strong>Connect</strong>.
        </li>
      </ol>
      <h3>Window/Computer 2</h3>
      <ol>
        <li>
          Select the other <code>playerID</code>.
        </li>
        <li>
          Paste/type the <code>matchID</code> from the other window.
        </li>
        <li>
          Click <strong>Connect</strong>.
        </li>
      </ol>
    </small>
  );
}
