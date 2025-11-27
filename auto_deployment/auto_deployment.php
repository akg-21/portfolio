<?php
// Logging function
function writeLog($message, $status = 'INFO') {
    $log_dir = '/var/www/logs';
    $log_file = $log_dir . '/webhook.txt';
    
    // Create log directory if it doesn't exist
    if (!is_dir($log_dir)) {
        @mkdir($log_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $log_entry = "[$timestamp] [$status] [$ip] $message" . PHP_EOL;
    
    @file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

// Get secret from environment variable or use default (should be set in production)
$secret = 'auto_deployment_ajay';

// Log incoming request
writeLog("Webhook request received - Method: " . $_SERVER['REQUEST_METHOD'], 'INFO');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    writeLog("Invalid request method: " . $_SERVER['REQUEST_METHOD'], 'ERROR');
    http_response_code(405);
    echo "Method not allowed";
    exit;
}

// Get the raw payload
$raw = file_get_contents("php://input");

if (empty($raw)) {
    writeLog("Empty payload received", 'ERROR');
    http_response_code(400);
    echo "Empty payload";
    exit;
}

// Get the signature from headers
$signature_header = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

if (empty($signature_header)) {
    writeLog("Missing signature header", 'ERROR');
    http_response_code(403);
    echo "Missing signature";
    exit;
}

// Calculate expected signature
$signature = "sha256=" . hash_hmac('sha256', $raw, $secret);

// Verify signature using constant-time comparison
if (hash_equals($signature, $signature_header)) {
    // Get deployment path from environment or use configured path
    $deploy_path = getenv('DEPLOY_PATH') ?: '/var/www/portfolio';
    
    writeLog("Signature verified. Starting deployment from: $deploy_path", 'INFO');
    
    // Use the deploy.sh script if it exists, otherwise use git pull directly
    $deploy_script = __DIR__ . '/deploy.sh';
    
    if (file_exists($deploy_script)) {
        $output = shell_exec("bash " . escapeshellarg($deploy_script) . " 2>&1");
        writeLog("Deployment script executed: $deploy_script", 'INFO');
    } else {
        // Fallback to direct git pull
        $output = shell_exec("cd " . escapeshellarg($deploy_path) . " && git pull 2>&1");
        writeLog("Direct git pull executed in: $deploy_path", 'INFO');
    }
    
    // Log deployment output
    if (!empty($output)) {
        writeLog("Deployment output: " . trim($output), 'INFO');
    }
    
    writeLog("Deployment completed successfully", 'SUCCESS');
    
    http_response_code(200);
    echo "Deployed successfully.";
} else {
    writeLog("Invalid signature - Authentication failed", 'ERROR');
    http_response_code(403);
    echo "Invalid signature";
}
?>