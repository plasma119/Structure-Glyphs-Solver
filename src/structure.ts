type glyph = {
    code: string;
    used: boolean;
    before: glyph[];
    after: glyph[];
};

type glyphAlphabet = {
    alphabet: string;
    number: number;
};

type glyphNumber = {
    codeArr: string[];
    number: number;
};

export default class Structure {
    constructor(output: (msg: string) => void) {
        this.output = output;
    }

    output(_msg: string): void {}

    solveNumbers(alphabetsInput: number[], glyphNumbersInput: number[]) {
        const alphabets = 'abcdefghijklmnopqrstuvwxyz';
        if (alphabetsInput.length != 26) {
            this.output(`Incorrect number of alphabets: ${alphabetsInput.length}/26`);
            return;
        }
        this.output(`Alphabet Numbers: ${alphabetsInput.join(' ')}`);
        this.output(`Glyph Numbers: ${glyphNumbersInput.join(' ')}`);

        let glyphAlphabets: glyphAlphabet[] = alphabetsInput.map((v, i) => {
            return {
                alphabet: alphabets[i],
                number: v,
            };
        });

        // indexing all possible pairs
        let numberMap: Map<number, string[]> = new Map();
        for (let i = 0; i < 26; i++) {
            for (let j = i; j < 26; j++) {
                const a = glyphAlphabets[i];
                const b = glyphAlphabets[j];
                const c = a.number * b.number;
                let arr = numberMap.get(c) || [];
                arr.push(a.alphabet + b.alphabet);
                numberMap.set(c, arr);
            }
        }

        // decode glyphNumbers
        let glyphNumbers: glyphNumber[] = glyphNumbersInput.map((v) => {
            return {
                codeArr: numberMap.get(v) || [],
                number: v,
            };
        });

        let decodeFailed = false;
        this.output('Decoding glyph numbers:');
        glyphNumbers.forEach((glyph) => {
            this.output(`[${glyph.number}]: ${glyph.codeArr.join(',')}`);
            if (glyph.codeArr.length == 0) decodeFailed = true;
        });
        if (decodeFailed) {
            this.output('Decoding failed.');
            return;
        }

        // mirror glyphs
        let glyphsArr: string[][] = [];
        glyphNumbers.forEach((glyph) => {
            glyphsArr.push(glyph.codeArr.concat(glyph.codeArr.filter((code) => code[0] != code[1]).map((code) => code[1] + code[0])));
        });
        let arr = this._recursiveGlyphsBuilder(glyphsArr);

        // trying all possible glyphs order
        this.output('Brute forcing all glyphs order...');
        let computeCost = 0;
        let results: string[] = [];
        arr.forEach((glyphs) => {
            let result = this.solveGlyphs(glyphs, true);
            computeCost += result.cost;
            results.push(result.answer);
        });
        let best = results[0];
        let same: string[] = [results[0]];
        results.forEach((r) => {
            if (r.length > best.length) {
                best = r;
                same = [r];
            } else if (r.length == best.length) {
                same.push(r);
            }
        });

        // at least 2 possible best results
        //this.output(`Best result: ${best}`);
        this.output(`All possible results:`);
        same.forEach((v) => {
            this.output(v);
        });
        this.output(`Computation cost: ${computeCost}`);
    }

    _recursiveGlyphsBuilder(glyphsArr: string[][], index: number = 0, inputArr: string[] = []): string[][] {
        let resultArr: string[][] = [];
        for (let i = 0; i < glyphsArr[index].length; i++) {
            let input = inputArr.slice(0);
            input.push(glyphsArr[index][i]);
            if (glyphsArr.length > index + 1) {
                resultArr.push(...this._recursiveGlyphsBuilder(glyphsArr, index + 1, input));
            } else {
                resultArr.push(input);
            }
        }
        return resultArr;
    }

    solveGlyphs(glyphsInput: string[], mute: boolean = false) {
        if (!mute) this.output(`Glyphs: ${glyphsInput.join(' ')}`);
        let glyphs: glyph[] = glyphsInput.map((t) => {
            return { code: t, used: false, before: [], after: [] };
        });

        // indexing
        let startMap: Map<string, glyph[]> = new Map();
        let endMap: Map<string, glyph[]> = new Map();
        glyphs.forEach((glyph) => {
            let startArr = startMap.get(glyph.code[0]) || [];
            startArr.push(glyph);
            startMap.set(glyph.code[0], startArr);
            let endArr = endMap.get(glyph.code[1]) || [];
            endArr.push(glyph);
            endMap.set(glyph.code[1], endArr);
        });

        let startCandidate: glyph | null = null;
        let endCandidate: glyph | null = null;

        // finding possible pairs
        glyphs.forEach((glyph) => {
            glyph.before = endMap.get(glyph.code[0]) || [];
            glyph.after = startMap.get(glyph.code[1]) || [];
            if (glyph.before.length == 0) startCandidate = glyph;
            if (glyph.after.length == 0) endCandidate = glyph;
            // this.output(`[${glyph.code}]`);
            // this.output(`possible start: ${glyph.before.map(g => g.code).join(' ')}`);
            // this.output(`possible end: ${glyph.after.map(g => g.code).join(' ')}`);
        });

        let computeCost = 0;
        let recursiveGlyphSearch = (glyph: glyph, reverse = false): glyph[] => {
            computeCost++;
            if (reverse && glyph.before.length == 0) return [glyph];
            if (!reverse && glyph.after.length == 0) return [glyph];
            glyph.used = true;
            let results: glyph[][] = [[glyph]];
            if (reverse) {
                glyph.before.forEach((g) => {
                    if (!g.used) results.push([glyph, ...recursiveGlyphSearch(g, reverse)]);
                });
            } else {
                glyph.after.forEach((g) => {
                    if (!g.used) results.push([glyph, ...recursiveGlyphSearch(g)]);
                });
            }
            glyph.used = false;
            let best = results[0];
            results.forEach((r) => {
                if (r.length > best.length) best = r;
            });
            return best;
        };

        let answer = '';
        if (startCandidate) {
            // found a starting glyph
            if (!mute) this.output('Found starting glyph...');
            let result = recursiveGlyphSearch(startCandidate);
            answer = `${result[0].code[0]}${result.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute) this.output(`Result: ${answer}`);
        } else if (endCandidate) {
            // found a ending glyph
            if (!mute) this.output('Found ending glyph...');
            let result = recursiveGlyphSearch(endCandidate, true).reverse();
            answer = `${result[0].code[0]}${result.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute) this.output(`Result: ${answer}`);
        } else {
            // no obvious starting or ending glyph
            if (!mute) this.output('Brute force searching...');
            let results: glyph[][] = [];
            glyphs.forEach((g) => results.push(recursiveGlyphSearch(g)));
            let best = results[0];
            results.forEach((r) => {
                if (r.length > best.length) best = r;
            });
            answer = `${best[0].code[0]}${best.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute) {
                this.output(`Best result: ${answer}`);
                this.output(`Possible results:`);
                let arr = results.map((r) => `${r[0].code[0]}${r.map((glyph) => glyph.code[1]).join('')}`);
                arr.sort((a, b) => b.length - a.length);
                arr.forEach((a) => this.output(a));
            }
        }

        if (!mute) this.output(`Computation cost: ${computeCost}`);

        return {
            answer: answer,
            cost: computeCost,
        };
    }
}
