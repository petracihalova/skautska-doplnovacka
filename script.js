const ROWS = 21;
const COLS = 22;

const activeCells = new Set([
    '1,11',
    '2,11',
    '3,11',
    '4,7','4,11','4,15','4,16','4,17','4,18',
    '5,4','5,5','5,6','5,7','5,8','5,9','5,11','5,18',
    '6,7','6,11','6,18',
    '7,5','7,6','7,7','7,8','7,9','7,10','7,11','7,12','7,18','7,20',
    '8,7','8,11','8,18','8,20',
    '9,2','9,5','9,7','9,18','9,19','9,20','9,21','9,22',
    '10,1','10,2','10,3','10,4','10,5','10,6','10,7','10,20',
    '11,2','11,5','11,10','11,13','11,20',
    '12,2','12,5','12,10','12,12','12,13','12,14','12,15','12,16','12,17','12,18','12,19','12,20',
    '13,2','13,3','13,4','13,5','13,6','13,7','13,8','13,10','13,13',
    '14,2','14,6','14,10','14,13',
    '15,2','15,6','15,10','15,13',
    '16,2','16,5','16,6','16,7','16,8','16,9','16,10','16,13',
    '17,9','17,11','17,13',
    '18,8','18,9','18,10','18,11','18,12','18,13','18,14',
    '19,9','19,11','19,13',
    '20,11',
    '21,11',
]);

const blackCells = new Set(['17,10']);

const numbers = {
    '1,11': 1, '4,7': 2, '4,15': 3, '4,18': 4,
    '5,4': 5, '7,5': 6, '7,20': 7, '9,2': 8,
    '9,5': 9, '9,18': 10, '10,1': 11, '11,10': 12,
    '11,13': 13, '12,12': 14, '13,2': 15, '13,6': 16,
    '16,5': 17, '16,9': 18, '17,11': 19, '18,8': 20,
};

const words = [
    // Vodorovně (Across)
    { num: 3,  row: 4,  col: 15, dir: 'H', len: 4 },
    { num: 5,  row: 5,  col: 4,  dir: 'H', len: 6 },
    { num: 6,  row: 7,  col: 5,  dir: 'H', len: 8 },
    { num: 10, row: 9,  col: 18, dir: 'H', len: 5 },
    { num: 11, row: 10, col: 1,  dir: 'H', len: 7 },
    { num: 14, row: 12, col: 12, dir: 'H', len: 9 },
    { num: 15, row: 13, col: 2,  dir: 'H', len: 7 },
    { num: 17, row: 16, col: 5,  dir: 'H', len: 6 },
    { num: 20, row: 18, col: 8,  dir: 'H', len: 7 },
    // Svisle (Down)
    { num: 1,  row: 1,  col: 11, dir: 'V', len: 8 },
    { num: 2,  row: 4,  col: 7,  dir: 'V', len: 7 },
    { num: 4,  row: 4,  col: 18, dir: 'V', len: 6 },
    { num: 7,  row: 7,  col: 20, dir: 'V', len: 6 },
    { num: 8,  row: 9,  col: 2,  dir: 'V', len: 8 },
    { num: 9,  row: 9,  col: 5,  dir: 'V', len: 5 },
    { num: 12, row: 11, col: 10, dir: 'V', len: 6 },
    { num: 13, row: 11, col: 13, dir: 'V', len: 9 },
    { num: 16, row: 13, col: 6,  dir: 'V', len: 4 },
    { num: 18, row: 16, col: 9,  dir: 'V', len: 4 },
    { num: 19, row: 17, col: 11, dir: 'V', len: 5 },
];

// Build word cells lookup: num -> [{r, c}]
const wordCells = {};
for (const w of words) {
    const cells = [];
    for (let i = 0; i < w.len; i++) {
        const r = w.dir === 'H' ? w.row : w.row + i;
        const c = w.dir === 'H' ? w.col + i : w.col;
        cells.push({ r, c });
    }
    wordCells[w.num] = cells;
}

// Build per-cell word membership
const cellWordH = {}; // key -> word num
const cellWordV = {}; // key -> word num
for (const w of words) {
    for (let i = 0; i < w.len; i++) {
        const r = w.dir === 'H' ? w.row : w.row + i;
        const c = w.dir === 'H' ? w.col + i : w.col;
        const key = r + ',' + c;
        if (w.dir === 'H') cellWordH[key] = w.num;
        else cellWordV[key] = w.num;
    }
}

const inputMap = {}; // key -> input element

// Map: word num -> .clue-item element (built after DOM is ready)
const clueItemMap = {};
document.querySelectorAll('.clue-num').forEach(span => {
    const num = parseInt(span.textContent);
    if (!isNaN(num)) clueItemMap[num] = span.closest('.clue-item');
});

function checkWordCompletion(num) {
    const cells = wordCells[num];
    if (!cells) return;
    const complete = cells.every(cell => {
        const input = inputMap[cell.r + ',' + cell.c];
        return input && input.value.trim() !== '';
    });
    const item = clueItemMap[num];
    if (item) item.classList.toggle('clue-done', complete);
}

function checkWordsForCell(r, c) {
    const key = r + ',' + c;
    if (cellWordH[key]) checkWordCompletion(cellWordH[key]);
    if (cellWordV[key]) checkWordCompletion(cellWordV[key]);
}

// Build grid
const table = document.getElementById('crosswordGrid');
for (let r = 1; r <= ROWS; r++) {
    const tr = document.createElement('tr');
    for (let c = 1; c <= COLS; c++) {
        const td = document.createElement('td');
        const key = r + ',' + c;

        if (blackCells.has(key)) {
            td.className = 'cell-black';
        } else if (activeCells.has(key)) {
            td.className = 'cell-active';

            if (numbers[key] !== undefined) {
                const span = document.createElement('span');
                span.className = 'cell-num';
                span.textContent = numbers[key];
                span.dataset.num = numbers[key];
                td.appendChild(span);

                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const num = parseInt(span.dataset.num);
                    const cells = wordCells[num];
                    const isFilled = cells && cells.every(cell => {
                        const inp = inputMap[cell.r + ',' + cell.c];
                        return inp && inp.value.trim() !== '';
                    });
                    if (isFilled) {
                        const word = words.find(w => w.num === num);
                        cells.forEach(cell => {
                            const key = cell.r + ',' + cell.c;
                            const crossingNum = word.dir === 'H' ? cellWordV[key] : cellWordH[key];
                            let preserve = false;
                            if (crossingNum !== undefined) {
                                // preserve only if crossing word has at least one other filled cell
                                const crossingCells = wordCells[crossingNum];
                                preserve = crossingCells.some(cc => {
                                    if (cc.r === cell.r && cc.c === cell.c) return false;
                                    const inp = inputMap[cc.r + ',' + cc.c];
                                    return inp && inp.value.trim() !== '';
                                });
                            }
                            if (!preserve) {
                                const inp = inputMap[key];
                                if (inp) inp.value = '';
                            }
                        });
                        checkWordCompletion(num);
                        cells.forEach(cell => checkWordsForCell(cell.r, cell.c));
                        saveState();
                    } else {
                        showWordModal(num);
                    }
                });
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cell-input';
            input.dataset.row = r;
            input.dataset.col = c;
            td.appendChild(input);
            inputMap[key] = input;

            input.addEventListener('keydown', (e) => {
                const row = parseInt(input.dataset.row);
                const col = parseInt(input.dataset.col);

                if (e.key === 'Backspace') {
                    if (input.value !== '') {
                        input.value = '';
                        checkWordsForCell(row, col);
                        saveState();
                    } else {
                        moveToPrev(row, col);
                    }
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    focusCell(row, col + 1);
                    e.preventDefault();
                } else if (e.key === 'ArrowLeft') {
                    focusCell(row, col - 1);
                    e.preventDefault();
                } else if (e.key === 'ArrowDown') {
                    focusCell(row + 1, col);
                    e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                    focusCell(row - 1, col);
                    e.preventDefault();
                } else if (e.key.length === 1) {
                    input.value = e.key.toUpperCase();
                    checkWordsForCell(row, col);
                    saveState();
                    moveToNext(row, col);
                    e.preventDefault();
                }
            });

        } else {
            td.className = 'cell-blank';
        }
        tr.appendChild(td);
    }
    table.appendChild(tr);
}

const STORAGE_KEY = 'skautska-doplnovacka';

function toggleHelp() {
    const box = document.getElementById('helpBox');
    const btn = document.getElementById('btnHelp');
    const visible = box.style.display === 'block';
    box.style.display = visible ? 'none' : 'block';
    btn.classList.toggle('active', !visible);
}

function clearAll() {
    if (!confirm('Opravdu vymazat celou doplňovačku?')) return;
    for (const input of Object.values(inputMap)) input.value = '';
    localStorage.removeItem(STORAGE_KEY);
    for (const w of words) checkWordCompletion(w.num);
}

function saveState() {
    const state = {};
    for (const [key, input] of Object.entries(inputMap)) {
        if (input.value) state[key] = input.value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const state = JSON.parse(raw);
        for (const [key, val] of Object.entries(state)) {
            if (inputMap[key]) inputMap[key].value = val;
        }
        // update clue highlights after loading
        for (const w of words) checkWordCompletion(w.num);
    } catch (e) {}
}

function focusCell(r, c) {
    const input = inputMap[r + ',' + c];
    if (input) input.focus();
}

function moveToNext(r, c) {
    const key = r + ',' + c;
    if (cellWordH[key] && inputMap[r + ',' + (c + 1)]) {
        focusCell(r, c + 1);
    } else if (cellWordV[key] && inputMap[(r + 1) + ',' + c]) {
        focusCell(r + 1, c);
    }
}

function moveToPrev(r, c) {
    const key = r + ',' + c;
    if (cellWordH[key] && inputMap[r + ',' + (c - 1)]) {
        focusCell(r, c - 1);
    } else if (cellWordV[key] && inputMap[(r - 1) + ',' + c]) {
        focusCell(r - 1, c);
    }
}

loadState();

function showWordModal(num) {
    const word = words.find(w => w.num === num);
    if (!word) return;
    const dirLabel = word.dir === 'H' ? 'Vodorovně' : 'Svisle';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3>${dirLabel} – č. ${num} <span class="modal-len">(${word.len} písmen)</span></h3>
            <input type="text" class="modal-input" placeholder="${'_ '.repeat(word.len).trim()}" maxlength="${word.len}" autocomplete="off" spellcheck="false">
            <div class="modal-error"></div>
            <div class="modal-buttons">
                <button class="btn-cancel">Zrušit</button>
                <button class="btn-confirm">Potvrdit</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const wordInput = overlay.querySelector('.modal-input');
    const errorEl = overlay.querySelector('.modal-error');
    wordInput.focus();

    wordInput.addEventListener('input', () => {
        wordInput.value = wordInput.value.toUpperCase();
        errorEl.textContent = '';
    });

    function confirm() {
        const val = wordInput.value.replace(/\s/g, '');
        if (val.length !== word.len) {
            errorEl.textContent = `Slovo musí mít přesně ${word.len} písmen (zadáno: ${val.length}).`;
            wordInput.focus();
            return;
        }
        wordCells[num].forEach((cell, i) => {
            const input = inputMap[cell.r + ',' + cell.c];
            if (input) input.value = val[i];
        });
        checkWordCompletion(num);
        wordCells[num].forEach(cell => checkWordsForCell(cell.r, cell.c));
        saveState();
        document.body.removeChild(overlay);
    }

    overlay.querySelector('.btn-confirm').addEventListener('click', confirm);
    overlay.querySelector('.btn-cancel').addEventListener('click', () => document.body.removeChild(overlay));
    wordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') document.body.removeChild(overlay);
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) document.body.removeChild(overlay);
    });
}
