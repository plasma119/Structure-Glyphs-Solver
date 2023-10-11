export default class Structure {
    constructor(output) {
        this.output = output;
    }
    output(_msg) { }
    solveNumbers(alphabetsInput, glyphNumbersInput) {
        const alphabets = 'abcdefghijklmnopqrstuvwxyz';
        if (alphabetsInput.length != 26) {
            this.output(`Incorrect number of alphabets: ${alphabetsInput.length}/26`);
            return;
        }
        this.output(`Alphabet Numbers: ${alphabetsInput.join(' ')}`);
        this.output(`Glyph Numbers: ${glyphNumbersInput.join(' ')}`);
        let glyphAlphabets = alphabetsInput.map((v, i) => {
            return {
                alphabet: alphabets[i],
                number: v,
            };
        });
        // indexing all possible pairs
        let numberMap = new Map();
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
        let glyphNumbers = glyphNumbersInput.map((v) => {
            return {
                codeArr: numberMap.get(v) || [],
                number: v,
            };
        });
        let decodeFailed = false;
        this.output('Decoding glyph numbers:');
        glyphNumbers.forEach((glyph) => {
            this.output(`[${glyph.number}]: ${glyph.codeArr.join(',')}`);
            if (glyph.codeArr.length == 0)
                decodeFailed = true;
        });
        if (decodeFailed) {
            this.output('Decoding failed.');
            return;
        }
        // mirror glyphs
        let glyphsArr = [];
        glyphNumbers.forEach((glyph) => {
            glyphsArr.push(glyph.codeArr.concat(glyph.codeArr.filter((code) => code[0] != code[1]).map((code) => code[1] + code[0])));
        });
        let arr = this._recursiveGlyphsBuilder(glyphsArr);
        // trying all possible glyphs order
        this.output('Brute forcing all glyphs order...');
        let computeCost = 0;
        let results = [];
        arr.forEach((glyphs) => {
            let result = this.solveGlyphs(glyphs, true);
            computeCost += result.cost;
            results.push(result.answer);
        });
        let best = results[0];
        let same = [results[0]];
        results.forEach((r) => {
            if (r.length > best.length) {
                best = r;
                same = [r];
            }
            else if (r.length == best.length) {
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
    _recursiveGlyphsBuilder(glyphsArr, index = 0, inputArr = []) {
        let resultArr = [];
        for (let i = 0; i < glyphsArr[index].length; i++) {
            let input = inputArr.slice(0);
            input.push(glyphsArr[index][i]);
            if (glyphsArr.length > index + 1) {
                resultArr.push(...this._recursiveGlyphsBuilder(glyphsArr, index + 1, input));
            }
            else {
                resultArr.push(input);
            }
        }
        return resultArr;
    }
    solveGlyphs(glyphsInput, mute = false) {
        if (!mute)
            this.output(`Glyphs: ${glyphsInput.join(' ')}`);
        let glyphs = glyphsInput.map((t) => {
            return { code: t, used: false, before: [], after: [] };
        });
        // indexing
        let startMap = new Map();
        let endMap = new Map();
        glyphs.forEach((glyph) => {
            let startArr = startMap.get(glyph.code[0]) || [];
            startArr.push(glyph);
            startMap.set(glyph.code[0], startArr);
            let endArr = endMap.get(glyph.code[1]) || [];
            endArr.push(glyph);
            endMap.set(glyph.code[1], endArr);
        });
        let startCandidate = null;
        let endCandidate = null;
        // finding possible pairs
        glyphs.forEach((glyph) => {
            glyph.before = endMap.get(glyph.code[0]) || [];
            glyph.after = startMap.get(glyph.code[1]) || [];
            if (glyph.before.length == 0)
                startCandidate = glyph;
            if (glyph.after.length == 0)
                endCandidate = glyph;
            // this.output(`[${glyph.code}]`);
            // this.output(`possible start: ${glyph.before.map(g => g.code).join(' ')}`);
            // this.output(`possible end: ${glyph.after.map(g => g.code).join(' ')}`);
        });
        let computeCost = 0;
        let recursiveGlyphSearch = (glyph, reverse = false) => {
            computeCost++;
            if (reverse && glyph.before.length == 0)
                return [glyph];
            if (!reverse && glyph.after.length == 0)
                return [glyph];
            glyph.used = true;
            let results = [[glyph]];
            if (reverse) {
                glyph.before.forEach((g) => {
                    if (!g.used)
                        results.push([glyph, ...recursiveGlyphSearch(g, reverse)]);
                });
            }
            else {
                glyph.after.forEach((g) => {
                    if (!g.used)
                        results.push([glyph, ...recursiveGlyphSearch(g)]);
                });
            }
            glyph.used = false;
            let best = results[0];
            results.forEach((r) => {
                if (r.length > best.length)
                    best = r;
            });
            return best;
        };
        let answer = '';
        if (startCandidate) {
            // found a starting glyph
            if (!mute)
                this.output('Found starting glyph...');
            let result = recursiveGlyphSearch(startCandidate);
            answer = `${result[0].code[0]}${result.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute)
                this.output(`Result: ${answer}`);
        }
        else if (endCandidate) {
            // found a ending glyph
            if (!mute)
                this.output('Found ending glyph...');
            let result = recursiveGlyphSearch(endCandidate, true).reverse();
            answer = `${result[0].code[0]}${result.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute)
                this.output(`Result: ${answer}`);
        }
        else {
            // no obvious starting or ending glyph
            if (!mute)
                this.output('Brute force searching...');
            let results = [];
            glyphs.forEach((g) => results.push(recursiveGlyphSearch(g)));
            let best = results[0];
            results.forEach((r) => {
                if (r.length > best.length)
                    best = r;
            });
            answer = `${best[0].code[0]}${best.map((glyph) => glyph.code[1]).join('')}`;
            if (!mute)
                this.output(`Best result: ${answer}`);
            if (!mute)
                this.output(`Possible results:`);
            results.forEach((r) => {
                if (!mute)
                    this.output(`${r[0].code[0]}${r.map((glyph) => glyph.code[1]).join('')}`);
            });
        }
        if (!mute)
            this.output(`Computation cost: ${computeCost}`);
        return {
            answer: answer,
            cost: computeCost,
        };
    }
}
//# sourceMappingURL=structure.js.map