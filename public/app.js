const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const listContainer = document.getElementById("listContainer")

async function uploadFiles() {
    const files = fileInput.files
    const fromData = new FormData
    for(const file of files){
        fromData.append("file",file)
    }
    const respose = fetch("/upload",{
        method:"POST",
        body:fromData
    })
    if(respose.ok){
        fileInput.value = ""
        getFiles()
    }
    
}

uploadBtn.addEventListener("click",() => {
    uploadFiles()
})

async function getFiles() {
    const response = await fetch("/api/files");
    const files = await response.json();

    listContainer.innerHTML = "";

    for (const file of files) {
        const div = document.createElement("div");
        const p = document.createElement("p");
        p.textContent = file.filename;

        const btn = document.createElement("a");
        btn.textContent = "Download";
        btn.href = `/download/${encodeURIComponent(file.filename)}`;

        div.append(p, btn);
        listContainer.appendChild(div);
    }
}

getFiles();