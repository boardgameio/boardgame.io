import { Object } from 'ts-toolbelt';
import Koa from 'koa';
import * as ActionCreators from './core/action-creators';
import { Flow } from './core/flow';
import { INVALID_MOVE } from './core/reducer';
import * as StorageAPI from './server/db/base';
import { EventsAPI } from './plugins/plugin-events';
import { PlayerAPI } from './plugins/plugin-player';
import { RandomAPI } from './plugins/plugin-random';

export { StorageAPI };

export type AnyFn = (...args: any[]) => any;

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

export type StageArg = StageName | { stage?: StageName; moveLimit?: number };

export interface ActivePlayersArg {
  currentPlayer?: StageArg;
  others?: StageArg;
  all?: StageArg;
  value?: Record<PlayerID, StageArg>;
  moveLimit?: number;
  revert?: boolean;
  next?: ActivePlayersArg;
}

export interface ActivePlayers {
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
  _activePlayersMoveLimit?: Record<PlayerID, number>;
  _activePlayersNumMoves?: Record<PlayerID, number>;
  _prevActivePlayers?: Array<{
    activePlayers: null | ActivePlayers;
    _activePlayersMoveLimit?: Record<PlayerID, number>;
    _activePlayersNumMoves?: Record<PlayerID, number>;
  }>;
  _nextActivePlayers?: ActivePlayersArg;
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
  data: any;
  api?: any;
}

export interface LogEntry {
  action: ActionShape.MakeMove | ActionShape.GameEvent;
  _stateID: number;
  turn: number;
  phase: string;
  redact?: boolean;
  automatic?: boolean;
}

interface PluginContext<API extends any = any, Data extends any = any> {
  G: any;
  ctx: Ctx;
  game: Game;
  api: API;
  data: Data;
}

export interface Plugin<API extends any = any, Data extends any = any> {
  name: string;
  noClient?: (context: PluginContext<API, Data>) => boolean;
  setup?: (setupCtx: { G: any; ctx: Ctx; game: Game }) => Data;
  action?: (data: Data, payload: ActionShape.Plugin['payload']) => Data;
  api?: (context: {
    G: any;
    ctx: Ctx;
    game: Game;
    data: Data;
    playerID?: PlayerID;
  }) => API;
  flush?: (context: PluginContext<API, Data>) => Data;
  dangerouslyFlushRawState?: (flushCtx: {
    state: State;
    game: Game;
    api: API;
    data: Data;
  }) => State;
  fnWrap?: (fn: AnyFn) => (G: any, ctx: Ctx, ...args: any[]) => any;
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

export interface TurnOrderConfig {
  first: (G: any, ctx: Ctx) => number;
  next: (G: any, ctx: Ctx) => number;
  playOrder?: (G: any, ctx: Ctx) => PlayerID[];
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
  order?: TurnOrderConfig;
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

export interface Game {
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
  export type GenerateCredentials = (
    ctx: Koa.DefaultContext
  ) => Promise<string> | string;

  export type AuthenticateCredentials = (
    credentials: string,
    playerMetadata: PlayerMetadata
  ) => Promise<boolean> | boolean;

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
    uuid?: () => string;
    generateCredentials?: GenerateCredentials;
    apiPort?: number;
    apiCallback?: () => void;
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
