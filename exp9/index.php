<?php
session_start();

if (!isset($_SESSION['history'])) {
    $_SESSION['history'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'save_history') {
        $expression = htmlspecialchars($data['expression'] ?? '');
        $result = htmlspecialchars($data['result'] ?? '');
        if ($expression && $result) {
            array_unshift($_SESSION['history'], [
                'expression' => $expression,
                'result'     => $result,
                'time'       => date('h:i A'),
            ]);
            $_SESSION['history'] = array_slice($_SESSION['history'], 0, 50);
        }
        echo json_encode(['status' => 'ok', 'history' => $_SESSION['history']]);
        exit;
    }

    if ($action === 'get_history') {
        echo json_encode(['history' => $_SESSION['history']]);
        exit;
    }

    if ($action === 'clear_history') {
        $_SESSION['history'] = [];
        echo json_encode(['status' => 'ok']);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CalcX</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">

        <aside class="history-panel" id="historyPanel">
            <div class="history-header">
                <span class="history-title">HISTORY</span>
                <button class="clear-btn" id="clearHistoryBtn" title="Clear all">&#10005;</button>
            </div>
            <div class="history-list" id="historyList">
                <div class="history-empty" id="historyEmpty">No calculations yet</div>
            </div>
        </aside>

        <main class="calc-wrapper">
            <div class="calc-top-bar">
                <span class="brand">CalcX</span>
                <button class="history-toggle" id="historyToggle" aria-label="Toggle history">
                    <span class="ht-icon">
                        <span></span><span></span><span></span>
                    </span>
                </button>
            </div>

            <div class="display-area">
                <div class="expression-display" id="expressionDisplay">&nbsp;</div>
                <div class="result-display" id="resultDisplay">0</div>
            </div>

            <div class="keypad">
                
                <button class="key key-fn" data-action="clear">AC</button>
                <button class="key key-fn" data-action="sign">+/-</button>
                <button class="key key-fn" data-action="percent">%</button>
                <button class="key key-op" data-op="/">&#247;</button>

                
                <button class="key key-num" data-num="7">7</button>
                <button class="key key-num" data-num="8">8</button>
                <button class="key key-num" data-num="9">9</button>
                <button class="key key-op" data-op="*">&#215;</button>

                
                <button class="key key-num" data-num="4">4</button>
                <button class="key key-num" data-num="5">5</button>
                <button class="key key-num" data-num="6">6</button>
                <button class="key key-op" data-op="-">&#8722;</button>

                
                <button class="key key-num" data-num="1">1</button>
                <button class="key key-num" data-num="2">2</button>
                <button class="key key-num" data-num="3">3</button>
                <button class="key key-op" data-op="+">+</button>

                
                <button class="key key-num key-zero" data-num="0">0</button>
                <button class="key key-num" data-action="decimal">.</button>
                <button class="key key-eq" data-action="equals">=</button>
            </div>
        </main>

    </div>

    <script src="calc.js"></script>
</body>
</html>
