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

    xhr.open("POST", "/upload", true);


    xhr.upload.onprogress = function (e) {

        if (e.lengthComputable) {

            const percent = Math.round(
                (e.loaded / e.total) * 100
            );

            uploadBtn.textContent = percent + "%";

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

            uploadBtn.style.background = "#28a745";


            setTimeout(() => {

                uploadBtn.disabled = false;

                uploadBtn.textContent = "Upload";

                uploadBtn.style.background = "#222";

                fileInput.value = "";

                fileName.textContent = "Select files";

                getFiles();

            }, 1000);

        } else {

            uploadBtn.disabled = false;

            uploadBtn.textContent = "Upload";

            uploadBtn.style.background = "#222";
        }
    };


    xhr.onerror = function () {

        uploadBtn.disabled = false;

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

    lightbox.classList.remove("hidden");
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

let pendingClickTimer = null;

let lastTap = {
    time: 0,
    item: null
};

const DOUBLE_TAP_MS = 320;


galleryContainer.addEventListener("click", (e) => {

    // ------------------------------------------
    // Ignore click generated after long press
    // ------------------------------------------

    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }


    // ------------------------------------------
    // Selection circle
    // ------------------------------------------

    const toggle =
        e.target.closest(".select-toggle");


    if (toggle) {

        e.stopPropagation();

        const item =
            toggle.closest(".gallery-item");


        if (item) {
            toggleSelect(item);
        }

        return;
    }


    // ------------------------------------------
    // Find gallery item
    // ------------------------------------------

    const item =
        e.target.closest(".gallery-item");


    if (!item) {
        return;
    }


    // ==========================================
    // SELECTION MODE
    // ==========================================
    //
    // If ANY file is selected, clicking another
    // file should select it instead of previewing.
    //

    if (selectedFiles.size > 0) {

        // Cancel any pending preview
        if (pendingClickTimer) {

            clearTimeout(
                pendingClickTimer
            );

            pendingClickTimer = null;
        }


        // Reset double-click tracking
        lastTap = {
            time: 0,
            item: null
        };


        // Toggle this file
        const filename =
            item.dataset.filename;


        const isSelected =
            selectedFiles.has(filename);


        setItemSelected(
            item,
            !isSelected
        );


        updateSelectionBar();


        return;
    }


    // ==========================================
    // NORMAL MODE
    // ==========================================

    const now = Date.now();


    const isDouble =
        lastTap.item === item &&
        (now - lastTap.time) < DOUBLE_TAP_MS;


    // ------------------------------------------
    // DOUBLE CLICK
    // ------------------------------------------

    if (isDouble) {

        if (pendingClickTimer) {

            clearTimeout(
                pendingClickTimer
            );

            pendingClickTimer = null;
        }


        lastTap = {
            time: 0,
            item: null
        };


        // Double click = download
        triggerDownload(
            item.dataset.filename
        );


        return;
    }


    // ------------------------------------------
    // FIRST CLICK
    // ------------------------------------------

    lastTap = {
        time: now,
        item
    };


    pendingClickTimer =
        setTimeout(() => {

            pendingClickTimer = null;


            // Safety check:
            // A selection might have started while
            // this click was waiting.
            if (selectedFiles.size > 0) {
                return;
            }


            const type =
                item.dataset.type;


            // ----------------------------------
            // Image / video
            // ----------------------------------

            if (
                type === "image" ||
                type === "video"
            ) {

                openLightbox(
                    item.dataset.filename,
                    type
                );

            }


            // ----------------------------------
            // Generic file
            // ----------------------------------

            else {

                openLightbox(
                    item.dataset.filename,
                    type
                );
            }


        }, DOUBLE_TAP_MS);
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
