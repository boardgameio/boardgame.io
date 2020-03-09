import { Object } from 'ts-toolbelt'
import * as ActionCreators from './core/action-creators'

export interface Ctx {
  currentPlayer: string;
  gameover: any;
  turn: number;
  phase: string;
  _random: object;
}

export interface State {
  G: object;
  ctx: Ctx;
  deltalog?: Array<object>;
  _undo: Array<Undo>;
  _redo: Array<Undo>;
  _stateID: number;
}

export interface LogEntry {
  action: ActionShape.Any;
  _stateID: number;
  turn: number;
  phase: string;
  redact?: boolean;
  automatic?: boolean;
}

type Plugin = object;

export interface GameConfig {
  name?: string;
  seed?: string | number;
  setup?: Function;
  moves?: object;
  phases?: object;
  turn?: object;
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
  playerView?: Function;
  plugins?: Array<Plugin>;
  processMove?: Function;
  flow?: any;
}

type Undo = State & { moveType: string };

export namespace CredentialedActionShape {
  export type MakeMove = ReturnType<typeof ActionCreators.makeMove>
  export type GameEvent = ReturnType<typeof ActionCreators.gameEvent>
  export type AutomaticGameEvent = ReturnType<typeof ActionCreators.automaticGameEvent>
  export type Any = MakeMove | GameEvent | AutomaticGameEvent | ActionShape.Sync | ActionShape.Update | ActionShape.Reset | ActionShape.Undo | ActionShape.Redo
}

export namespace ActionShape {
  type StripCredentials<T extends object> = Object.P.Omit<T, ['payload', 'credentials']>
  export type MakeMove = StripCredentials<CredentialedActionShape.MakeMove>
  export type GameEvent = StripCredentials<CredentialedActionShape.GameEvent>
  export type AutomaticGameEvent =
    StripCredentials<CredentialedActionShape.AutomaticGameEvent>
  export type Sync = ReturnType<typeof ActionCreators.sync>
  export type Update = ReturnType<typeof ActionCreators.update>
  export type Reset = ReturnType<typeof ActionCreators.reset>
  export type Undo = ReturnType<typeof ActionCreators.undo>
  export type Redo = ReturnType<typeof ActionCreators.redo>
  export type Any = MakeMove | GameEvent | AutomaticGameEvent | Sync | Update | Reset | Undo | Redo
}

export namespace ActionPayload {
  type GetPayload<T extends object> = Object.At<T, 'payload'>
  export type MakeMove = GetPayload<ActionShape.MakeMove>
  export type GameEvent = GetPayload<ActionShape.GameEvent>
}
