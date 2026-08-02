const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const downloadContainer = document.getElementById("downloadContainer");


async function getDownlaods() {
    downloadContainer.innerHTML = "";
    const response = await fetch("/api/files");
    const files = await response.json();

    files.forEach((file) => {
        if(file.type === "file") {
            const item = document.createElement("div");
            item.innerHTML = `
            <span>${file.filename}</span>
            <a href="/download/${encodeURIComponent(file.filename)}">
                    Download
                </a>`
            
            downloadContainer.appendChild(item);
        }
    })
    
}
getDownlaods();

// Uploads one file via XHR so we get real upload-progress events,
// and reports progress back as a fraction (0–1) of that single file.
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
                // Overall progress = completed files + current file's fraction, out of total
                const overall = ((i + fraction) / total) * 100;
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
    }, 900);

    fileInput.value = "";
    uploadButton.disabled = false;
    getDownlaods();
}

uploadButton.addEventListener("click", fileUpload);