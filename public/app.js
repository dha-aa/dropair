const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const downloadContainer = document.getElementById("downloadContainer");

let lastFilesSnapshot = "";

async function getDownlaods() {
    const response = await fetch("/api/files");
    const files = await response.json();

    const snapshot = JSON.stringify(files);
    if (snapshot === lastFilesSnapshot) return;
    lastFilesSnapshot = snapshot;

    downloadContainer.innerHTML = "";

    files.forEach((file) => {
        if (file.type === "file") {
            const item = document.createElement("div");
            item.innerHTML = `
            <span>${file.filename}</span>
            <a href="/download/${encodeURIComponent(file.filename)}">
                    Download
                </a>`;

            downloadContainer.appendChild(item);
        }
    });
}
getDownlaods();

// ===== Instant updates via SSE =====
let eventSource;

function connectStream() {
    eventSource = new EventSource("/api/files/stream");

    eventSource.onmessage = () => {
        getDownlaods(); // a file changed somewhere — refresh instantly
    };

    eventSource.onerror = () => {
        // Connection dropped (server restart, network blip, phone backgrounded, etc.)
        // Browser auto-retries by default, but we force a clean reconnect + catch-up fetch
        eventSource.close();
        setTimeout(() => {
            getDownlaods();
            connectStream();
        }, 2000);
    };
}
connectStream();

// Also refresh immediately when the tab regains focus/visibility,
// in case the connection silently dropped while backgrounded
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        getDownlaods();
    }
});

function uploadOneFile(file, onProgress) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                onProgress(e.loaded / e.total);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log("file uploaded!");
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload error")));

        xhr.send(formData);
    });
}

async function fileUpload() {
    const files = fileInput.files;
    if (!files.length) return;

    uploadButton.disabled = true;
    uploadButton.classList.remove("is-complete");
    uploadButton.style.setProperty("--progress", "0%");

    const total = files.length;

    for (let i = 0; i < total; i++) {
        const file = files[i];
        try {
            await uploadOneFile(file, (fraction) => {
                const overall = ((i + fraction) / total) * 100;
                uploadButton.innerText = `${Math.trunc(overall)}%`
                uploadButton.style.setProperty("--progress", `${overall}%`);
            });
        } catch (error) {
            console.log(error);
        }
    }

    uploadButton.style.setProperty("--progress", "100%");
    uploadButton.classList.add("is-complete");

    setTimeout(() => {
        uploadButton.classList.remove("is-complete");
        uploadButton.style.setProperty("--progress", "0%");
        uploadButton.innerText = "Upload"
    }, 900);

    fileInput.value = "";
    uploadButton.disabled = false;
    
    // no need to call getDownlaods() here anymore —
    // notifyClients() on the server will push it to us instantly,
    // including this same tab
}

uploadButton.addEventListener("click", fileUpload);