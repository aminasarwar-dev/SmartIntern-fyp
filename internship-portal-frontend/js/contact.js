/* =====================================================
   SMARTINTERN — CONTACT FORM (landing page)
   Checks the fields, then sends the message.

   BACKEND: when POST /contact exists, set
   CONTACT_API_ENABLED = true and add
   <script src="../js/api.js"></script> to index.html
   (the body below is what the route should receive).
   Until then the message is only kept in this browser.
===================================================== */
(function () {

    "use strict";

    const CONTACT_API_ENABLED = false;

    const form = document.getElementById("contactForm");
    if (!form) return;

    const success = document.getElementById("contactSuccess");
    const successEmail = document.getElementById("contactSuccessEmail");
    const again = document.getElementById("contactAgain");
    const submit = document.getElementById("contactSubmit");
    const formError = document.getElementById("contactError");
    const message = document.getElementById("contactMessage");
    const count = document.getElementById("contactCount");

    const rules = {
        contactName: value => value.length < 2 ? "Please enter your name." : "",
        contactEmail: value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Please enter a valid email." : "",
        contactPhone: value => value && value.replace(/\D/g, "").length < 10 ? "Please enter a valid phone number." : "",
        contactTopic: value => !value ? "Please choose a topic." : "",
        contactMessage: value => value.length < 10 ? "Please write at least 10 characters." : ""
    };

    function setError(id, text) {
        const input = document.getElementById(id);
        const field = input.closest(".contact-field");
        const old = field.querySelector(".contact-error");
        if (old) old.remove();
        field.classList.toggle("has-error", Boolean(text));
        if (text) {
            const note = document.createElement("span");
            note.className = "contact-error";
            note.textContent = text;
            field.appendChild(note);
        }
        return Boolean(text);
    }

    function check(id) {
        const input = document.getElementById(id);
        return setError(id, rules[id](input.value.trim()));
    }

    Object.keys(rules).forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("blur", () => check(id));
        input.addEventListener("input", () => {
            if (input.closest(".contact-field").classList.contains("has-error")) check(id);
        });
    });

    message.addEventListener("input", () => { count.textContent = message.value.length; });

    async function send(payload) {
        if (CONTACT_API_ENABLED && typeof apiRequest === "function") {
            return apiRequest("/contact", { method: "POST", body: JSON.stringify(payload) });
        }

        try {
            const saved = JSON.parse(localStorage.getItem("smartInternContactMessages") || "[]");
            saved.push({ ...payload, sentAt: new Date().toISOString() });
            localStorage.setItem("smartInternContactMessages", JSON.stringify(saved));
        } catch (error) { /* storage blocked: still show success */ }

        return { ok: true };
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        formError.textContent = "";

        const failed = Object.keys(rules).filter(check);

        if (failed.length) {
            document.getElementById(failed[0]).focus();
            return;
        }

        const payload = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim(),
            phone: document.getElementById("contactPhone").value.trim(),
            role: document.getElementById("contactRole").value,
            topic: document.getElementById("contactTopic").value,
            message: message.value.trim()
        };

        submit.disabled = true;
        const label = submit.innerHTML;
        submit.textContent = "Sending...";

        try {
            await send(payload);
            successEmail.textContent = payload.email;
            form.hidden = true;
            success.hidden = false;
            form.reset();
            count.textContent = "0";
        } catch (error) {
            formError.textContent = (error && error.message) || "Could not send your message. Please try again.";
        } finally {
            submit.disabled = false;
            submit.innerHTML = label;
        }
    });

    again.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
        document.getElementById("contactName").focus();
    });

})();
