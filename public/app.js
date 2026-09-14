const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const listContainer = document.getElementById("listContainer")
const fileName = document.getElementById("fileName")

let eventSource = null

async function uploadFiles() {
    const files = fileInput.files
    const fromData = new FormData
    for(const file of files){
        fromData.append("file",file)
    }
    
    uploadBtn.disabled = true
    uploadBtn.textContent = "0%"
    uploadBtn.style.background = "#222"
    
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/upload", true)
    
    xhr.upload.onprogress = function(e) {
        if(e.lengthComputable){
            const percent = Math.round((e.loaded / e.total) * 100)
            uploadBtn.textContent = percent + "%"
            uploadBtn.style.background = `linear-gradient(90deg, #444 ${percent}%, #222 ${percent}%)`
        }
    }
    
    xhr.onload = function() {
        if(xhr.status === 200){
            uploadBtn.textContent = "Done"
            uploadBtn.style.background = "#28a745"
            
            setTimeout(() => {
                uploadBtn.disabled = false
                uploadBtn.textContent = "Upload"
                uploadBtn.style.background = "#222"
                fileInput.value = ""
                fileName.textContent = "Select files"
                getFiles()
            }, 1000)
        } else {
            uploadBtn.disabled = false
            uploadBtn.textContent = "Upload"
            uploadBtn.style.background = "#222"
        }
    }
    
    xhr.onerror = function() {
        uploadBtn.disabled = false
        uploadBtn.textContent = "Upload"
        uploadBtn.style.background = "#222"
    }
    
    xhr.send(fromData)
}

uploadBtn.addEventListener("click",() => {
    uploadFiles()
})

fileInput.addEventListener("change",() => {
    const files = fileInput.files
    if(files.length > 0){
        if(files.length === 1){
            fileName.textContent = files[0].name
        } else {
            fileName.textContent = `${files.length} files selected`
        }
    } else {
        fileName.textContent = "Select files"
    }
})

async function getFiles() {
    const response = await fetch("/api/files");
    const files = await response.json();
    renderFiles(files)
}

function renderFiles(files) {
    listContainer.innerHTML = "";

    for (const file of files) {
        const div = document.createElement("div");
        const p = document.createElement("p");
        p.textContent = file.filename;

        const btn = document.createElement("a");
        btn.textContent = "Download";
        btn.href = `/download/${encodeURIComponent(file.filename)}`;
        btn.className = "download";

        div.append(p, btn);
        listContainer.appendChild(div);
    }
}

function connectSSE() {
    if (eventSource) {
        eventSource.close()
    }
    
    eventSource = new EventSource("/events")
    
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data)
        
        if (data.type === 'file-uploaded') {
            // Refresh file list when a new file is uploaded
            getFiles()
        }
    }
    
    eventSource.onerror = function() {
        console.log('SSE connection error, reconnecting...')
        eventSource.close()
        setTimeout(connectSSE, 3000)
    }
}

function disconnectSSE() {
    if (eventSource) {
        eventSource.close()
        eventSource = null
    }
}

// Initial load and connect to SSE
getFiles()
connectSSE()

// Handle page visibility for SSE
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        disconnectSSE()
    } else {
        getFiles()
        connectSSE()
    }
})