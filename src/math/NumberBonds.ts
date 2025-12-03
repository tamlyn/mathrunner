export class NumberBonds {
  public static getNumberBonds(target: number): Array<[number, number]> {
    const bonds: Array<[number, number]> = [];
    for (let i = 0; i <= target; i++) {
      bonds.push([i, target - i]);
    }
    return bonds;
  }

  public static getValidBonds(target: number): Array<[number, number]> {
    // Exclude bonds with 0 (too easy)
    return this.getNumberBonds(target).filter(([a, b]) => a > 0 && b > 0);
  }

  public static getRandomBond(target: number): [number, number] {
    const bonds = this.getValidBonds(target);
    return bonds[Math.floor(Math.random() * bonds.length)];
  }
}
