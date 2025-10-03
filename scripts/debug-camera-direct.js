#!/usr/bin/env node

/**
 * Direct Camera Debug Script
 * Tests camera access directly in browser environment
 */

const fs = require('fs');

console.log('🎥 Direct Camera Debug Script');
console.log('=============================\n');

// Create a simple HTML test page
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Camera Debug Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .camera-container { 
            background: #000; 
            border-radius: 8px; 
            overflow: hidden; 
            margin: 20px 0;
            position: relative;
        }
        video { width: 100%; height: auto; }
        .overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
            font-size: 18px;
        }
        .controls { margin: 20px 0; }
        button { 
            padding: 10px 20px; 
            margin: 5px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
        }
        .start-btn { background: #007bff; color: white; }
        .stop-btn { background: #dc3545; color: white; }
        .log { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            border-radius: 4px; 
            padding: 10px; 
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        .error { color: #dc3545; }
        .success { color: #28a745; }
        .info { color: #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 Camera Debug Test</h1>
        
        <div class="camera-container">
            <video id="video" autoplay muted playsinline style="display: none;"></video>
            <div id="overlay" class="overlay">
                <div>📷</div>
                <div>Camera not active</div>
            </div>
        </div>
        
        <div class="controls">
            <button id="startBtn" class="start-btn">Start Camera</button>
            <button id="stopBtn" class="stop-btn" disabled>Stop Camera</button>
            <button id="testBtn">Test Camera Access</button>
        </div>
        
        <div id="log" class="log">Ready to test camera...\n</div>
    </div>

    <script>
        const video = document.getElementById('video');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const testBtn = document.getElementById('testBtn');
        const log = document.getElementById('log');
        
        let stream = null;
        
        function addLog(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
            log.innerHTML += \`<span class="\${className}">[\${timestamp}] \${message}</span>\\n\`;
            log.scrollTop = log.scrollHeight;
        }
        
        function updateUI() {
            if (stream) {
                video.style.display = 'block';
                overlay.style.display = 'none';
                startBtn.disabled = true;
                stopBtn.disabled = false;
            } else {
                video.style.display = 'none';
                overlay.style.display = 'block';
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }
        }
        
        async function testCameraAccess() {
            addLog('🔍 Testing camera access...');
            
            // Check if we're on HTTPS or localhost
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
            addLog(\`Security: \${isSecure ? '✅ Secure (HTTPS/localhost)' : '❌ Not secure'}\`);
            
            // Check if getUserMedia is supported
            const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            addLog(\`getUserMedia: \${hasGetUserMedia ? '✅ Supported' : '❌ Not supported'}\`);
            
            // Check available devices
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                addLog(\`Video devices: \${videoDevices.length} found\`);
                videoDevices.forEach((device, index) => {
                    addLog(\`  Device \${index + 1}: \${device.label || 'Unknown'}\`);
                });
            } catch (error) {
                addLog(\`Device enumeration failed: \${error.message}\`, 'error');
            }
        }
        
        async function startCamera() {
            try {
                addLog('🎥 Starting camera...');
                
                // Stop existing stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                // Try different camera configurations
                const configs = [
                    { video: { facingMode: 'user' } },
                    { video: { width: 640, height: 480 } },
                    { video: true }
                ];
                
                let success = false;
                for (let i = 0; i < configs.length; i++) {
                    try {
                        addLog(\`Trying config \${i + 1}: \${JSON.stringify(configs[i])}\`);
                        stream = await navigator.mediaDevices.getUserMedia(configs[i]);
                        addLog(\`✅ Camera started with config \${i + 1}\`);
                        success = true;
                        break;
                    } catch (error) {
                        addLog(\`❌ Config \${i + 1} failed: \${error.name} - \${error.message}\`, 'error');
                    }
                }
                
                if (!success) {
                    throw new Error('All camera configurations failed');
                }
                
                // Set video source
                video.srcObject = stream;
                
                // Add event listeners
                video.onloadedmetadata = () => {
                    addLog('✅ Video metadata loaded');
                    updateUI();
                };
                
                video.oncanplay = () => {
                    addLog('✅ Video can play');
                };
                
                video.onplay = () => {
                    addLog('✅ Video started playing');
                };
                
                video.onerror = (e) => {
                    addLog(\`❌ Video error: \${e}\`, 'error');
                };
                
                // Timeout check
                setTimeout(() => {
                    if (!video.videoWidth && !video.videoHeight) {
                        addLog('⚠️ Video dimensions not set - possible issue', 'error');
                    }
                }, 3000);
                
            } catch (error) {
                addLog(\`❌ Camera start failed: \${error.name} - \${error.message}\`, 'error');
                
                // Provide specific error guidance
                if (error.name === 'NotAllowedError') {
                    addLog('💡 Solution: Allow camera permission in browser', 'info');
                } else if (error.name === 'NotFoundError') {
                    addLog('💡 Solution: Check if camera is connected', 'info');
                } else if (error.name === 'NotReadableError') {
                    addLog('💡 Solution: Close other apps using camera', 'info');
                }
            }
        }
        
        function stopCamera() {
            if (stream) {
                addLog('🛑 Stopping camera...');
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                video.srcObject = null;
                updateUI();
                addLog('✅ Camera stopped');
            }
        }
        
        // Event listeners
        startBtn.addEventListener('click', startCamera);
        stopBtn.addEventListener('click', stopCamera);
        testBtn.addEventListener('click', testCameraAccess);
        
        // Initial UI state
        updateUI();
        
        // Auto-test on load
        testCameraAccess();
    </script>
</body>
</html>
`;

// Write the test file
fs.writeFileSync('camera-debug-test.html', testHTML);

console.log('✅ Camera debug test page created: camera-debug-test.html');
console.log('\n📋 Instructions:');
console.log('1. Open camera-debug-test.html in your browser');
console.log('2. Click "Test Camera Access" to check permissions');
console.log('3. Click "Start Camera" to test camera functionality');
console.log('4. Check the log for detailed error information');
console.log('\n🔧 Common Issues:');
console.log('- Permission denied: Allow camera access in browser');
console.log('- Not found: Check if camera is connected');
console.log('- Not readable: Close other apps using camera');
console.log('- Security error: Use HTTPS or localhost');

console.log('\n🌐 Open in browser:');
console.log('file://' + process.cwd() + '/camera-debug-test.html');
