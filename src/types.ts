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
  action: object;
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
