<!DOCTYPE html>
<html>
<head>
    <title>Simple Array Form</title>
</head>
<body>

<h2>Enter 3 Numbers</h2>

<form method="post">
    Number 1: <input type="number" name="num[]"><br><br>
    Number 2: <input type="number" name="num[]"><br><br>
    Number 3: <input type="number" name="num[]"><br><br>

    <button type="submit">Submit</button>
</form>

<?php
if ($_POST) {
    $numbers = $_POST['num']; // array

    echo "<h3>Numbers are:</h3>";

    foreach ($numbers as $n) {
        echo $n . "<br>";
    }
}
?>

</body>
</html>