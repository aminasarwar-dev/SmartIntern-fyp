document.addEventListener("DOMContentLoaded", () => {

    const fileInput =
        document.getElementById("resumeFile");

    const uploadArea =
        document.getElementById("uploadArea");

    const selectedFile =
        document.getElementById("selectedFile");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const removeFile =
        document.getElementById("removeFile");

    const uploadButton =
        document.getElementById("uploadButton");

    const currentResumeName =
        document.getElementById("currentResumeName");

    const currentResumeStatus =
        document.getElementById("currentResumeStatus");

    const resumeStatus =
        document.querySelector(".resume-status");


    let selectedResume = null;


    /* =====================================================
       FILE SIZE
       ===================================================== */

    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return bytes + " Bytes";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";

    }


    /* =====================================================
       CHECK FILE
       ===================================================== */

    function handleFile(file) {

        if (!file) {
            return;
        }


        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const allowedExtensions = [
            "pdf",
            "doc",
            "docx"
        ];


        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(extension)
        ) {

            alert(
                "Please upload a PDF, DOC or DOCX file."
            );

            fileInput.value = "";

            return;

        }


        if (file.size > 5 * 1024 * 1024) {

            alert(
                "File size must be less than 5 MB."
            );

            fileInput.value = "";

            return;

        }


        selectedResume = file;


        fileName.textContent =
            file.name;

        fileSize.textContent =
            formatFileSize(file.size);


        selectedFile.classList.add("show");

        uploadButton.disabled = false;


        if (typeof gsap !== "undefined") {

            gsap.fromTo(
                selectedFile,
                {
                    opacity: 0,
                    y: 8
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .35,
                    ease: "power2.out"
                }
            );

        }

    }


    /* =====================================================
       INPUT CHANGE
       ===================================================== */

    fileInput.addEventListener(
        "change",
        () => {

            handleFile(
                fileInput.files[0]
            );

        }
    );


    /* =====================================================
       DRAG & DROP
       ===================================================== */

    uploadArea.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        () => {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];

            handleFile(file);

        }
    );


    /* =====================================================
       REMOVE FILE
       ===================================================== */

    removeFile.addEventListener(
        "click",
        () => {

            selectedResume = null;

            fileInput.value = "";

            selectedFile.classList.remove(
                "show"
            );

            uploadButton.disabled = true;

        }
    );


    /* =====================================================
       UPLOAD
       ===================================================== */

    uploadButton.addEventListener(
        "click",
        () => {

            if (!selectedResume) {
                return;
            }


            uploadButton.disabled = true;

            uploadButton.innerHTML =
                "Analyzing Resume...";


            if (typeof gsap !== "undefined") {

                gsap.to(
                    uploadButton,
                    {
                        scale: .98,
                        duration: .15,
                        yoyo: true,
                        repeat: 1
                    }
                );

            }


            setTimeout(() => {

                currentResumeName.textContent =
                    selectedResume.name;

                if (window.SmartStudent) {
                    window.SmartStudent.setResume(selectedResume.name);
                }

                currentResumeStatus.textContent =
                    "Resume uploaded successfully. AI analysis is ready.";

                resumeStatus.textContent =
                    "Uploaded";


                resumeStatus.style.background =
                    "#eee3f7";

                resumeStatus.style.color =
                    "#76538d";


                uploadButton.innerHTML =
                    "Resume Uploaded ✓";


                // the AI screen listens for this and starts reading the skills
                document.dispatchEvent(
                    new CustomEvent(
                        "smartintern:resume-uploaded",
                        { detail: { file: selectedResume } }
                    )
                );


                selectedResume = null;


            }, 1000);

        }
    );


    /* =====================================================
       PAGE ANIMATION
       ===================================================== */

    if (typeof gsap !== "undefined") {

        gsap.from(
            ".resume-heading",
            {
                opacity: 0,
                y: 18,
                duration: .6,
                ease: "power2.out"
            }
        );


        gsap.from(
            ".current-resume-card, .resume-upload-card, .ai-analysis-card, .resume-tip",
            {
                opacity: 0,
                y: 20,
                duration: .6,
                stagger: .08,
                delay: .15,
                ease: "power2.out"
            }
        );

    }

});