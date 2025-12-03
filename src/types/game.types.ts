export type GameState =
  | 'BOOT'
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'LOADING'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSE'
  | 'GAME_OVER'
  | 'LEVEL_COMPLETE';

export interface State {
  name: string;
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (dt: number) => void;
}

export interface Equation {
  type: 'addition' | 'subtraction';
  format: 'a+_=c' | '_+b=c' | 'a+b=_';
  operandA: number;
  operandB: number;
  answer: number;
  target: number;
}

export interface ThemeConfig {
  pathColor: number;
  skyColor: number;
  accentColor: number;
}
