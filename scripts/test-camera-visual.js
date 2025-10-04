#!/usr/bin/env node

/**
 * Test Camera Visual Display Script
 * Creates a simple test page to verify camera visual display
 */

const fs = require('fs');

console.log('🎥 Testing Camera Visual Display...\n');

// Create a simple HTML test page for camera visual
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Camera Visual Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .camera-container { 
            background: #000; 
            border-radius: 8px; 
            overflow: hidden; 
            margin: 20px 0;
            position: relative;
            min-height: 300px;
        }
        video { 
            width: 100%; 
            height: auto; 
            display: block;
        }
        .overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
            font-size: 18px;
            z-index: 10;
        }
        .controls { 
            margin: 20px 0; 
            text-align: center;
        }
        button { 
            padding: 12px 24px; 
            margin: 5px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 16px;
        }
        .start-btn { background: #007bff; color: white; }
        .stop-btn { background: #dc3545; color: white; }
        .log { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            border-radius: 4px; 
            padding: 15px; 
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
            font-size: 14px;
        }
        .error { color: #dc3545; }
        .success { color: #28a745; }
        .info { color: #007bff; }
        .warning { color: #ffc107; }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-weight: bold;
        }
        .status.active { background: #d4edda; color: #155724; }
        .status.inactive { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 Camera Visual Display Test</h1>
        <p>This test verifies that camera stream is properly displayed in video element.</p>
        
        <div class="camera-container">
            <video id="video" autoplay muted playsinline style="display: none;"></video>
            <div id="overlay" class="overlay">
                <div style="font-size: 48px;">📷</div>
                <div>Camera not active</div>
            </div>
        </div>
        
        <div id="status" class="status inactive">Status: Camera Inactive</div>
        
        <div class="controls">
            <button id="startBtn" class="start-btn">Start Camera</button>
            <button id="stopBtn" class="stop-btn" disabled>Stop Camera</button>
            <button id="checkBtn">Check Video Element</button>
        </div>
        
        <div id="log" class="log">Ready to test camera visual display...\n</div>
    </div>

    <script>
        const video = document.getElementById('video');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const checkBtn = document.getElementById('checkBtn');
        const log = document.getElementById('log');
        const status = document.getElementById('status');
        
        let stream = null;
        let isStreaming = false;
        
        function addLog(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const className = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info';
            log.innerHTML += \`<span class="\${className}">[\${timestamp}] \${message}</span>\\n\`;
            log.scrollTop = log.scrollHeight;
        }
        
        function updateStatus(active) {
            isStreaming = active;
            if (active) {
                status.textContent = 'Status: Camera Active';
                status.className = 'status active';
                video.style.display = 'block';
                overlay.style.display = 'none';
                startBtn.disabled = true;
                stopBtn.disabled = false;
            } else {
                status.textContent = 'Status: Camera Inactive';
                status.className = 'status inactive';
                video.style.display = 'none';
                overlay.style.display = 'block';
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }
        }
        
        function checkVideoElement() {
            addLog('🔍 Checking video element properties:');
            addLog(\`  - Video element exists: \${!!video}\`);
            addLog(\`  - Video srcObject: \${!!video.srcObject}\`);
            addLog(\`  - Video readyState: \${video.readyState}\`);
            addLog(\`  - Video paused: \${video.paused}\`);
            addLog(\`  - Video currentTime: \${video.currentTime}\`);
            addLog(\`  - Video videoWidth: \${video.videoWidth}\`);
            addLog(\`  - Video videoHeight: \${video.videoHeight}\`);
            addLog(\`  - Video autoplay: \${video.autoplay}\`);
            addLog(\`  - Video muted: \${video.muted}\`);
            addLog(\`  - Video playsInline: \${video.playsInline}\`);
            
            if (stream) {
                addLog('🔍 Checking stream properties:');
                addLog(\`  - Stream active: \${stream.active}\`);
                addLog(\`  - Stream id: \${stream.id}\`);
                addLog(\`  - Stream tracks: \${stream.getTracks().length}\`);
                stream.getTracks().forEach((track, index) => {
                    addLog(\`    Track \${index + 1}: \${track.kind} - \${track.enabled ? 'enabled' : 'disabled'}\`);
                });
            }
        }
        
        async function startCamera() {
            try {
                addLog('🎥 Starting camera...');
                
                // Stop existing stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                // Get camera stream
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    } 
                });
                
                addLog('✅ Camera stream obtained');
                
                // Set video source
                video.srcObject = stream;
                
                // Add event listeners
                video.onloadstart = () => addLog('📹 Video load started');
                video.onloadeddata = () => addLog('📹 Video data loaded');
                video.onloadedmetadata = () => {
                    addLog(\`📹 Video metadata loaded - \${video.videoWidth}x\${video.videoHeight}\`);
                    updateStatus(true);
                };
                video.oncanplay = () => addLog('📹 Video can play');
                video.onplay = () => addLog('📹 Video started playing');
                video.onplaying = () => addLog('📹 Video is playing');
                video.onpause = () => addLog('📹 Video paused');
                video.onerror = (e) => addLog(\`❌ Video error: \${e}\`, 'error');
                
                // Force play
                try {
                    await video.play();
                    addLog('✅ Video play() successful');
                } catch (playError) {
                    addLog(\`⚠️ Video play() failed: \${playError.message}\`, 'warning');
                }
                
                // Check after a short delay
                setTimeout(() => {
                    addLog(\`📊 Video check after 2s:\`);
                    addLog(\`  - Video dimensions: \${video.videoWidth}x\${video.videoHeight}\`);
                    addLog(\`  - Video readyState: \${video.readyState}\`);
                    addLog(\`  - Video paused: \${video.paused}\`);
                    addLog(\`  - Video currentTime: \${video.currentTime}\`);
                    
                    if (video.videoWidth > 0 && video.videoHeight > 0) {
                        addLog('✅ Camera visual display working correctly!', 'success');
                    } else {
                        addLog('❌ Camera visual display not working', 'error');
                    }
                }, 2000);
                
            } catch (error) {
                addLog(\`❌ Camera start failed: \${error.name} - \${error.message}\`, 'error');
            }
        }
        
        function stopCamera() {
            if (stream) {
                addLog('🛑 Stopping camera...');
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                video.srcObject = null;
                updateStatus(false);
                addLog('✅ Camera stopped');
            }
        }
        
        // Event listeners
        startBtn.addEventListener('click', startCamera);
        stopBtn.addEventListener('click', stopCamera);
        checkBtn.addEventListener('click', checkVideoElement);
        
        // Initial state
        updateStatus(false);
        
        addLog('🎯 Camera Visual Test Ready');
        addLog('Click "Start Camera" to test visual display');
    </script>
</body>
</html>
`;

// Write the test file
fs.writeFileSync('camera-visual-test.html', testHTML);

console.log('✅ Camera visual test page created: camera-visual-test.html');
console.log('\n📋 Instructions:');
console.log('1. Open camera-visual-test.html in your browser');
console.log('2. Click "Start Camera" to test visual display');
console.log('3. Check if camera feed appears in video element');
console.log('4. Use "Check Video Element" to debug properties');
console.log('5. Look for "Camera visual display working correctly!" message');

console.log('\n🔍 What to Check:');
console.log('- Video element should show camera feed');
console.log('- Video dimensions should be > 0x0');
console.log('- Video should be playing (not paused)');
console.log('- Stream should be active');

console.log('\n🌐 Open in browser:');
console.log('file://' + process.cwd() + '/camera-visual-test.html');
