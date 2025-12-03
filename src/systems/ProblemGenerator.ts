import { Equation } from '../types';
import { NumberBonds } from '../math/NumberBonds';
import { shuffle } from '../utils/helpers';

export class ProblemGenerator {
  private target: number;
  private usedEquations: Set<string> = new Set();

  constructor(target: number = 10) {
    this.target = target;
  }

  public generateEquation(): Equation {
    const [a, b] = NumberBonds.getRandomBond(this.target);

    // Randomly choose format (focusing on missing addends for number bonds)
    const formats: Array<'a+_=c' | '_+b=c'> = ['a+_=c', '_+b=c'];
    const format = formats[Math.floor(Math.random() * formats.length)];

    let answer: number;
    switch (format) {
      case 'a+_=c':
        answer = b;
        break;
      case '_+b=c':
        answer = a;
        break;
      default:
        answer = b;
    }

    return {
      type: 'addition',
      format,
      operandA: a,
      operandB: b,
      answer,
      target: this.target,
    };
  }

  public generateTileOptions(correctAnswer: number, count: number = 6): number[] {
    const options = new Set<number>([correctAnswer]);

    // Add distractors
    while (options.size < count) {
      // Generate plausible wrong answers (within reasonable range)
      const distractor = Math.floor(Math.random() * (this.target + 2)) + 1;
      if (distractor !== correctAnswer && distractor > 0 && distractor <= this.target) {
        options.add(distractor);
      }
    }

    // If we still need more options, add some from beyond the target
    while (options.size < count) {
      const distractor = Math.floor(Math.random() * 5) + this.target + 1;
      if (distractor !== correctAnswer) {
        options.add(distractor);
      }
    }

    // Shuffle
    return shuffle([...options]);
  }

  public formatEquationString(eq: Equation): string {
    switch (eq.format) {
      case 'a+_=c':
        return `${eq.operandA} + _ = ${eq.target}`;
      case '_+b=c':
        return `_ + ${eq.operandB} = ${eq.target}`;
      case 'a+b=_':
        return `${eq.operandA} + ${eq.operandB} = _`;
    }
  }

  public setTarget(target: number): void {
    this.target = target;
    this.usedEquations.clear();
  }
}
