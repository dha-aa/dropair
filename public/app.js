const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");

async function fileUpload() {
    const files = fileInput.files;

    for (const file of files) {
        const formData = new FormData();
        formData.append("file",file);

        try {
            const respone = await fetch("/upload",{
                method:"POSt",
                body:formData,
                
            })
            if (respone.ok) {
                console.log("file uploaded!")
            }
        } catch(error) {
            console.log(error)
        }
    }
    
}

uploadButton.addEventListener("click",fileUpload)