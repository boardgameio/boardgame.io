import { Object } from 'ts-toolbelt';
import * as ActionCreators from './core/action-creators';
import { Flow } from './core/flow';
import { INVALID_MOVE } from './core/reducer';
import * as StorageAPI from './server/db/base';
import { EventsAPI } from './plugins/plugin-events';
import { PlayerAPI } from './plugins/plugin-player';
import { RandomAPI } from './plugins/plugin-random';

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
  // enhanced by events plugin
  events?: EventsAPI;
  // enhanced by player plugin
  player?: PlayerAPI;
  // enhanced by random plugin
  random?: RandomAPI;
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

export interface Plugin<API extends any = any, Data extends any = any> {
  name: string;
  setup?: (setupCtx: { ctx: Ctx }) => Data;
  action?: (data: Data, payload: ActionShape.Plugin['payload']) => Data;
  api?: (apiCtx: { G: any; ctx: Ctx; data: Data }) => API;
  flush?: (flushCtx: { G: any; ctx: Ctx; data: Data; api: API }) => Data;
  fnWrap?: (
    fn: (...args: any[]) => any
  ) => (G: any, ctx: Ctx, ...args: any[]) => any;
}

type MoveFn<A extends any[] = any[]> = (G: any, ctx: Ctx, ...args: A) => any;

export interface LongFormMove {
  move: MoveFn;
  redact?: boolean;
  client?: boolean;
  undoable?: boolean | ((G: any, ctx: Ctx) => boolean);
}

export type Move = MoveFn | LongFormMove;

export interface MoveMap {
  [moveName: string]: Move;
}

export interface PhaseConfig {
  start?: boolean;
  next?: string;
  onBegin?: (G: any, ctx: Ctx) => any;
  onEnd?: (G: any, ctx: Ctx) => any;
  endIf?: (G: any, ctx: Ctx) => boolean | void;
  moves?: MoveMap;
  turn?: TurnConfig;
  wrapped?: {
    endIf?: (state: State) => boolean | void;
    onBegin?: (state: State) => any;
    onEnd?: (state: State) => any;
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
  onBegin?: (G: any, ctx: Ctx) => any;
  onEnd?: (G: any, ctx: Ctx) => any;
  endIf?: (G: any, ctx: Ctx) => boolean | void;
  onMove?: (G: any, ctx: Ctx) => any;
  stages?: StageMap;
  moves?: MoveMap;
  order?: object;
  wrapped?: {
    endIf?: (state: State) => boolean | void;
    onBegin?: (state: State) => any;
    onEnd?: (state: State) => any;
    onMove?: (state: State) => any;
  };
}

interface PhaseMap {
  [phaseName: string]: PhaseConfig;
}

export interface GameConfig {
  name?: string;
  seed?: string | number;
  setup?: (ctx: Ctx, setupData?: any) => any;
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
  endIf?: (G: any, ctx: Ctx) => any;
  onEnd?: (G: any, ctx: Ctx) => any;
  playerView?: (G: any, ctx: Ctx, playerID: PlayerID) => any;
  plugins?: Array<Plugin>;
  processMove?: (
    state: State,
    action: ActionPayload.MakeMove
  ) => State | typeof INVALID_MOVE;
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
