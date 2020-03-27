import { Object } from 'ts-toolbelt';
import * as ActionCreators from './core/action-creators';
import { Flow } from './core/flow';
import * as StorageAPI from './server/db/base';

export { StorageAPI };

export interface State {
  G: object;
  ctx: Ctx;
  deltalog?: Array<LogEntry>;
  plugins: {
    [pluginName: string]: PluginState;
  };
  _undo: Array<Undo>;
  _redo: Array<Undo>;
  _stateID: number;
}

export type PartialGameState = Pick<State, 'G' | 'ctx' | 'plugins'>;

export type StageName = string;
export type PlayerID = string;

interface ActivePlayers {
  [playerID: string]: StageName;
}

export interface Ctx {
  numPlayers: number;
  playOrder: Array<PlayerID>;
  playOrderPos: number;
  activePlayers: null | ActivePlayers;
  currentPlayer: PlayerID;
  numMoves?: number;
  gameover?: any;
  turn: number;
  phase: string;
  _activePlayersMoveLimit?: object;
  _activePlayersNumMoves?: object;
  _prevActivePlayers?: Array<object>;
  _random?: {
    seed: string | number;
  };
}

export interface PluginState {
  data: object;
  api?: object;
}

export interface LogEntry {
  action: ActionShape.MakeMove | ActionShape.GameEvent;
  _stateID: number;
  turn: number;
  phase: string;
  redact?: boolean;
  automatic?: boolean;
}

export interface Plugin {
  name: string;
  setup?: Function;
  action?: Function;
  api?: Function;
  flush?: Function;
}

export interface LongFormMove {
  move: Function;
  redact?: boolean;
  client?: boolean;
  undoable?: boolean | Function;
}

export type Move = Function | LongFormMove;

export interface MoveMap {
  [moveName: string]: Move;
}

export interface PhaseConfig {
  start?: boolean;
  next?: string;
  onBegin?: Function;
  onEnd?: Function;
  endIf?: Function;
  moves?: MoveMap;
  turn?: TurnConfig;
  wrapped?: {
    endIf?: Function;
    onBegin?: Function;
    onEnd?: Function;
  };
}

export interface StageConfig {
  moves?: MoveMap;
  next?: string;
}

export interface StageMap {
  [stageName: string]: StageConfig;
}

export interface TurnConfig {
  activePlayers?: object;
  moveLimit?: number;
  onBegin?: Function;
  onEnd?: Function;
  endIf?: Function;
  onMove?: Function;
  stages?: StageMap;
  moves?: MoveMap;
  order?: object;
  wrapped?: {
    endIf?: Function;
    onBegin?: Function;
    onEnd?: Function;
    onMove?: Function;
  };
}

interface PhaseMap {
  [phaseName: string]: PhaseConfig;
}

export interface GameConfig {
  name?: string;
  seed?: string | number;
  setup?: Function;
  moves?: MoveMap;
  phases?: PhaseMap;
  turn?: TurnConfig;
  events?: {
    endGame?: boolean;
    endPhase?: boolean;
    endTurn?: boolean;
    setPhase?: boolean;
    endStage?: boolean;
    setStage?: boolean;
    pass?: boolean;
    setActivePlayers?: boolean;
  };
  endIf?: Function;
  onEnd?: Function;
  playerView?: Function;
  plugins?: Array<Plugin>;
  processMove?: Function;
  flow?: ReturnType<typeof Flow>;
}

type Undo = { G: object; ctx: Ctx; moveType?: string };

export namespace Server {
  export type PlayerMetadata = {
    id: number;
    name?: string;
    credentials?: string;
  };

  export interface GameMetadata {
    gameName: string;
    players: { [id: number]: PlayerMetadata };
    setupData: any;
    nextRoomID?: string;
  }

  export interface LobbyConfig {
    uuid?: Function;
    generateCredentials?: Function;
    apiPort?: number;
    apiCallback?: Function;
  }
}

export namespace CredentialedActionShape {
  export type MakeMove = ReturnType<typeof ActionCreators.makeMove>;
  export type GameEvent = ReturnType<typeof ActionCreators.gameEvent>;
  export type Plugin = ReturnType<typeof ActionCreators.plugin>;
  export type AutomaticGameEvent = ReturnType<
    typeof ActionCreators.automaticGameEvent
  >;
  export type Any =
    | MakeMove
    | GameEvent
    | AutomaticGameEvent
    | ActionShape.Sync
    | ActionShape.Update
    | ActionShape.Reset
    | ActionShape.Undo
    | ActionShape.Redo
    | ActionShape.Plugin;
}

export namespace ActionShape {
  type StripCredentials<T extends object> = Object.P.Omit<
    T,
    ['payload', 'credentials']
  >;
  export type MakeMove = StripCredentials<CredentialedActionShape.MakeMove>;
  export type GameEvent = StripCredentials<CredentialedActionShape.GameEvent>;
  export type Plugin = StripCredentials<CredentialedActionShape.Plugin>;
  export type AutomaticGameEvent = StripCredentials<
    CredentialedActionShape.AutomaticGameEvent
  >;
  export type Sync = ReturnType<typeof ActionCreators.sync>;
  export type Update = ReturnType<typeof ActionCreators.update>;
  export type Reset = ReturnType<typeof ActionCreators.reset>;
  export type Undo = ReturnType<typeof ActionCreators.undo>;
  export type Redo = ReturnType<typeof ActionCreators.redo>;
  export type Any =
    | MakeMove
    | GameEvent
    | AutomaticGameEvent
    | Sync
    | Update
    | Reset
    | Undo
    | Redo
    | Plugin;
}

export namespace ActionPayload {
  type GetPayload<T extends object> = Object.At<T, 'payload'>;
  export type MakeMove = GetPayload<ActionShape.MakeMove>;
  export type GameEvent = GetPayload<ActionShape.GameEvent>;
}

export type FilteredMetadata = {
  id: number;
  name?: string;
}[];

export interface SyncInfo {
  state: State;
  filteredMetadata: FilteredMetadata;
  initialState: State;
  log: LogEntry[];
}
