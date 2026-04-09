'use strict';

const state = {
    current:     '0',
    previous:    '',
    operator:    null,
    justEvaled:  false,
    newNumber:   true,
};

const resultDisplay    = document.getElementById('resultDisplay');
const expressionDisplay = document.getElementById('expressionDisplay');
const historyList      = document.getElementById('historyList');
const historyEmpty     = document.getElementById('historyEmpty');
const historyPanel     = document.getElementById('historyPanel');
const historyToggle    = document.getElementById('historyToggle');
const clearHistoryBtn  = document.getElementById('clearHistoryBtn');

function formatNumber(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) {
        return n.toExponential(5);
    }
    const [int, dec] = String(val).split('.');
    const intFmt = parseInt(int).toLocaleString('en-US');
    return dec !== undefined ? `${intFmt}.${dec}` : intFmt;
}

function setResult(val) {
    const display = val === 'Error' ? 'Error' : formatNumber(val);
    resultDisplay.textContent = display;
    if (display.length > 12) {
        resultDisplay.style.fontSize = '30px';
    } else if (display.length > 9) {
        resultDisplay.style.fontSize = '38px';
    } else if (display.length > 7) {
        resultDisplay.style.fontSize = '46px';
    } else {
        resultDisplay.style.fontSize = '';
    }
}

function setExpression(val) {
    expressionDisplay.textContent = val || '\u00a0';
}

function opSymbol(op) {
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return map[op] || op;
}

function inputDigit(digit) {
    if (state.justEvaled) {
        state.current = String(digit);
        state.justEvaled = false;
        state.newNumber = false;
        setExpression('');
    } else if (state.newNumber) {
        state.current = String(digit);
        state.newNumber = false;
    } else {
        if (state.current.replace('-', '').length >= 15) return;
        state.current = state.current === '0' ? String(digit) : state.current + digit;
    }
    setResult(state.current);
}

function inputDecimal() {
    if (state.justEvaled) {
        state.current = '0.';
        state.justEvaled = false;
        state.newNumber = false;
        setExpression('');
    } else if (state.newNumber) {
        state.current = '0.';
        state.newNumber = false;
    } else if (!state.current.includes('.')) {
        state.current += '.';
    }
    setResult(state.current);
}

function clearAll() {
    state.current    = '0';
    state.previous   = '';
    state.operator   = null;
    state.justEvaled = false;
    state.newNumber  = true;
    setResult('0');
    setExpression('');
    deactivateOpKeys();
}

function toggleSign() {
    if (state.current === '0') return;
    state.current = state.current.startsWith('-')
        ? state.current.slice(1)
        : '-' + state.current;
    setResult(state.current);
}

function percentage() {
    const n = parseFloat(state.current);
    if (isNaN(n)) return;
    if (state.operator && state.previous !== '') {
        state.current = String((parseFloat(state.previous) * n) / 100);
    } else {
        state.current = String(n / 100);
    }
    state.newNumber = false;
    setResult(state.current);
}

function applyOperator(op) {
    const cur = parseFloat(state.current);

    if (state.operator && !state.newNumber) {
        // Chained operation: evaluate first
        const result = compute(parseFloat(state.previous), cur, state.operator);
        if (result === null) return;
        state.current  = String(result);
        state.previous = String(result);
        setResult(state.current);
    } else {
        state.previous = state.current;
    }

    state.operator   = op;
    state.newNumber  = true;
    state.justEvaled = false;

    setExpression(`${formatNumber(state.previous)} ${opSymbol(op)}`);
    highlightOpKey(op);
}

function compute(a, b, op) {
    let result;
    switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
            if (b === 0) { setResult('Error'); setExpression(''); resetState(); return null; }
            result = a / b;
            break;
        default: return null;
    }
    if (!isFinite(result)) { setResult('Error'); resetState(); return null; }
    return parseFloat(result.toPrecision(14));
}

function evaluate() {
    if (!state.operator || state.newNumber) return;

    const a   = parseFloat(state.previous);
    const b   = parseFloat(state.current);
    const expr = `${formatNumber(state.previous)} ${opSymbol(state.operator)} ${formatNumber(state.current)}`;

    const result = compute(a, b, state.operator);
    if (result === null) return;

    const resultStr = String(result);

    setResult(resultStr);
    setExpression(`${expr} =`);

    // Flash highlight
    resultDisplay.classList.add('highlight');
    setTimeout(() => resultDisplay.classList.remove('highlight'), 400);

    // Save to history
    saveHistory(expr, resultStr);

    state.previous   = resultStr;
    state.current    = resultStr;
    state.operator   = null;
    state.justEvaled = true;
    state.newNumber  = true;
    deactivateOpKeys();
}

function resetState() {
    state.operator   = null;
    state.justEvaled = false;
    state.newNumber  = true;
    deactivateOpKeys();
}

function highlightOpKey(op) {
    deactivateOpKeys();
    document.querySelectorAll('.key-op').forEach(btn => {
        if (btn.dataset.op === op) btn.classList.add('active');
    });
}
function deactivateOpKeys() {
    document.querySelectorAll('.key-op').forEach(btn => btn.classList.remove('active'));
}

function saveHistory(expression, result) {
    fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_history', expression, result })
    })
    .then(r => r.json())
    .then(data => renderHistory(data.history))
    .catch(() => {});
}

function loadHistory() {
    fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_history' })
    })
    .then(r => r.json())
    .then(data => renderHistory(data.history))
    .catch(() => {});
}

function renderHistory(history) {
    if (!history || history.length === 0) {
        historyList.innerHTML = '';
        historyList.appendChild(historyEmpty);
        return;
    }
    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="hi-expr">${item.expression}</div>
            <div class="hi-result">${formatNumber(item.result)}</div>
            <div class="hi-time">${item.time}</div>
        `;
        div.addEventListener('click', () => {
            state.current    = item.result;
            state.justEvaled = true;
            state.newNumber  = true;
            state.operator   = null;
            setResult(item.result);
            setExpression(item.expression + ' =');
            closeHistory();
        });
        historyList.appendChild(div);
    });
}

function clearHistory() {
    fetch('index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_history' })
    })
    .then(() => renderHistory([]))
    .catch(() => {});
}

let overlay = null;

function openHistory() {
    historyPanel.classList.add('open');
    if (window.innerWidth <= 680) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeHistory);
        }
        overlay.classList.add('show');
    }
}

function closeHistory() {
    historyPanel.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

function toggleHistory() {
    historyPanel.classList.contains('open') ? closeHistory() : openHistory();
}

function addRipple(btn, e) {
    const rect   = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left - 20;
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top - 20;
    ripple.style.left = x + 'px';
    ripple.style.top  = y + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

document.querySelectorAll('.key').forEach(btn => {
    btn.addEventListener('click', e => {
        addRipple(btn, e);
        const { action, op, num } = btn.dataset;

        if (num !== undefined) { inputDigit(num); return; }

        switch (action) {
            case 'clear':   clearAll();      break;
            case 'sign':    toggleSign();    break;
            case 'percent': percentage();    break;
            case 'decimal': inputDecimal();  break;
            case 'equals':  evaluate();      break;
        }
        if (op) applyOperator(op);
    });
});

historyToggle.addEventListener('click', toggleHistory);
clearHistoryBtn.addEventListener('click', clearHistory);

document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9')          { inputDigit(e.key); return; }
    if (e.key === '.')                          { inputDecimal(); return; }
    if (e.key === 'Enter' || e.key === '=')    { evaluate(); return; }
    if (e.key === 'Backspace')                  {
        if (!state.newNumber && state.current.length > 1) {
            state.current = state.current.slice(0, -1) || '0';
            setResult(state.current);
        } else { clearAll(); }
        return;
    }
    if (e.key === 'Escape')                    { clearAll(); return; }
    if (['+', '-', '*', '/'].includes(e.key)) { applyOperator(e.key); return; }
    if (e.key === '%')                         { percentage(); }
});

loadHistory();
