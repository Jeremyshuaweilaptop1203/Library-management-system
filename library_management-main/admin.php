<?php
// admin.php

// Path to user data file (simple storage)
define('USER_DATA_FILE', 'users.txt');

$errors = [];
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userName = trim($_POST['userName'] ?? '');
    $userId = trim($_POST['userId'] ?? '');

    // Validate inputs
    if (empty($userName)) {
        $errors[] = "Name is required.";
    }
    if (empty($userId)) {
        $errors[] = "ID is required.";
    }

    if (empty($errors)) {
        // Save user data as CSV line: userId,userName
        $line = $userId . "," . $userName . "\n";
        file_put_contents(USER_DATA_FILE, $line, FILE_APPEND | LOCK_EX);
        $success = "User registered successfully!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Admin - User Registration</title>
</head>
<body>
    <h2>User Registration (Admin)</h2>

    <?php if (!empty($errors)): ?>
        <div style="color:red;">
            <ul>
            <?php foreach ($errors as $err): ?>
                <li><?= htmlspecialchars($err) ?></li>
            <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div style="color:green;"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <form method="POST" action="admin.php">
        <label for="userName">Name:</label>
        <input type="text" id="userName" name="userName" required><br><br>

        <label for="userId">ID:</label>
        <input type="text" id="userId" name="userId" required><br><br>

        <button type="submit">Register</button>
    </form>

    <hr>

    <h3>Registered Users</h3>
    <ul>
        <?php
        if (file_exists(USER_DATA_FILE)) {
            $lines = file(USER_DATA_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                list($id, $name) = explode(',', $line);
                echo "<li>ID: " . htmlspecialchars($id) . " — Name: " . htmlspecialchars($name) . "</li>";
            }
        } else {
            echo "<li>No users registered yet.</li>";
        }
        ?>
    </ul>
</body>
</html>
