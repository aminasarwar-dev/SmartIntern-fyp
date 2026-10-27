/* =========================================================
   SMARTINTERN — STUDENT DATA (profile + resume info)
   ---------------------------------------------------------
   One place that knows the student's saved details, so the
   Profile page and the "Apply" form show the same data.

     SmartStudent.get()        -> details (login data + saved profile)
     SmartStudent.save(values) -> remember the details
     SmartStudent.getResume()  -> { name } or null

   Until the backend has GET/PUT /student/profile the details
   are kept in this browser (localStorage). To connect the
   backend, change get() and save() only.
========================================================= */
(function () {

    "use strict";

    const DETAILS_KEY = "smartInternStudentDetails";
    const RESUME_KEY = "smartInternResumeName";
    const PHOTO_KEY = "smartInternStudentPhoto";

    function readJSON(storage, key) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    // What the login response already told us about the student
    function fromLogin() {
        const raw =
            readJSON(sessionStorage, "smartInternStudentProfile") ||
            readJSON(sessionStorage, "user_data") ||
            {};

        return {
            fullName: raw.full_name || raw.fullName || raw.name || "",
            email: raw.email || "",
            phone: raw.phone || "",
            location: raw.city || raw.location || "",
            university: raw.university || "",
            degree: raw.degree || "",
            graduationYear: raw.graduation_year || raw.graduationYear || "",
            cgpa: raw.cgpa || ""
        };
    }

    function get() {
        const saved = readJSON(localStorage, DETAILS_KEY) || {};
        const login = fromLogin();
        const merged = { ...login };

        // a saved value wins, but an empty saved value does not erase login data
        Object.entries(saved).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                merged[key] = value;
            }
        });

        return merged;
    }

    function save(values) {
        try {
            const current = readJSON(localStorage, DETAILS_KEY) || {};
            localStorage.setItem(DETAILS_KEY, JSON.stringify({ ...current, ...values }));
            return true;
        } catch (error) {
            return false;
        }
    }

    function setResume(name) {
        try {
            localStorage.setItem(RESUME_KEY, name);
        } catch (error) { /* ignore */ }
    }

    function getResume() {
        try {
            const name = localStorage.getItem(RESUME_KEY);
            return name ? { name } : null;
        } catch (error) {
            return null;
        }
    }

    // Profile photo (optional). A small image kept as a data URL.
    // BACKEND later: POST/DELETE /student/profile/photo
    function getPhoto() {
        try {
            return localStorage.getItem(PHOTO_KEY) || "";
        } catch (error) {
            return "";
        }
    }

    function setPhoto(dataUrl) {
        try {
            if (dataUrl) localStorage.setItem(PHOTO_KEY, dataUrl);
            else localStorage.removeItem(PHOTO_KEY);
            document.dispatchEvent(new CustomEvent("smartintern:photo"));
            return true;
        } catch (error) {
            return false;
        }
    }

    window.SmartStudent = { get, save, setResume, getResume, getPhoto, setPhoto };

})();
