import { State } from '../types';

export class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;

  public addState(state: State): void {
    this.states.set(state.name, state);
  }

  public setState(name: string): void {
    const newState = this.states.get(name);
    if (!newState) {
      console.error(`State "${name}" not found`);
      return;
    }

    if (this.currentState?.onExit) {
      this.currentState.onExit();
    }

    this.currentState = newState;

    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  }

  public update(dt: number): void {
    if (this.currentState?.onUpdate) {
      this.currentState.onUpdate(dt);
    }
  }

  public getCurrentState(): string | null {
    return this.currentState?.name ?? null;
  }
}
