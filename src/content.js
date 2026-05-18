// content.js

function injectMiniCSS() {
    if (document.getElementById('ytm-mini-css')) return;

    const style = document.createElement('style');
    style.id = 'ytm-mini-css';
    
    style.innerHTML = `
        @media (max-width: 600px) {
            /* 1. Hide the default middle controls container to make room */
            body.ytm-mini-mode ytmusic-player-bar .middle-controls-buttons {
                display: block !important;
                position: absolute !important;
                width: 0 !important;
                height: 0 !important;
                visibility: hidden !important;
                overflow: hidden !important;
            }

            /* 2. Style the PILL CONTAINER - Movable & Premium */
            #ytm-pill-container {
    display: flex !important;
    visibility: visible !important;
    position: fixed !important;
    bottom: 85px;
    left: 50%;
    transform: translateX(-50%);
    
    background: rgba(20, 20, 20, 0.6) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;

    padding: 6px 12px !important;
    border-radius: 999px !important;

    border: 1px solid rgba(255,255,255,0.12) !important;
    box-shadow: 0 10px 35px rgba(0,0,0,0.6) !important;

    z-index: 2147483647 !important;

    transition: all 0.25s ease;
    align-items: center !important;
    justify-content: center !important;

    cursor: grab !important;
    user-select: none !important;

    animation: ytmFloatIn 0.35s ease;
}

            #ytm-pill-container:active {
                cursor: grabbing !important;
                transform: translateX(-50%) scale(0.98);
            }

            #ytm-pill-container:hover {
                background: rgba(30, 30, 30, 0.9) !important;
                border: 1px solid rgba(255, 255, 255, 0.25) !important;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7) !important;
                transform: translateX(-50%) scale(1.03);
            }

            /* 3. Native renderer overrides */
            body.ytm-mini-mode ytmusic-like-button-renderer {
                display: flex !important;
                visibility: visible !important;
                background: transparent !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                gap: 2px !important;
                pointer-events: auto !important;
            }

            /* Force buttons to be visible and white */
            body.ytm-mini-mode ytmusic-like-button-renderer tp-yt-paper-icon-button,
            body.ytm-mini-mode ytmusic-like-button-renderer yt-icon,
            body.ytm-mini-mode ytmusic-like-button-renderer button {
                color: #ffffff !important;
                opacity: 0.8 !important;
                transition: opacity 0.2s, transform 0.2s !important;
            }

            body.ytm-mini-mode ytmusic-like-button-renderer tp-yt-paper-icon-button:hover {
                opacity: 1 !important;
                transform: scale(1.2) rotate(-2deg);
            }
            #ytm-pill-container:active {
                transform: translateX(-50%) scale(0.97);
                transition: transform 0.1s ease;
            }

            /* Active state colors */
            body.ytm-mini-mode ytmusic-like-button-renderer[like-status="LIKE"] #button-shape-like button {
                color: #3ea6ff !important;
                filter: drop-shadow(0 0 5px rgba(62, 166, 255, 0.5)) !important;
            }
            body.ytm-mini-mode ytmusic-like-button-renderer[like-status="DISLIKE"] #button-shape-dislike button {
                color: #ff4e4e !important;
                filter: drop-shadow(0 0 5px rgba(255, 78, 78, 0.5)) !important;
            }
        }
        @keyframes ytmFloatIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(15px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(1);
            }
        }
        #ytm-pill-container::before {
            content: "";
            position: absolute;
            inset: -2px;
            border-radius: 999px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #ytm-pill-container:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Drag and drop implementation
let isDragging = false;
let startX, startY, initialX, initialY;

function initDraggable(el) {
    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart, { passive: false });

    function dragStart(e) {
        if (e.target.closest('button')) return; // Don't drag if clicking buttons
        
        isDragging = true;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = el.getBoundingClientRect();
        initialX = rect.left + rect.width / 2;
        initialY = rect.top + rect.height / 2;

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        el.style.transition = 'none';
    }

    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        el.style.left = `${initialX + dx}px`;
        el.style.top = `${initialY + dy}px`;
        el.style.bottom = 'auto'; // Disable bottom constraint
    }

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        el.style.transition = 'background 0.3s, border 0.3s, box-shadow 0.3s';
    }
}

function managePillBar() {
    if (window.innerWidth > 600) {
        const container = document.getElementById('ytm-pill-container');
        if (container) container.style.display = 'none';
        return;
        container.style.backdropFilter = "blur(20px) saturate(180%)";
        container.style.webkitBackdropFilter = "blur(20px) saturate(180%)";
    }

    let container = document.getElementById('ytm-pill-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ytm-pill-container';
        document.body.appendChild(container);
        initDraggable(container);
    }
    container.style.display = 'flex';

    // Move the native renderer into our container if it's not already there
    // Use a more specific selector to avoid duplicates or finding the wrong one
    const nativeRenderers = document.querySelectorAll('ytmusic-like-button-renderer');
    
    // We only want ONE renderer in the pill
    if (nativeRenderers.length > 0) {
        const primaryRenderer = nativeRenderers[0];
        if (primaryRenderer.parentElement !== container) {
            // Clean container to avoid duplicates shown in user screenshot
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(primaryRenderer);
        }
    }
}

function watchPlayerState() {
    if (window.innerWidth > 600) {
        document.body.classList.remove('ytm-mini-safe');
        document.body.classList.remove('ytm-mini-mode');
        return;
    }

    document.body.classList.add('ytm-mini-mode');

    const playerPage = document.querySelector('ytmusic-player-page');
    const isExpanded = playerPage && window.getComputedStyle(playerPage).display !== 'none' && playerPage.offsetHeight > 100;

    if (isExpanded) {
        document.body.classList.remove('ytm-mini-safe');
    } else {
        document.body.classList.add('ytm-mini-safe');
    }
}

function createNavButtons() {
    if (document.getElementById('ytm-mini-btn')) return;

    const navBarRight = document.querySelector('ytmusic-nav-bar .right-content');
    if (!navBarRight) return;

    // --- MAIN BUTTON ---
    const mainBtn = document.createElement('button');
    mainBtn.id = "ytm-mini-btn";
    mainBtn.title = "Toggle Mini Player (Pop Out/In)";
    
    const iconImg = document.createElement('img');
    iconImg.src = browser.runtime.getURL('icons/icon-48.png');
    iconImg.style.cssText = "width: 32px; height: 32px; display: block;";
    
    mainBtn.appendChild(iconImg);

    mainBtn.style.cssText = `
        background-color: transparent;
        border: none;
        padding: 6px;
        margin-right: 4px;
        border-radius: 50%;
        cursor: pointer;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    `;

    mainBtn.onmouseover = () => mainBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    mainBtn.onmouseout = () => mainBtn.style.backgroundColor = "transparent";

    mainBtn.addEventListener('click', (e) => {
        // Prevent event from bubbling up to YTM's own listeners
        e.preventDefault();
        e.stopPropagation();

        // Visual feedback
        mainBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        mainBtn.style.transform = "scale(0.9)";
        
        setTimeout(() => {
            mainBtn.style.transform = "scale(1)";
            mainBtn.style.backgroundColor = "transparent";
        }, 150);

        console.log("YTM Mini: Toggle button clicked");

        // Use fallback-safe messenger
        const messenger = (typeof browser !== 'undefined') ? browser : chrome;
        
        try {
            messenger.runtime.sendMessage({ action: "toggle_mini" }).catch(err => {
                console.error("YTM Mini: Failed to send message.", err);
            });
        } catch (err) {
            console.error("YTM Mini: Runtime error during message send.", err);
        }
    });

    // --- SUPPORT BUTTON ---
    const supportBtn = document.createElement('a');
    supportBtn.href = "https://www.buymeacoffee.com/kakeroth"; 
    supportBtn.target = "_blank";
    supportBtn.innerText = "☕"; 
    supportBtn.title = "Support development";
    
    supportBtn.style.cssText = `
        background-color: #333333;
        color: white;
        text-decoration: none;
        border: 1px solid #555555; 
        padding: 8px 16px;
        margin-right: 12px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        vertical-align: middle;
        display: inline-block;
        transition: background-color 0.2s;
    `;
    
    supportBtn.onmouseover = () => supportBtn.style.backgroundColor = "#4f4f4f";
    supportBtn.onmouseout = () => supportBtn.style.backgroundColor = "#333333";

    navBarRight.prepend(supportBtn); 
    navBarRight.prepend(mainBtn);    
    
    injectMiniCSS();
}

// Run checks to keep everything synced
setInterval(() => {
    createNavButtons();
    watchPlayerState();
    managePillBar();
}, 500);