import Structure from './structure.js';

// @ts-ignore
let input: HTMLInputElement | null = document.getElementById('input');
let output = document.getElementById('output');
const solver = new Structure(outputMessage);

let solveGlyphsButton = document.getElementById('solveGlyphs');
let solveNumbersButton = document.getElementById('solveNumbers');

if (!solveGlyphsButton || !solveNumbersButton) {
    console.log('cannot find button elements');
} else {
    solveGlyphsButton.addEventListener('click', solveGlyphs);
    solveNumbersButton.addEventListener('click', solveNumbers);
}

function solveGlyphs() {
    if (!input || !output) {
        console.log('cannot find input/output element');
        return;
    }
    const code = input.value;
    console.log(code);
    output.innerHTML = `Input: ${code}<br>`;
    solver.solveGlyphs(code.trim().split(','));
}

function solveNumbers() {
    if (!input || !output) {
        console.log('cannot find input/output element');
        return;
    }
    const code = input.value;
    console.log(code);
    output.innerHTML = `Input: ${code}<br>`;
    let tokens = code.trim().split(' ');
    solver.solveNumbers(
        tokens[0].split(',').map((n) => Number.parseInt(n)),
        tokens[1].split(',').map((n) => Number.parseInt(n))
    );
}

function outputMessage(msg: string) {
    if (!output) {
        console.log('cannot find output element');
        return;
    }
    output.innerHTML += msg + '<br>';
}
