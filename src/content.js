// content.js

function injectMiniCSS() {
    if (document.getElementById("ytm-mini-css")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "ytm-mini-css";

    style.innerHTML = `
        @media (max-width: 600px) {
            /* Hide native player bar visually */
            body.ytm-mini-mode ytmusic-player-bar {
                opacity: 0 !important;
                pointer-events: none !important;
            }

            /* Hide cluttered panels in expanded player page */
            body.ytm-mini-mode ytmusic-player-page #side-panel,
            body.ytm-mini-mode ytmusic-player-page .side-panel,
            body.ytm-mini-mode ytmusic-player-page ytmusic-description-shelf-renderer,
            body.ytm-mini-mode ytmusic-player-page ytmusic-mealbar-renderer {
                display: none !important;
            }

            /* Mini-player bar */
            #ytm-mini-bar {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 64px !important;
                background: rgba(20, 20, 20, 0.92) !important;
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                display: flex !important;
                align-items: center !important;
                padding: 0 12px !important;
                gap: 12px !important;
                z-index: 2147483646 !important;
                box-sizing: border-box !important;
            }

            /* Progress bar */
            #ytm-mini-progress {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 2px !important;
                background: rgba(255, 255, 255, 0.15) !important;
                pointer-events: none !important;
            }
            #ytm-mini-progress-fill {
                height: 100% !important;
                background: #ff4444 !important;
                width: 0% !important;
                transition: width 0.5s linear !important;
            }

            /* Thumbnail (album art) */
            .ytm-mini-thumb {
                width: 48px !important;
                height: 48px !important;
                border-radius: 6px !important;
                overflow: hidden !important;
                flex-shrink: 0 !important;
            }
            .ytm-mini-thumb img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                display: block !important;
            }

            /* Song info */
            .ytm-mini-info {
                flex: 1 !important;
                min-width: 0 !important;
                overflow: hidden !important;
            }
            .ytm-mini-title {
                color: #fff !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                line-height: 1.3 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            .ytm-mini-artist {
                color: #aaa !important;
                font-size: 12px !important;
                line-height: 1.3 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }

            /* Transport controls */
            .ytm-mini-controls {
                display: flex !important;
                align-items: center !important;
                gap: 2px !important;
                flex-shrink: 0 !important;
            }
            .ytm-mini-controls button {
                background: none !important;
                border: none !important;
                color: #fff !important;
                width: 36px !important;
                height: 36px !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 16px !important;
                transition: background 0.2s, transform 0.15s !important;
                padding: 0 !important;
                margin: 0 !important;
                outline: none !important;
                line-height: 1 !important;
            }
            .ytm-mini-controls button:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            .ytm-mini-controls button:active {
                transform: scale(0.9) !important;
            }

            #ytm-mini-play {
                font-size: 20px !important;
                width: 40px !important;
                height: 40px !important;
                background: rgba(255, 255, 255, 0.08) !important;
            }
            #ytm-mini-play:hover {
                background: rgba(255, 255, 255, 0.15) !important;
            }

            /* Like / dislike container */
            .ytm-mini-like {
                flex-shrink: 0 !important;
                display: flex !important;
                align-items: center !important;
            }

            /* Native like renderer inside our bar */
            #ytm-mini-bar ytmusic-like-button-renderer {
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
            #ytm-mini-bar ytmusic-like-button-renderer tp-yt-paper-icon-button,
            #ytm-mini-bar ytmusic-like-button-renderer yt-icon,
            #ytm-mini-bar ytmusic-like-button-renderer button {
                color: #ffffff !important;
                opacity: 0.8 !important;
                transition: opacity 0.2s, transform 0.2s !important;
            }
            #ytm-mini-bar ytmusic-like-button-renderer tp-yt-paper-icon-button:hover {
                opacity: 1 !important;
                transform: scale(1.1) !important;
            }
            #ytm-mini-bar ytmusic-like-button-renderer[like-status="LIKE"] #button-shape-like button {
                color: #3ea6ff !important;
                filter: drop-shadow(0 0 5px rgba(62, 166, 255, 0.5)) !important;
            }
            #ytm-mini-bar ytmusic-like-button-renderer[like-status="DISLIKE"] #button-shape-dislike button {
                color: #ff4e4e !important;
                filter: drop-shadow(0 0 5px rgba(255, 78, 78, 0.5)) !important;
            }

            /* Responsive: compact at narrow widths */
            @media (max-width: 480px) {
                #ytm-mini-bar {
                    height: 56px !important;
                    padding: 0 8px !important;
                    gap: 8px !important;
                }
                .ytm-mini-thumb {
                    width: 40px !important;
                    height: 40px !important;
                }
                .ytm-mini-title {
                    font-size: 13px !important;
                }
                .ytm-mini-artist {
                    display: none !important;
                }
                #ytm-mini-prev, #ytm-mini-next {
                    display: none !important;
                }
            }

            @media (max-width: 360px) {
                #ytm-mini-bar {
                    height: 48px !important;
                    padding: 0 6px !important;
                    gap: 6px !important;
                }
                .ytm-mini-thumb {
                    width: 36px !important;
                    height: 36px !important;
                }
                .ytm-mini-title {
                    font-size: 12px !important;
                }
                .ytm-mini-like {
                    display: none !important;
                }
            }
        }
    `;
    document.head.appendChild(style);
}

let originalParent = null;
let originalSibling = null;

function createMiniBarStructure() {
    const bar = document.createElement("div");
    bar.id = "ytm-mini-bar";

    const progress = document.createElement("div");
    progress.id = "ytm-mini-progress";
    const progressFill = document.createElement("div");
    progressFill.id = "ytm-mini-progress-fill";
    progress.appendChild(progressFill);
    bar.appendChild(progress);

    const thumb = document.createElement("div");
    thumb.className = "ytm-mini-thumb";
    bar.appendChild(thumb);

    const info = document.createElement("div");
    info.className = "ytm-mini-info";
    const title = document.createElement("div");
    title.className = "ytm-mini-title";
    const artist = document.createElement("div");
    artist.className = "ytm-mini-artist";
    info.appendChild(title);
    info.appendChild(artist);
    bar.appendChild(info);

    const controls = document.createElement("div");
    controls.className = "ytm-mini-controls";
    controls.innerHTML =
        '<button id="ytm-mini-prev" title="Previous">\u23ee</button>' +
        '<button id="ytm-mini-play" title="Play">\u25b6</button>' +
        '<button id="ytm-mini-next" title="Next">\u23ed</button>';
    bar.appendChild(controls);

    const likeContainer = document.createElement("div");
    likeContainer.className = "ytm-mini-like";
    bar.appendChild(likeContainer);

    return bar;
}

function updateMiniPlayerBar(bar) {
    const nativeThumb = document.querySelector("ytmusic-player-bar ytmusic-thumbnail-renderer img");
    const thumbImg = bar.querySelector(".ytm-mini-thumb img");
    if (nativeThumb && (!thumbImg || thumbImg.getAttribute("src") !== nativeThumb.getAttribute("src"))) {
        const thumbEl = bar.querySelector(".ytm-mini-thumb");
        thumbEl.innerHTML = "";
        thumbEl.appendChild(nativeThumb.cloneNode(true));
    }

    const nativeTitle = document.querySelector("ytmusic-player-bar .title");
    const titleEl = bar.querySelector(".ytm-mini-title");
    if (nativeTitle && titleEl.textContent !== nativeTitle.textContent) {
        titleEl.textContent = nativeTitle.textContent;
    }

    const nativeArtist = document.querySelector("ytmusic-player-bar .byline");
    const artistEl = bar.querySelector(".ytm-mini-artist");
    if (nativeArtist && artistEl.textContent !== nativeArtist.textContent) {
        artistEl.textContent = nativeArtist.textContent;
    }

    const playBtn = document.getElementById("ytm-mini-play");
    const video = document.querySelector("video");
    if (playBtn) {
        const isPaused = video ? video.paused : true;
        playBtn.textContent = isPaused ? "\u25b6" : "\u23f8";
        playBtn.title = isPaused ? "Play" : "Pause";
    }

    const fill = document.getElementById("ytm-mini-progress-fill");
    if (video && fill) {
        const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
        fill.style.width = pct + "%";
    }

    const likeContainer = bar.querySelector(".ytm-mini-like");
    if (likeContainer && !likeContainer.querySelector("ytmusic-like-button-renderer")) {
        const renderers = document.querySelectorAll("ytmusic-like-button-renderer");
        let primary = null;
        for (const r of renderers) {
            if (!bar.contains(r)) {
                primary = r;
                break;
            }
        }
        if (primary) {
            originalParent = primary.parentElement;
            originalSibling = primary.nextSibling;
            likeContainer.appendChild(primary);
        }
    }
}

function manageMiniPlayerBar() {
    if (window.innerWidth > 600) {
        const bar = document.getElementById("ytm-mini-bar");
        if (bar) {
            const renderer = bar.querySelector("ytmusic-like-button-renderer");
            if (renderer && originalParent) {
                if (originalSibling && originalSibling.parentNode === originalParent) {
                    originalParent.insertBefore(renderer, originalSibling);
                } else {
                    originalParent.appendChild(renderer);
                }
            }
            bar.remove();
        }
        return;
    }

    let bar = document.getElementById("ytm-mini-bar");
    if (!bar) {
        bar = createMiniBarStructure();
        document.body.appendChild(bar);

        document.getElementById("ytm-mini-prev").addEventListener("click", function () {
            const btn = document.querySelector("ytmusic-player-bar #previous-button");
            if (btn) btn.click();
        });
        document.getElementById("ytm-mini-play").addEventListener("click", function () {
            const btn = document.querySelector(
                "ytmusic-player-bar #play-button, ytmusic-player-bar #pause-button, ytmusic-player-bar #play-pause-button"
            );
            if (btn) btn.click();
        });
        document.getElementById("ytm-mini-next").addEventListener("click", function () {
            const btn = document.querySelector("ytmusic-player-bar #next-button");
            if (btn) btn.click();
        });
    }

    updateMiniPlayerBar(bar);
}

function watchPlayerState() {
    if (window.innerWidth > 600) {
        document.body.classList.remove("ytm-mini-safe");
        document.body.classList.remove("ytm-mini-mode");
        return;
    }

    document.body.classList.add("ytm-mini-mode");

    const playerPage = document.querySelector("ytmusic-player-page");
    const isExpanded =
        playerPage && window.getComputedStyle(playerPage).display !== "none" && playerPage.offsetHeight > 100;

    if (isExpanded) {
        document.body.classList.remove("ytm-mini-safe");
    } else {
        document.body.classList.add("ytm-mini-safe");
    }
}

function createNavButtons() {
    if (document.getElementById("ytm-mini-btn")) {
        return;
    }

    const navBarRight = document.querySelector("ytmusic-nav-bar .right-content");
    if (!navBarRight) {
        return;
    }

    // --- MAIN BUTTON ---
    const mainBtn = document.createElement("button");
    mainBtn.id = "ytm-mini-btn";
    mainBtn.title = "Toggle Mini Player (Pop Out/In)";

    const iconImg = document.createElement("img");
    iconImg.src = browser.runtime.getURL("icons/icon-48.png");
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

    mainBtn.onmouseover = () => (mainBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)");
    mainBtn.onmouseout = () => (mainBtn.style.backgroundColor = "transparent");

    mainBtn.addEventListener("click", (e) => {
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
        const messenger = typeof browser !== "undefined" ? browser : chrome;

        try {
            messenger.runtime.sendMessage({ action: "toggle_mini" }).catch((err) => {
                console.error("YTM Mini: Failed to send message.", err);
            });
        } catch (err) {
            console.error("YTM Mini: Runtime error during message send.", err);
        }
    });

    // --- SUPPORT BUTTON ---
    const supportBtn = document.createElement("a");
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

    supportBtn.onmouseover = () => (supportBtn.style.backgroundColor = "#4f4f4f");
    supportBtn.onmouseout = () => (supportBtn.style.backgroundColor = "#333333");

    navBarRight.prepend(supportBtn);
    navBarRight.prepend(mainBtn);

    injectMiniCSS();
}

// Run checks to keep everything synced
setInterval(() => {
    createNavButtons();
    watchPlayerState();
    manageMiniPlayerBar();
}, 500);
