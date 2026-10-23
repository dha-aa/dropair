const fileInput = document.getElementById("fileInput");
const galleryContainer = document.getElementById("galleryContainer");

const lightbox = document.getElementById("lightbox");
const lightboxMedia = document.getElementById("lightboxMedia");
const lightboxName = document.getElementById("lightboxName");
const lightboxDownload = document.getElementById("lightboxDownload");
const lightboxClose = document.getElementById("lightboxClose");

const dock = document.getElementById("dock");
const dockStatus = dock.querySelector(".dock-status");

const optionsButton = document.getElementById("optionsButton");
const optionsMenu = document.getElementById("optionsMenu");

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "ogg", "ogv", "mov", "mkv", "m4v", "avi"]);

const LONG_PRESS_MS = 500;
const DOUBLE_TAP_MS = 430;

const selectedFiles = new Set();
let activeSort = "modified";
let eventSource = null;


// --------------------------------------------------
// File helpers
// --------------------------------------------------

function getExt(filename) {
    const dot = filename.lastIndexOf(".");
    return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function getFileType(filename) {
    const ext = getExt(filename);
    if (IMAGE_EXTS.has(ext)) return "image";
    if (VIDEO_EXTS.has(ext)) return "video";
    return "file";
}

function fileUrl(filename) {
    return `/download/${encodeURIComponent(filename)}`;
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

function sortFiles(files) {
    return files.sort((a, b) => {
        if (activeSort === "size") return (b.size || 0) - (a.size || 0);
        if (activeSort === "name") return a.filename.localeCompare(b.filename);
        return (b.modified || 0) - (a.modified || 0);
    });
}


// --------------------------------------------------
// Get files
// --------------------------------------------------
//
// Coalesces bursts of refresh requests (SSE events, tab focus, sort
// changes) into at most one request in flight plus one queued.

let filesRequest = null;
let filesRefreshQueued = false;

function getFiles() {
    if (filesRequest) {
        filesRefreshQueued = true;
        return filesRequest;
    }

    filesRequest = fetch("/api/files")
        .then((response) => response.json())
        .then((files) => renderGallery(sortFiles(files)))
        .catch((err) => console.warn("Could not load files", err))
        .finally(() => {
            filesRequest = null;
            if (filesRefreshQueued) {
                filesRefreshQueued = false;
                getFiles();
            }
        });

    return filesRequest;
}


// --------------------------------------------------
// Lazy video thumbnails
// --------------------------------------------------
//
// Videos only start fetching metadata once they scroll near the
// viewport, so a gallery full of videos doesn't exhaust the browser's
// per-host connection limit and stall uploads / downloads.

function loadVideo(video) {
    video.preload = "metadata";
    video.src = video.dataset.src;
}

const videoObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            loadVideo(entry.target);
            videoObserver.unobserve(entry.target);
        }
    }, { rootMargin: "200px" })
    : null;


// --------------------------------------------------
// Render gallery
// --------------------------------------------------

function createGalleryItem(file) {
    const type = getFileType(file.filename);
    const url = fileUrl(file.filename);

    const item = document.createElement("div");
    item.className = "gallery-item";
    item.dataset.filename = file.filename;
    item.dataset.type = type;
    item.dataset.version = `${file.size}:${file.modified}`;
    item.title = file.filename;

    let thumbHtml;

    if (type === "image") {
        thumbHtml = `<img src="${url}" alt="${escapeHtml(file.filename)}" loading="lazy" decoding="async" fetchpriority="low" draggable="false">`;
    } else if (type === "video") {
        thumbHtml = `<video data-src="${url}#t=0.1" preload="none" muted playsinline></video><div class="play-badge">&#9654;</div>`;
    } else {
        thumbHtml = `<div class="file-icon">${escapeHtml((getExt(file.filename) || "file").slice(0, 4).toUpperCase())}</div>`;
    }

    item.innerHTML = `<div class="thumb">${thumbHtml}</div><div class="select-toggle" role="checkbox" aria-checked="false"></div>`;

    const video = item.querySelector("video");
    if (video) videoObserver ? videoObserver.observe(video) : loadVideo(video);

    return item;
}

// Reuses existing tiles (and their already-loaded thumbnails) instead of
// rebuilding the whole gallery, so a refresh only fetches new files.
function renderGallery(files) {
    const currentNames = new Set(files.map((f) => f.filename));

    // Drop selections for files that no longer exist.
    for (const name of selectedFiles) {
        if (!currentNames.has(name)) selectedFiles.delete(name);
    }

    if (files.length === 0) {
        galleryContainer.innerHTML = '<p class="empty-msg">No files yet</p>';
        syncDock();
        return;
    }

    galleryContainer.querySelector(".empty-msg")?.remove();

    const existing = new Map();
    for (const el of galleryContainer.querySelectorAll(".gallery-item")) {
        existing.set(el.dataset.filename, el);
    }

    files.forEach((file, i) => {
        let item = existing.get(file.filename);
        existing.delete(file.filename);

        // A re-upload with the same name changes size/mtime: rebuild that tile.
        if (!item || item.dataset.version !== `${file.size}:${file.modified}`) {
            const fresh = createGalleryItem(file);
            if (item) item.replaceWith(fresh);
            item = fresh;
        }

        setItemSelected(item, selectedFiles.has(file.filename));

        // Only move nodes that are out of order.
        if (galleryContainer.children[i] !== item) {
            galleryContainer.insertBefore(item, galleryContainer.children[i] || null);
        }
    });

    for (const el of existing.values()) el.remove();

    syncDock();
}


// --------------------------------------------------
// Upload
// --------------------------------------------------

function uploadFiles(files) {
    const formData = new FormData();
    for (const file of files) formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    let lastPercent = -1;

    xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const percent = Math.round((e.loaded / e.total) * 100);
        if (percent === lastPercent) return;
        lastPercent = percent;
        setDockUploadProgress(percent);
    };

    xhr.onload = () => {
        fileInput.value = "";

        if (xhr.status !== 200) {
            resetDock();
            return;
        }

        setDockDone();

        // The server broadcasts an SSE event after every upload; only refresh
        // ourselves when that channel isn't open.
        if (!eventSource || eventSource.readyState !== EventSource.OPEN) getFiles();
    };

    xhr.onerror = () => {
        fileInput.value = "";
        resetDock();
    };

    setDockUploadProgress(0);
    xhr.send(formData);
}

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) uploadFiles(fileInput.files);
});


// --------------------------------------------------
// Download
// --------------------------------------------------

function triggerDownload(filename) {
    const a = document.createElement("a");
    a.href = fileUrl(filename);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function downloadSelected() {
    // Staggered so browsers don't drop or block back-to-back downloads.
    Array.from(selectedFiles).forEach((filename, i) => {
        setTimeout(() => triggerDownload(filename), i * 350);
    });
    clearSelection();
}


// --------------------------------------------------
// Lightbox
// --------------------------------------------------

// Lets a second tap on the just-opened preview act as a double-click download.
let previewTap = null;

function openLightbox(filename, type) {
    const url = fileUrl(filename);
    lightboxMedia.replaceChildren();

    if (type === "image") {
        const img = document.createElement("img");
        img.src = url;
        img.alt = filename;
        lightboxMedia.appendChild(img);
    } else if (type === "video") {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        lightboxMedia.appendChild(video);
    } else {
        // Generic file: no inline render.
        const badge = document.createElement("div");
        badge.className = "lightbox-file-badge";
        badge.innerHTML = `<div class="lightbox-file-ext">${escapeHtml((getExt(filename) || "file").slice(0, 6).toUpperCase())}</div><div class="lightbox-file-name">${escapeHtml(filename)}</div>`;
        lightboxMedia.appendChild(badge);
    }

    lightboxName.textContent = filename;
    lightboxDownload.href = url;
    lightboxDownload.download = filename;

    previewTap = { filename, time: Date.now() };
    lightbox.classList.remove("hidden");
}

function closeLightbox() {
    lightbox.classList.add("hidden");
    // Clearing the media stops any playing video and frees its connection.
    lightboxMedia.replaceChildren();
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (e) => {
    if (previewTap && selectedFiles.size === 0 && Date.now() - previewTap.time <= DOUBLE_TAP_MS) {
        e.preventDefault();
        e.stopPropagation();
        const { filename } = previewTap;
        previewTap = null;
        closeLightbox();
        actionFeedback("download");
        triggerDownload(filename);
        return;
    }

    if (e.target === lightbox) closeLightbox();
}, true);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.classList.contains("hidden")) closeLightbox();
});


// --------------------------------------------------
// Selection
// --------------------------------------------------

function setItemSelected(item, selected) {
    if (selected) selectedFiles.add(item.dataset.filename);
    else selectedFiles.delete(item.dataset.filename);

    item.classList.toggle("selected", selected);
    item.lastElementChild.setAttribute("aria-checked", String(selected));
}

function toggleSelect(item) {
    setItemSelected(item, !selectedFiles.has(item.dataset.filename));
    syncDock();
}

function clearSelection() {
    for (const item of galleryContainer.querySelectorAll(".gallery-item.selected")) {
        setItemSelected(item, false);
    }
    selectedFiles.clear();
    syncDock();
}


// --------------------------------------------------
// Long press + drag selection
// --------------------------------------------------

let dragSelectActive = false;
let dragPaintValue = true;
let dragVisited = new Set();
let longPressTimer = null;
let longPressTriggered = false;

galleryContainer.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const item = e.target.closest(".gallery-item");
    if (!item) return;

    longPressTriggered = false;
    clearTimeout(longPressTimer);

    longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        dragSelectActive = true;

        const filename = item.dataset.filename;
        dragVisited = new Set([filename]);

        // If selected -> start unselecting. If not selected -> start selecting.
        dragPaintValue = !selectedFiles.has(filename);
        setItemSelected(item, dragPaintValue);
        syncDock();
    }, LONG_PRESS_MS);
});

document.addEventListener("pointermove", (e) => {
    if (!dragSelectActive) return;

    const item = document.elementFromPoint(e.clientX, e.clientY)?.closest(".gallery-item");
    if (!item || !galleryContainer.contains(item) || dragVisited.has(item.dataset.filename)) return;

    dragVisited.add(item.dataset.filename);
    setItemSelected(item, dragPaintValue);
    syncDock();
});

function endDragSelect() {
    clearTimeout(longPressTimer);
    longPressTimer = null;

    if (!dragSelectActive) return;

    dragSelectActive = false;
    dragVisited.clear();
    syncDock();
}

document.addEventListener("pointerup", endDragSelect);
document.addEventListener("pointercancel", endDragSelect);


// --------------------------------------------------
// Gallery click / double click
// --------------------------------------------------
//
// NO selection:      click -> preview, double click -> download
// SELECTION active:  click -> select / deselect
// Long press (+ move): start selection / select multiple

galleryContainer.addEventListener("click", (e) => {
    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }

    const toggle = e.target.closest(".select-toggle");
    if (toggle) {
        e.stopPropagation();
        actionFeedback("select");
        toggleSelect(toggle.parentElement);
        return;
    }

    const item = e.target.closest(".gallery-item");
    if (!item) return;

    if (selectedFiles.size > 0) {
        toggleSelect(item);
        return;
    }

    openLightbox(item.dataset.filename, item.dataset.type);
});

galleryContainer.addEventListener("dblclick", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item || e.target.closest(".select-toggle") || selectedFiles.size > 0) return;

    e.preventDefault();
    if (!lightbox.classList.contains("hidden")) closeLightbox();
    actionFeedback("download");
    triggerDownload(item.dataset.filename);
});


// --------------------------------------------------
// Bottom dock
// --------------------------------------------------
//
// One dock that is either navigation, upload progress or selection actions.

let dockResetTimer = null;

function syncDock() {
    if (selectedFiles.size > 0) {
        dock.classList.remove("is-uploading", "is-done");
        dock.classList.add("is-selecting");
        dock.style.removeProperty("--upload-progress");
        dockStatus.textContent = `${selectedFiles.size} selected`;
        return;
    }

    dock.classList.remove("is-selecting");
    if (!dock.classList.contains("is-uploading") && !dock.classList.contains("is-done")) {
        dockStatus.textContent = "";
    }
}

function resetDock() {
    clearTimeout(dockResetTimer);
    const wasDone = dock.classList.contains("is-done");

    dock.classList.remove("is-uploading", "is-done", "is-selecting");
    dock.style.removeProperty("--upload-progress");
    dockStatus.textContent = "";

    if (wasDone) actionFeedback("reset");
    syncDock();
}

function setDockUploadProgress(percent) {
    dock.classList.remove("is-done", "is-selecting");
    dock.classList.add("is-uploading");
    dock.style.setProperty("--upload-progress", percent + "%");
    dockStatus.textContent = percent + "%";
}

function setDockDone() {
    dock.classList.remove("is-uploading", "is-selecting");
    dock.classList.add("is-done");
    dock.style.setProperty("--upload-progress", "100%");
    dockStatus.textContent = "Done";
    actionFeedback("done");

    clearTimeout(dockResetTimer);
    dockResetTimer = setTimeout(resetDock, 1100);
}

dock.addEventListener("click", (e) => {
    const action = e.target.closest("[data-dock-action]")?.dataset.dockAction;

    if (action === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "gallery") {
        document.querySelector(".section-heading").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (action === "upload") {
        fileInput.click();
    } else if (action === "cancel") {
        clearSelection();
    } else if (action === "download") {
        actionFeedback("download");
        downloadSelected();
    }
});


// --------------------------------------------------
// Tactile / audio feedback
// --------------------------------------------------

const FEEDBACK_TONES = { download: 620, done: 760, reset: 350, select: 460 };
let audioContext = null;

function actionFeedback(type) {
    if (navigator.vibrate) navigator.vibrate(type === "download" ? [8, 24, 10] : type === "done" ? [10, 28, 12] : 6);

    try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = FEEDBACK_TONES[type] || 460;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(now + 0.08);
    } catch (_) { /* Audio is a progressive enhancement. */ }
}


// --------------------------------------------------
// Gallery options: sort and tile density
// --------------------------------------------------

function setOptionsMenuOpen(open) {
    optionsMenu.classList.toggle("open", open);
    optionsMenu.setAttribute("aria-hidden", String(!open));
}

optionsButton.addEventListener("click", (e) => {
    e.stopPropagation();
    setOptionsMenuOpen(!optionsMenu.classList.contains("open"));
});

optionsMenu.addEventListener("click", (e) => {
    const sortButton = e.target.closest("[data-sort]");
    const layoutButton = e.target.closest("[data-layout]");

    if (sortButton) {
        activeSort = sortButton.dataset.sort;
        optionsMenu.querySelectorAll("[data-sort]").forEach((b) => b.classList.toggle("active", b === sortButton));
        getFiles();
    }

    if (layoutButton) {
        galleryContainer.classList.toggle("compact", layoutButton.dataset.layout === "compact");
        optionsMenu.querySelectorAll("[data-layout]").forEach((b) => b.classList.toggle("active", b === layoutButton));
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".options-menu") && !e.target.closest("#optionsButton")) setOptionsMenuOpen(false);
});


// --------------------------------------------------
// SSE
// --------------------------------------------------

function connectSSE() {
    disconnectSSE();

    eventSource = new EventSource("/events");

    eventSource.onmessage = (event) => {
        if (JSON.parse(event.data).type === "file-uploaded") getFiles();
    };

    eventSource.onerror = () => {
        disconnectSSE();
        setTimeout(() => { if (!document.hidden && !eventSource) connectSSE(); }, 3000);
    };
}

function disconnectSSE() {
    if (!eventSource) return;
    eventSource.close();
    eventSource = null;
}

// Drop the connection while the tab is hidden; catch up when it returns.
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        disconnectSSE();
    } else {
        getFiles();
        connectSSE();
    }
});


// --------------------------------------------------
// Initial load
// --------------------------------------------------

getFiles();
connectSSE();
