const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const galleryContainer = document.getElementById("galleryContainer");
const fileName = document.getElementById("fileName");

const lightbox = document.getElementById("lightbox");
const lightboxMedia = document.getElementById("lightboxMedia");
const lightboxName = document.getElementById("lightboxName");
const lightboxDownload = document.getElementById("lightboxDownload");
const lightboxClose = document.getElementById("lightboxClose");

const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const downloadSelectedBtn = document.getElementById("downloadSelectedBtn");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");

let eventSource = null;

const selectedFiles = new Set();

const IMAGE_EXTS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
    "avif"
];

const VIDEO_EXTS = [
    "mp4",
    "webm",
    "ogg",
    "ogv",
    "mov",
    "mkv",
    "m4v",
    "avi"
];


// --------------------------------------------------
// File helpers
// --------------------------------------------------

function getExt(filename) {
    const parts = filename.split(".");

    return parts.length > 1
        ? parts.pop().toLowerCase()
        : "";
}


function getFileType(filename) {
    const ext = getExt(filename);

    if (IMAGE_EXTS.includes(ext)) {
        return "image";
    }

    if (VIDEO_EXTS.includes(ext)) {
        return "video";
    }

    return "file";
}


function fileUrl(filename) {
    return `/download/${encodeURIComponent(filename)}`;
}


function escapeHtml(str) {
    const div = document.createElement("div");

    div.textContent = str;

    return div.innerHTML;
}


// --------------------------------------------------
// Upload
// --------------------------------------------------

async function uploadFiles() {

    const files = fileInput.files;

    if (!files || files.length === 0) {
        return;
    }

    const fromData = new FormData();

    for (const file of files) {
        fromData.append("file", file);
    }


    uploadBtn.disabled = true;

    uploadBtn.textContent = "0%";

    uploadBtn.style.background = "#222";


    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/upload", true); window.__dropairUploadXhr = xhr;


    xhr.upload.onprogress = function (e) {

        if (e.lengthComputable) {

            const percent = Math.round(
                (e.loaded / e.total) * 100
            );

            uploadBtn.textContent = percent + "%"; setDockUploadProgress(percent);

            uploadBtn.style.background =
                `linear-gradient(
                    90deg,
                    #444 ${percent}%,
                    #222 ${percent}%
                )`;
        }
    };


    xhr.onload = function () {

        if (xhr.status === 200) {

            uploadBtn.textContent = "Done";

            uploadBtn.style.background = "#28a745"; setDockDone();


            setTimeout(() => {

                resetAdaptiveDock(); uploadBtn.disabled = false;

                uploadBtn.textContent = "Upload";

                uploadBtn.style.background = "#222";

                fileInput.value = "";

                fileName.textContent = "Select files";

                getFiles();

            }, 1000);

        } else {

            resetAdaptiveDock(); uploadBtn.disabled = false;

            uploadBtn.textContent = "Upload";

            uploadBtn.style.background = "#222";
        }
    };


    xhr.onerror = function () {

        resetAdaptiveDock(); uploadBtn.disabled = false;

        uploadBtn.textContent = "Upload";

        uploadBtn.style.background = "#222";
    };


    xhr.send(fromData);
}


uploadBtn.addEventListener("click", () => {
    uploadFiles();
});


// --------------------------------------------------
// File input
// --------------------------------------------------

fileInput.addEventListener("change", () => {

    const files = fileInput.files;


    if (files.length > 0) {

        if (files.length === 1) {

            fileName.textContent =
                files[0].name;

        } else {

            fileName.textContent =
                `${files.length} files selected`;
        }

    } else {

        fileName.textContent =
            "Select files";
    }
});


// --------------------------------------------------
// Get files
// --------------------------------------------------

async function getFiles() {

    const response = await fetch("/api/files");

    const files = await response.json();

    renderGallery(files);
}


// --------------------------------------------------
// Render gallery
// --------------------------------------------------

function renderGallery(files) {

    galleryContainer.innerHTML = "";


    // Drop selections for files that no longer exist.
    if (selectedFiles.size > 0) {

        const currentNames =
            new Set(files.map(f => f.filename));


        for (const name of Array.from(selectedFiles)) {

            if (!currentNames.has(name)) {
                selectedFiles.delete(name);
            }
        }
    }


    if (!files || files.length === 0) {

        galleryContainer.innerHTML =
            '<p class="empty-msg">No files yet</p>';

        updateSelectionBar();

        return;
    }


    for (const file of files) {

        const type =
            getFileType(file.filename);

        const url =
            fileUrl(file.filename);

        const isSelected =
            selectedFiles.has(file.filename);


        const item =
            document.createElement("div");

        item.className =
            "gallery-item" +
            (isSelected ? " selected" : "");

        item.dataset.filename =
            file.filename;

        item.dataset.type =
            type;

        item.title =
            file.filename;


        let thumbHtml;


        if (type === "image") {

            thumbHtml = `
                <img
                    src="${url}"
                    alt="${escapeHtml(file.filename)}"
                    loading="lazy"
                    draggable="false"
                >
            `;

        } else if (type === "video") {

            thumbHtml = `
                <video
                    src="${url}#t=0.1"
                    preload="metadata"
                    muted
                    playsinline
                ></video>

                <div class="play-badge">
                    &#9654;
                </div>
            `;

        } else {

            const ext =
                getExt(file.filename) || "file";


            thumbHtml = `
                <div class="file-icon">
                    ${escapeHtml(
                        ext.slice(0, 4).toUpperCase()
                    )}
                </div>
            `;
        }


        item.innerHTML = `
            <div class="thumb">
                ${thumbHtml}
            </div>

            <div
                class="select-toggle"
                role="checkbox"
                aria-checked="${isSelected}"
            ></div>
        `;


        galleryContainer.appendChild(item);
    }


    updateSelectionBar();
}


// --------------------------------------------------
// Download
// --------------------------------------------------

function triggerDownload(filename) {

    const a =
        document.createElement("a");

    a.href =
        fileUrl(filename);

    a.download =
        filename;

    document.body.appendChild(a);

    a.click();

    a.remove();
}


// --------------------------------------------------
// Lightbox
// --------------------------------------------------

function openLightbox(filename, type) {

    const url =
        fileUrl(filename);

    lightboxMedia.innerHTML = "";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            url;

        img.alt =
            filename;

        lightboxMedia.appendChild(img);


    } else if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            url;

        video.controls =
            true;

        video.autoplay =
            true;

        lightboxMedia.appendChild(video);


    } else {

        // Generic file — no inline render.
        const ext =
            getExt(filename) || "file";


        const badge =
            document.createElement("div");

        badge.className =
            "lightbox-file-badge";


        badge.innerHTML = `
            <div class="lightbox-file-ext">
                ${escapeHtml(
                    ext.slice(0, 6).toUpperCase()
                )}
            </div>

            <div class="lightbox-file-name">
                ${escapeHtml(filename)}
            </div>
        `;


        lightboxMedia.appendChild(badge);
    }


    lightboxName.textContent =
        filename;

    lightboxDownload.href =
        url;

    lightboxDownload.download =
        filename;

    window.__dropairPreviewTap = { filename, time: Date.now() }; lightbox.classList.remove("hidden");
}


function closeLightbox() {

    lightbox.classList.add("hidden");

    lightboxMedia.innerHTML = "";
}


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightbox.addEventListener("click", (e) => {

    if (e.target === lightbox) {
        closeLightbox();
    }
});


document.addEventListener("keydown", (e) => {

    if (
        e.key === "Escape" &&
        !lightbox.classList.contains("hidden")
    ) {
        closeLightbox();
    }
});


// --------------------------------------------------
// Multi-select
// --------------------------------------------------

function setItemSelected(item, selected) {

    const filename =
        item.dataset.filename;

    const toggle =
        item.querySelector(".select-toggle");


    if (selected) {

        selectedFiles.add(filename);

        item.classList.add("selected");


        if (toggle) {
            toggle.setAttribute(
                "aria-checked",
                "true"
            );
        }

    } else {

        selectedFiles.delete(filename);

        item.classList.remove("selected");


        if (toggle) {
            toggle.setAttribute(
                "aria-checked",
                "false"
            );
        }
    }
}


// --------------------------------------------------
// Long press + drag selection
// --------------------------------------------------

let dragSelectActive = false;

let dragPaintValue = true;

let dragVisited = new Set();

let longPressTimer = null;

let longPressItem = null;

let longPressTriggered = false;

const LONG_PRESS_MS = 500;


// Start long press
galleryContainer.addEventListener(
    "pointerdown",
    (e) => {

        // Only left mouse button
        if (e.pointerType === "mouse" && e.button !== 0) {
            return;
        }


        const item =
            e.target.closest(".gallery-item");


        if (
            !item ||
            !galleryContainer.contains(item)
        ) {
            return;
        }


        longPressItem =
            item;

        longPressTriggered =
            false;


        // Cancel any old timer
        if (longPressTimer) {

            clearTimeout(
                longPressTimer
            );

            longPressTimer =
                null;
        }


        // Start long press timer
        longPressTimer =
            setTimeout(() => {

                longPressTriggered =
                    true;

                dragSelectActive =
                    true;


                const filename =
                    item.dataset.filename;


                dragVisited =
                    new Set([filename]);


                // If selected -> start unselecting.
                // If not selected -> start selecting.
                dragPaintValue =
                    !selectedFiles.has(filename);


                setItemSelected(
                    item,
                    dragPaintValue
                );


                updateSelectionBar();


            }, LONG_PRESS_MS);
    }
);


// --------------------------------------------------
// Move across thumbnails
// --------------------------------------------------

document.addEventListener(
    "pointermove",
    (e) => {

        if (!dragSelectActive) {
            return;
        }


        const el =
            document.elementFromPoint(
                e.clientX,
                e.clientY
            );


        if (!el) {
            return;
        }


        const item =
            el.closest(".gallery-item");


        if (
            !item ||
            !galleryContainer.contains(item)
        ) {
            return;
        }


        const filename =
            item.dataset.filename;


        // Don't process same item again
        if (dragVisited.has(filename)) {
            return;
        }


        dragVisited.add(filename);


        setItemSelected(
            item,
            dragPaintValue
        );


        updateSelectionBar();
    }
);


// --------------------------------------------------
// End long press
// --------------------------------------------------

function cancelLongPress() {

    if (longPressTimer) {

        clearTimeout(
            longPressTimer
        );

        longPressTimer =
            null;
    }

    longPressItem =
        null;
}


function endDragSelect() {

    cancelLongPress();


    if (!dragSelectActive) {
        return;
    }


    dragSelectActive =
        false;

    dragVisited.clear();

    updateSelectionBar();
}


document.addEventListener(
    "pointerup",
    endDragSelect
);


document.addEventListener(
    "pointercancel",
    endDragSelect
);


// --------------------------------------------------
// Selection bar
// --------------------------------------------------

function updateSelectionBar() {

    if (selectedFiles.size === 0) {

        selectionBar.classList.add(
            "hidden"
        );

        selectionCount.textContent =
            "0 selected";

    } else {

        selectionBar.classList.remove(
            "hidden"
        );

        selectionCount.textContent =
            `${selectedFiles.size} selected`;
    }
}


// --------------------------------------------------
// Toggle single selection
// --------------------------------------------------

function toggleSelect(item) {

    const filename =
        item.dataset.filename;

    const selected =
        selectedFiles.has(filename);


    setItemSelected(
        item,
        !selected
    );


    updateSelectionBar();
}


// --------------------------------------------------
// Clear selection
// --------------------------------------------------

function clearSelection() {

    for (const filename of selectedFiles) {

        const item =
            galleryContainer.querySelector(
                `.gallery-item[data-filename="${cssEscape(filename)}"]`
            );


        if (item) {

            item.classList.remove(
                "selected"
            );


            const toggle =
                item.querySelector(
                    ".select-toggle"
                );


            if (toggle) {

                toggle.setAttribute(
                    "aria-checked",
                    "false"
                );
            }
        }
    }


    selectedFiles.clear();

    updateSelectionBar();
}


function cssEscape(str) {

    if (
        window.CSS &&
        CSS.escape
    ) {
        return CSS.escape(str);
    }


    return str.replace(
        /["\\]/g,
        "\\$&"
    );
}


// --------------------------------------------------
// Download selected
// --------------------------------------------------

downloadSelectedBtn.addEventListener(
    "click",
    () => {

        const names =
            Array.from(selectedFiles);


        names.forEach(
            (filename, i) => {

                setTimeout(
                    () => {
                        triggerDownload(
                            filename
                        );
                    },
                    i * 350
                );
            }
        );


        clearSelection();
    }
);


clearSelectionBtn.addEventListener(
    "click",
    clearSelection
);



// --------------------------------------------------
// Gallery click / double click
// --------------------------------------------------
//
// NO selection:
//   Single click  -> preview
//   Double click  -> download
//
// SELECTION active:
//   Single click  -> select / deselect
//   Double click  -> select / deselect
//
// Long press:
//   Start selection mode
//
// Long press + move:
//   Select multiple files
// --------------------------------------------------

// Single click previews immediately. Double-click downloads natively.
galleryContainer.addEventListener("click", (e) => {
    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }
    const toggle = e.target.closest(".select-toggle");
    if (toggle) {
        e.stopPropagation();
        const item = toggle.closest(".gallery-item");
        if (item) toggleSelect(item);
        return;
    }
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    if (selectedFiles.size > 0) {
        const filename = item.dataset.filename;
        setItemSelected(item, !selectedFiles.has(filename));
        updateSelectionBar();
        return;
    }
    item.classList.add("show-toggle");
    openLightbox(item.dataset.filename, item.dataset.type);
});

galleryContainer.addEventListener("dblclick", (e) => {
    if (e.target.closest(".select-toggle")) return;
    const item = e.target.closest(".gallery-item");
    if (!item || selectedFiles.size > 0) return;
    e.preventDefault();
    triggerDownload(item.dataset.filename);
});
// --------------------------------------------------
// SSE
// --------------------------------------------------

function connectSSE() {

    if (eventSource) {

        eventSource.close();
    }


    eventSource =
        new EventSource(
            "/events"
        );


    eventSource.onmessage =
        function (event) {

            const data =
                JSON.parse(
                    event.data
                );


            if (
                data.type ===
                "file-uploaded"
            ) {

                // Refresh file list
                getFiles();
            }
        };


    eventSource.onerror =
        function () {

            console.log(
                "SSE connection error, reconnecting..."
            );


            eventSource.close();


            setTimeout(
                connectSSE,
                3000
            );
        };
}


function disconnectSSE() {

    if (eventSource) {

        eventSource.close();

        eventSource = null;
    }
}


// --------------------------------------------------
// Initial load
// --------------------------------------------------

getFiles();

connectSSE();


// --------------------------------------------------
// Page visibility
// --------------------------------------------------

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            disconnectSSE();

        } else {

            getFiles();

            connectSSE();
        }
    }
);

// Bottom dock actions
for (const button of document.querySelectorAll("[data-dock-action]")) {
    button.addEventListener("click", () => {
        const action = button.dataset.dockAction;
        if (action === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (action === "gallery") {
            document.querySelector(".section-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (action === "upload") {
            fileInput.click();
        }
    });
}

// The bottom dock is the upload entry point. Upload immediately after choosing files.
fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length > 0) {
        uploadFiles();
    }
});

// Keep one dock in sync with the current app mode.
const adaptiveDock = document.querySelector(".bottom-dock");
const dockStatus = adaptiveDock?.querySelector(".dock-status");
const originalUpdateSelectionBar = updateSelectionBar;
updateSelectionBar = function () {
    originalUpdateSelectionBar();
    if (!adaptiveDock) return;
    if (selectedFiles.size > 0) {
        adaptiveDock.classList.add("is-selecting");
        if (dockStatus) dockStatus.textContent = `${selectedFiles.size} selected`;
    } else {
        adaptiveDock.classList.remove("is-selecting");
        if (!adaptiveDock.classList.contains("is-uploading") && dockStatus) dockStatus.textContent = "";
    }
};
adaptiveDock?.querySelector('[data-dock-action="download"]')?.addEventListener("click", () => downloadSelectedBtn.click());
adaptiveDock?.querySelector('[data-dock-action="cancel"]')?.addEventListener("click", () => {
    if (adaptiveDock.classList.contains("is-uploading") && window.__dropairUploadXhr) {
        window.__dropairUploadXhr.abort();
        resetAdaptiveDock(); uploadBtn.disabled = false;
        fileInput.value = "";
        resetAdaptiveDock();
    } else {
        clearSelection();
    }
});

// Lightweight, opt-in tactile/audio feedback for intentional actions.
let dockAudioContext = null;
function actionFeedback(type = "soft") {
    if (navigator.vibrate) navigator.vibrate(type === "download" ? [8, 24, 10] : type === "done" ? [10, 28, 12] : 6);
    try {
        dockAudioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = dockAudioContext.createOscillator();
        const gain = dockAudioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = type === "download" ? 620 : type === "done" ? 760 : type === "reset" ? 350 : 460;
        gain.gain.setValueAtTime(0.0001, dockAudioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, dockAudioContext.currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, dockAudioContext.currentTime + 0.075);
        oscillator.connect(gain).connect(dockAudioContext.destination);
        oscillator.start();
        oscillator.stop(dockAudioContext.currentTime + 0.08);
    } catch (_) { /* Audio is a progressive enhancement. */ }
}
galleryContainer.addEventListener("click", (e) => {
    if (e.target.closest(".select-toggle")) actionFeedback("select");
});
galleryContainer.addEventListener("dblclick", (e) => {
    if (e.target.closest(".gallery-item") && !e.target.closest(".select-toggle")) actionFeedback("download");
});
adaptiveDock?.querySelector('[data-dock-action="download"]')?.addEventListener("click", () => actionFeedback("download"));

function resetAdaptiveDock() {
    adaptiveDock?.classList.remove("is-uploading", "is-done", "is-selecting");
    adaptiveDock?.style.removeProperty("--upload-progress");
    if (dockStatus) dockStatus.textContent = "";
}
function setDockUploadProgress(percent) {
    adaptiveDock?.classList.remove("is-done", "is-selecting");
    adaptiveDock?.classList.add("is-uploading");
    adaptiveDock?.style.setProperty("--upload-progress", percent + "%");
    if (dockStatus) dockStatus.textContent = percent + "%";
}
function setDockDone() {
    adaptiveDock?.classList.remove("is-uploading", "is-selecting");
    adaptiveDock?.classList.add("is-done");
    adaptiveDock?.style.setProperty("--upload-progress", "100%");
    if (dockStatus) dockStatus.textContent = "Done";
    actionFeedback("done");
    setTimeout(resetAdaptiveDock, 1100);
}
const previousSelectionDockSync = updateSelectionBar;
updateSelectionBar = function () {
    previousSelectionDockSync();
    if (!adaptiveDock) return;
    if (selectedFiles.size > 0) {
        adaptiveDock.classList.remove("is-uploading", "is-done");
        adaptiveDock.classList.add("is-selecting");
        adaptiveDock.style.removeProperty("--upload-progress");
        if (dockStatus) dockStatus.textContent = `${selectedFiles.size} selected`;
    } else if (!adaptiveDock.classList.contains("is-uploading") && !adaptiveDock.classList.contains("is-done")) {
        adaptiveDock.classList.remove("is-selecting");
        if (dockStatus) dockStatus.textContent = "";
    }
};

// Final reset wrapper: one fast spring handoff and one subtle reset cue.
const guardedResetAdaptiveDock = resetAdaptiveDock;
resetAdaptiveDock = function () {
    const wasDone = adaptiveDock?.classList.contains("is-done");
    guardedResetAdaptiveDock();
    if (wasDone) actionFeedback("reset");
};

// Capture double-click before the preview/lightbox click sequence can consume it.
galleryContainer.addEventListener("dblclick", (e) => {
    const toggle = e.target.closest(".select-toggle");
    const item = e.target.closest(".gallery-item");
    if (!item || toggle || selectedFiles.size > 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!lightbox.classList.contains("hidden")) closeLightbox();
    actionFeedback("download");
    triggerDownload(item.dataset.filename);
}, true);

// A preview opens immediately; keep the double-click gesture alive across the lightbox.
lightbox.addEventListener("click", (e) => {
    const tap = window.__dropairPreviewTap;
    if (!tap || Date.now() - tap.time > 430) return;
    if (selectedFiles.size > 0) return;
    e.preventDefault();
    e.stopPropagation();
    window.__dropairPreviewTap = null;
    closeLightbox();
    actionFeedback("download");
    triggerDownload(tap.filename);
}, true);

// Gallery options: sort by available file metadata and switch tile density.
let activeSort = "modified";
const optionsButton = document.getElementById("optionsButton");
const optionsMenu = document.getElementById("optionsMenu");
function sortGalleryFiles(files) {
    return [...files].sort((a, b) => {
        if (activeSort === "size") return (b.size || 0) - (a.size || 0);
        if (activeSort === "name") return a.filename.localeCompare(b.filename);
        return (b.modified || 0) - (a.modified || 0);
    });
}
async function refreshSortedGallery() {
    const response = await fetch("/api/files");
    renderGallery(sortGalleryFiles(await response.json()));
}
optionsButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    optionsMenu?.classList.toggle("open");
    optionsMenu?.setAttribute("aria-hidden", String(!optionsMenu.classList.contains("open")));
});
optionsMenu?.addEventListener("click", (event) => {
    const sortButton = event.target.closest("[data-sort]");
    const layoutButton = event.target.closest("[data-layout]");
    if (sortButton) {
        activeSort = sortButton.dataset.sort;
        optionsMenu.querySelectorAll("[data-sort]").forEach((button) => button.classList.toggle("active", button === sortButton));
        refreshSortedGallery();
    }
    if (layoutButton) {
        galleryContainer.classList.toggle("compact", layoutButton.dataset.layout === "compact");
        optionsMenu.querySelectorAll("[data-layout]").forEach((button) => button.classList.toggle("active", button === layoutButton));
    }
});
document.addEventListener("click", (event) => {
    if (!event.target.closest(".options-menu") && !event.target.closest("#optionsButton")) {
        optionsMenu?.classList.remove("open");
        optionsMenu?.setAttribute("aria-hidden", "true");
    }
});
