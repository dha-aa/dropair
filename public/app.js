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

async function fileUpload() {
    const files = fileInput.files;
    uploadButton.disabled = true;

    for (const file of files) {
        const formData = new FormData();
        formData.append("file",file);
        try {
            const respone = await fetch("/upload",{
                method:"POST",
                body:formData,
                
            })
            if (respone.ok) {
                console.log("file uploaded!")
                
            }
        } catch(error) {
            console.log(error)
        }
        
    };
    fileInput.value = "";
    uploadButton.disabled = false;
    getDownlaods();
    
}

uploadButton.addEventListener("click",fileUpload);
