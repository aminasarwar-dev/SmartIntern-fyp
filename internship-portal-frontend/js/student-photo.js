/* =========================================================
   SMARTINTERN — STUDENT PROFILE PHOTO (optional)
   ---------------------------------------------------------
   • If the student uploaded a photo, it replaces the initials
     in the sidebar, the top bar and the profile header.
   • If not, the initials stay exactly as they are.
   • The profile page gets "Upload photo" / "Remove" buttons.
   Needs js/student-data.js. Load on student pages only.
========================================================= */
(function () {

    "use strict";

    const MAX_FILE_MB = 5;
    const SIZE = 256;
    const TYPES = ["image/jpeg", "image/png", "image/webp"];
    const SELECTORS = ".sidebar-avatar, .topbar-avatar, .profile-large-avatar";

    function addStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .has-photo { overflow: hidden; padding: 0 !important; }
            .has-photo > img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
            .photo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-top: 12px; }
            .photo-btn, .photo-remove {
                display: inline-flex; align-items: center; height: 32px; padding: 0 14px;
                border-radius: 10px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
            }
            .photo-btn { border: 1px solid transparent; background: #b38bd7; color: #fff; transition: background .2s; }
            .photo-btn:hover { background: #8d63ad; }
            .photo-btn input { display: none; }
            .photo-btn:focus-within { outline: 2px solid #8d63ad; outline-offset: 2px; }
            .photo-remove { border: 1px solid #eadfe8; background: #fff; color: #777078; }
            .photo-remove:hover { border-color: #d9534f; color: #c0392b; }
            .photo-remove[hidden] { display: none; }
            .photo-hint { font-size: 11.5px; color: #a39aa5; }
        `;
        document.head.appendChild(style);
    }

    function applyPhoto() {
        const photo = window.SmartStudent ? window.SmartStudent.getPhoto() : "";

        document.querySelectorAll(SELECTORS).forEach(box => {
            const existing = box.querySelector(":scope > img.photo-img");

            if (!photo) {
                if (existing) {
                    existing.remove();
                    box.classList.remove("has-photo");
                    const initials = box.getAttribute("data-initials");
                    if (initials !== null) box.textContent = initials;
                }
                return;
            }

            if (!box.classList.contains("has-photo")) {
                box.setAttribute("data-initials", box.textContent.trim());
            }

            if (existing) {
                if (existing.src !== photo) existing.src = photo;
                return;
            }

            box.textContent = "";
            const img = document.createElement("img");
            img.className = "photo-img";
            img.alt = "Profile photo";
            img.src = photo;
            box.appendChild(img);
            box.classList.add("has-photo");
        });

        const remove = document.getElementById("removePhoto");
        if (remove) remove.hidden = !photo;

        const label = document.getElementById("photoButtonText");
        if (label) label.textContent = photo ? "Change photo" : "Upload photo";
    }

    function tell(message) {
        if (window.SmartDialog && window.SmartDialog.alert) window.SmartDialog.alert(message, "Profile photo");
        else window.alert(message);
    }

    // crop to a centred square and shrink, so it stays small
    function shrink(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                const side = Math.min(img.width, img.height);
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = SIZE;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL("image/jpeg", 0.86));
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("bad image"));
            };

            img.src = url;
        });
    }

    function buildControls() {
        const heading = document.querySelector(".profile-heading");
        if (!heading || document.getElementById("photoInput")) return;

        const row = document.createElement("div");
        row.className = "photo-actions";

        const label = document.createElement("label");
        label.className = "photo-btn";
        const text = document.createElement("span");
        text.id = "photoButtonText";
        text.textContent = "Upload photo";
        const input = document.createElement("input");
        input.type = "file";
        input.id = "photoInput";
        input.accept = "image/png,image/jpeg,image/webp";
        label.append(text, input);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.id = "removePhoto";
        remove.className = "photo-remove";
        remove.textContent = "Remove";
        remove.hidden = true;

        const hint = document.createElement("span");
        hint.className = "photo-hint";
        hint.textContent = "Optional · JPG, PNG or WebP · up to " + MAX_FILE_MB + " MB";

        row.append(label, remove, hint);
        heading.appendChild(row);

        input.addEventListener("change", async () => {
            const file = input.files && input.files[0];
            input.value = "";
            if (!file) return;

            if (TYPES.indexOf(file.type) === -1) {
                tell("Please choose a JPG, PNG or WebP image.");
                return;
            }

            if (file.size > MAX_FILE_MB * 1024 * 1024) {
                tell("This image is too large. Please choose one under " + MAX_FILE_MB + " MB.");
                return;
            }

            try {
                const dataUrl = await shrink(file);
                if (!window.SmartStudent.setPhoto(dataUrl)) {
                    tell("Could not save the photo on this browser. Please try a smaller image.");
                }
            } catch (error) {
                tell("This file could not be read as an image. Please try another one.");
            }
        });

        remove.addEventListener("click", () => window.SmartStudent.setPhoto(""));
    }

    function init() {
        if (!window.SmartStudent) return;
        addStyles();
        buildControls();
        applyPhoto();
        document.addEventListener("smartintern:photo", applyPhoto);
        window.addEventListener("storage", applyPhoto);
    }

    // after the other page scripts have written the initials
    if (document.readyState === "complete") init();
    else window.addEventListener("load", init);

})();
