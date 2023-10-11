export default class Structure {
    constructor(output: (msg: string) => void);
    output(_msg: string): void;
    solveNumbers(alphabetsInput: number[], glyphNumbersInput: number[]): void;
    _recursiveGlyphsBuilder(glyphsArr: string[][], index?: number, inputArr?: string[]): string[][];
    solveGlyphs(glyphsInput: string[], mute?: boolean): {
        answer: string;
        cost: number;
    };
}
