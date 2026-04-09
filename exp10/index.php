<?php

$file = "data.txt";

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['submit'])) {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $thought = htmlspecialchars($_POST['thought']);

    $data = $name . " | " . $email . " | " . $thought . "\n";
    if (file_put_contents($file, $data, FILE_APPEND) === false) {
        $error = "Failed to save data. Please try again.";
    } else {
        $success = "Data submitted successfully!";
    }
}

if (isset($_POST['clear'])) {
    if (file_put_contents($file, "") === false) {
        $error = "Failed to clear data.";
    } else {
        $success = "Data cleared successfully!";
    }
}

$records = [];
if (file_exists($file)) {
    $records = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Feedback Form</title>

<style>
body {
    font-family: 'Segoe UI';
    background: linear-gradient(135deg,#667eea,#764ba2);
    margin: 0;
    padding: 30px;
    display: flex;
    justify-content: center;
}

.container {
    width: 420px;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

h2 {
    margin-top: 0;
}

input, textarea {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border-radius: 6px;
    border: 1px solid #ccc;
}

textarea {
    resize: none;
    height: 80px;
}

button {
    width: 100%;
    padding: 10px;
    background: #667eea;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 6px;
}

button:hover {
    background: #5a67d8;
}

.clear-btn {
    background: #ef4444;
    margin-top: 10px;
}

.data-box {
    max-height: 250px;
    overflow-y: auto;
}

.entry {
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.success {
    color: green;
    font-size: 14px;
}

.error {
    color: red;
    font-size: 14px;
}
</style>

</head>

<body>

<div class="container">

    <div class="card">
        <h2>Feedback Form</h2>

        <?php if (isset($success)) echo "<p class='success'>$success</p>"; ?>
        <?php if (isset($error)) echo "<p class='error'>$error</p>"; ?>

        <form method="POST">
            <input type="text" name="name" placeholder="Your Name" required>
            <input type="email" name="email" placeholder="Your Email" required>
            <textarea name="thought" placeholder="Share your thoughts..." required></textarea>

            <button type="submit" name="submit">Submit</button>
        </form>
    </div>

    <div class="card">
        <h2>Responses</h2>

        <div class="data-box">
            <?php
            if (empty($records)) {
                echo "<p>No responses yet.</p>";
            } else {
                foreach (array_reverse($records) as $row) {
                    echo "<div class='entry'>$row</div>";
                }
            }
            ?>
        </div>

        <form method="POST">
            <button class="clear-btn" name="clear">Clear All</button>
        </form>

        <?php if (isset($error)) echo "<p class='error'>$error</p>"; ?>
    </div>

</div>

</body>
</html>