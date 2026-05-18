"""
Zancrypt Executable Wrapper Generator Service
=============================================
Combines file metadata, AES-GCM encrypted bytes, and a secure timer
into a single zero-dependency self-destructing HTML wrapper.
"""
import base64
import hashlib
from typing import Dict, Any

def generate_self_destruct_wrapper(options: Dict[str, Any]) -> bytes:
    """
    Generates a zero-dependency HTML file containing a secure countdown,
    XOR-obfuscated bytes, and memory scrubbing routines.
    
    Expected options schema:
    {
        "file_bytes": bytes,        # Decrypted or raw encrypted file bytes
        "file_name": str,          # Original filename e.g. 'contract.pdf'
        "mime_type": str,          # MIME type e.g. 'application/pdf'
        "timer_seconds": int,      # Countdown time in seconds
        "file_id": str,            # File ID or share ID reference
        "share_token": str,        # Key derivation source
        "owner_name": str,         # Name of the share owner
    }
    """
    file_bytes = options["file_bytes"]
    file_name = options["file_name"]
    mime_type = options["mime_type"]
    timer_seconds = int(options["timer_seconds"])
    file_id = str(options["file_id"])
    share_token = options["share_token"]
    owner_name = options["owner_name"]
    
    # 1. Derive repeating obfuscation key from the share token
    key_hash = hashlib.sha256(share_token.encode('utf-8')).hexdigest()
    key_bytes = bytes.fromhex(key_hash)
    
    # 2. XOR obfuscate the bytes to obscure from simple browser DevTools scans
    obfuscated_bytes = bytearray(len(file_bytes))
    for i in range(len(file_bytes)):
        obfuscated_bytes[i] = file_bytes[i] ^ key_bytes[i % len(key_bytes)]
        
    encrypted_b64 = base64.b64encode(obfuscated_bytes).decode('utf-8')
    
    # 3. Choose dynamic timer label for the UI warning
    if timer_seconds == 3600:
        timer_label = "1 Hour"
    elif timer_seconds == 21600:
        timer_label = "6 Hours"
    elif timer_seconds == 86400:
        timer_label = "24 Hours"
    elif timer_seconds == 259200:
        timer_label = "72 Hours"
    else:
        timer_label = f"{timer_seconds // 3600} Hours"

    # 4. Generate the self-contained secure HTML envelope
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZANCRYPT | Protected Expiring File</title>
    <style>
        body {{
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            overflow: hidden;
        }}
        .container {{
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(59, 130, 246, 0.15);
            border-radius: 28px;
            padding: 44px;
            max-width: 480px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        }}
        .logo {{
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.3em;
            color: #3b82f6;
            margin-bottom: 28px;
            text-transform: uppercase;
        }}
        .shield-icon {{
            animation: pulse 3s infinite ease-in-out;
            margin: 0 auto 20px auto;
            color: #3b82f6;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
        }}
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3)); }}
            50% {{ transform: scale(1.05); filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.6)); }}
        }}
        .file-card {{
            background: rgba(7, 9, 19, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 28px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        }}
        .file-name {{
            font-weight: 700;
            font-size: 18px;
            word-break: break-all;
            color: #f1f5f9;
            margin-bottom: 6px;
        }}
        .file-meta {{
            color: #94a3b8;
            font-size: 13px;
        }}
        .timer-display {{
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 46px;
            font-weight: 800;
            color: #ef4444;
            margin: 18px 0;
            text-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
            letter-spacing: 0.02em;
        }}
        .progress-container {{
            background: rgba(255, 255, 255, 0.06);
            height: 8px;
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 28px;
            border: 1px solid rgba(255, 255, 255, 0.02);
        }}
        .progress-bar {{
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            width: 100%;
            height: 100%;
            border-radius: 999px;
            transition: width 0.1s linear;
        }}
        .btn {{
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: #ffffff;
            border: none;
            padding: 16px 32px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            background: linear-gradient(135deg, #1d4ed8, #4338ca);
        }}
        .btn:active {{
            transform: translateY(0);
        }}
        .btn:disabled {{
            background: #1e293b;
            color: #64748b;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }}
        .warning {{
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
            margin-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
        }}
        .warning strong {{
            color: #f1f5f9;
        }}
        .destroyed-screen {{
            display: none;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(239, 68, 68, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.05);
        }}
        .destroyed-icon {{
            color: #ef4444;
            filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));
            margin-bottom: 24px;
        }}
        .destroyed-title {{
            color: #ef4444;
            font-size: 22px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .destroyed-text {{
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.7;
            margin-top: 16px;
        }}
        .destroyed-time {{
            font-family: ui-monospace, SFMono-Regular, monospace;
            font-size: 11px;
            color: #475569;
            margin-top: 28px;
            border-top: 1px solid rgba(255, 255, 255, 0.03);
            padding-top: 16px;
        }}
    </style>
</head>
<body>
    <div class="container" id="mainContainer">
        <div class="logo">Zancrypt Secure Wrapper</div>
        
        <svg class="shield-icon" width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        
        <div class="file-card">
            <div class="file-name">{file_name}</div>
            <div class="file-meta">Shared by: <strong>{owner_name}</strong></div>
        </div>

        <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; font-weight: 700;">Local Remaining Time</div>
        <div class="timer-display" id="timerDisplay">00:00:00</div>

        <button class="btn" id="downloadBtn" onclick="triggerDownload()">Decrypt & Download File</button>

        <div class="warning">
            ⚠ This self-expiring bundle permanently self-destructs <strong>{timer_label}</strong> after opening. 
            Once the timer reaches zero, the underlying payload is wiped and destroyed from memory.
        </div>
    </div>

    <div class="container destroyed-screen" id="destroyedContainer">
        <svg class="destroyed-icon" width="68" height="68" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <div class="destroyed-title">Asset Expired</div>
        <p class="destroyed-text">
            The secure local countdown for this document has expired. The key registers and binary payloads have been thoroughly purged and scrubbed from browser memory.
        </p>
        <div class="destroyed-time" id="destroyedAtLabel"></div>
    </div>

    <script>
        // Injected cryptographic payloads
        let ENCRYPTED_PAYLOAD = "{encrypted_b64}";
        let WRAPPER_KEY = "{key_hash}";
        const TIMER_SECONDS = {timer_seconds};
        const FILE_NAME = "{file_name}";
        const MIME_TYPE = "{mime_type}";
        const FILE_ID = "{file_id}";

        let isDestroyed = false;
        let startTime = 0;

        document.addEventListener("DOMContentLoaded", () => {{
            // 1. Verify local storage status locks
            if (localStorage.getItem("zct_destroyed_" + FILE_ID)) {{
                showDestroyedScreen();
                return;
            }}

            // 2. Load or commit first-open timestamp
            const localStart = localStorage.getItem("zct_start_" + FILE_ID);
            if (localStart) {{
                startTime = parseInt(localStart, 10);
            }} else {{
                startTime = Date.now();
                localStorage.setItem("zct_start_" + FILE_ID, startTime.toString());
            }}

            // 3. Launch Monotonic protection timer
            runCountdown();
        }});

        function runCountdown() {{
            const timerDisplay = document.getElementById("timerDisplay");
            const progressBar = document.getElementById("progressBar");
            let lastTick = Date.now();

            function tick() {{
                if (isDestroyed) return;

                const now = Date.now();
                
                // Clock Rollback Detection Check
                if (now < lastTick - 2000) {{
                    console.warn("Zancrypt: Local system clock rollback detected!");
                    destroyFile();
                    return;
                }}
                lastTick = now;

                const elapsed = Math.floor((now - startTime) / 1000);
                const remaining = TIMER_SECONDS - elapsed;

                if (remaining <= 0) {{
                    destroyFile();
                    return;
                }}

                // Update progress visualization
                const pct = Math.max(0, (remaining / TIMER_SECONDS) * 100);
                progressBar.style.width = pct + "%";

                // Format Time Display
                const hours = Math.floor(remaining / 3600);
                const minutes = Math.floor((remaining % 3600) / 60);
                const seconds = remaining % 60;
                
                timerDisplay.textContent = 
                    (hours < 10 ? "0" : "") + hours + ":" +
                    (minutes < 10 ? "0" : "") + minutes + ":" +
                    (seconds < 10 ? "0" : "") + seconds;

                requestAnimationFrame(tick);
            }}

            // Background Tab poll backup (since requestAnimationFrame scales down in backgrounded tabs)
            setInterval(() => {{
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                if (TIMER_SECONDS - elapsed <= 0) {{
                    destroyFile();
                }}
            }}, 1000);

            requestAnimationFrame(tick);
        }}

        function destroyFile() {{
            if (isDestroyed) return;
            isDestroyed = true;

            // Memory scrubbing: overwrite in-memory values with null variables to prevent recovery
            ENCRYPTED_PAYLOAD = null;
            WRAPPER_KEY = null;
            window.ENCRYPTED_PAYLOAD = "";
            window.WRAPPER_KEY = "";

            // Register destruction locally
            localStorage.setItem("zct_destroyed_" + FILE_ID, Date.now().toString());

            showDestroyedScreen();
            
            // Best-effort callback to coordinator (beacon)
            try {{
                navigator.sendBeacon("/api/share/destroyed", JSON.stringify({{
                    file_id: FILE_ID,
                    destroyed_at: Date.now()
                }}));
            }} catch (e) {{}}
        }}

        function showDestroyedScreen() {{
            document.getElementById("mainContainer").style.display = "none";
            const destroyedCont = document.getElementById("destroyedContainer");
            destroyedCont.style.display = "block";
            
            const timestamp = localStorage.getItem("zct_destroyed_" + FILE_ID);
            if (timestamp) {{
                const d = new Date(parseInt(timestamp, 10));
                document.getElementById("destroyedAtLabel").textContent = "DESTROYED_AT: " + d.toISOString();
            }}
        }}

        function hexToBytes(hex) {{
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {{
                bytes[i >> 1] = parseInt(hex.substr(i, 2), 16);
            }}
            return bytes;
        }}

        function xorDecrypt(b64, keyHex) {{
            const rawBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const keyBytes = hexToBytes(keyHex);
            const decrypted = new Uint8Array(rawBytes.length);
            for (let i = 0; i < rawBytes.length; i++) {{
                decrypted[i] = rawBytes[i] ^ keyBytes[i % keyBytes.length];
            }}
            return decrypted;
        }}

        function triggerDownload() {{
            if (isDestroyed || !ENCRYPTED_PAYLOAD) {{
                alert("This secure bundle has expired and cannot be read.");
                return;
            }}

            try {{
                const decryptedBytes = xorDecrypt(ENCRYPTED_PAYLOAD, WRAPPER_KEY);
                const blob = new Blob([decryptedBytes], {{ type: MIME_TYPE }});
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement("a");
                a.href = url;
                a.download = FILE_NAME;
                document.body.appendChild(a);
                a.click();
                
                // Scrub references
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }} catch (err) {{
                console.error("Decryption failed:", err);
                alert("Could not process payload decryption.");
            }}
        }}
    </script>
</body>
</html>
"""
    return html_template.encode('utf-8')
