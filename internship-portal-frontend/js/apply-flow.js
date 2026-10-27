/* =========================================================
   SMARTINTERN — INTERNSHIP DETAILS + APPLY FLOW
   ---------------------------------------------------------
     SmartApply.open(internship)

   Step 0  Details   – full internship information
   Step 1  Your info – form already filled from the student's
                       saved profile; everything can be edited
   Step 2  Review    – read-only summary + confirmation tick
   Step 3  Done      – application sent

   internship = { id, title, company, initial, type, typeLabel,
                  location, duration, skills[], about, responsibilities[],
                  requirements[], perks[], stipend, deadline, match }

   BACKEND: set APPLY_API_ENABLED = true when
            POST /student/applications exists (see submitApplication).
========================================================= */
(function () {

    "use strict";

    const APPLY_API_ENABLED = false;
    const APPLICATIONS_KEY = "smartInternApplications";

    let overlay = null;
    let state = null;
    let lastFocus = null;

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function esc(value) {
        return window.SmartAI ? window.SmartAI.escapeHTML(value) :
            String(value == null ? "" : value).replace(/[&<>"']/g, c =>
                ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function fmt(skill) {
        return window.SmartAI ? window.SmartAI.formatSkill(skill) : skill;
    }

    /* ---------------- SAVED APPLICATIONS (until backend) ---------------- */

    function readApplications() {
        try {
            return JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || "[]");
        } catch (error) {
            return [];
        }
    }

    function hasApplied(id) {
        return readApplications().some(item => String(item.internshipId) === String(id));
    }

    async function submitApplication(payload) {
        if (APPLY_API_ENABLED && typeof apiRequest === "function") {
            // Expected: POST /student/applications  (multipart or JSON)
            return apiRequest("/student/applications", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        const list = readApplications();
        list.push({ ...payload, appliedAt: new Date().toISOString() });
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list));
        return { ok: true };
    }

    /* ---------------- SHELL ---------------- */

    function ensureOverlay() {
        if (overlay && document.body.contains(overlay)) return overlay;

        overlay = el("div", "apply-overlay");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.addEventListener("mousedown", event => {
            if (event.target === overlay) close();
        });
        document.addEventListener("keydown", onKey);
        document.body.appendChild(overlay);
        return overlay;
    }

    function onKey(event) {
        if (!overlay || !overlay.classList.contains("show")) return;
        if (event.key === "Escape") close();
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove("show");
        document.body.classList.remove("apply-lock");
        state = null;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function mount(panel) {
        const root = ensureOverlay();
        root.innerHTML = "";
        root.appendChild(panel);
        root.classList.add("show");
        document.body.classList.add("apply-lock");
        const focusTarget = panel.querySelector("[data-autofocus]") || panel;
        panel.tabIndex = -1;
        setTimeout(() => focusTarget.focus({ preventScroll: true }), 30);
    }

    function header(item, withMatch) {
        const head = el("div", "apply-head");

        head.append(el("div", "apply-logo", item.initial || (item.company || "?").charAt(0)));

        const text = el("div", "apply-head-text");
        text.append(el("h2", "", item.title), el("p", "", item.company));
        head.appendChild(text);

        if (withMatch && item.matchPct != null && window.SmartAI) {
            const badge = el("div", "apply-head-match");
            badge.innerHTML = window.SmartAI.matchBadge(item.matchPct);
            head.appendChild(badge);
        }

        const closeBtn = el("button", "apply-close", "×");
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.addEventListener("click", close);
        head.appendChild(closeBtn);

        return head;
    }

    function stepper(active) {
        const bar = el("ol", "apply-steps");
        ["Your information", "Review", "Done"].forEach((label, index) => {
            const li = el("li", index + 1 < active ? "is-done" : index + 1 === active ? "is-active" : "");
            li.append(el("span", "", index + 1 < active ? "✓" : String(index + 1)), document.createTextNode(label));
            bar.appendChild(li);
        });
        return bar;
    }

    function panelShell(item, withMatch) {
        const panel = el("div", "apply-panel");
        panel.appendChild(header(item, withMatch));
        return panel;
    }

    /* ---------------- STEP 0 — DETAILS ---------------- */

    function section(title, content) {
        const block = el("section", "apply-section");
        block.appendChild(el("h4", "", title));
        block.appendChild(content);
        return block;
    }

    function listOf(items) {
        const ul = el("ul", "apply-list");
        (items || []).forEach(text => ul.appendChild(el("li", "", text)));
        return ul;
    }

    function showDetails(item) {
        const panel = panelShell(item, true);
        const body = el("div", "apply-body");

        const facts = el("div", "apply-facts");
        [
            ["Type", item.typeLabel],
            ["Location", item.location],
            ["Duration", item.duration],
            ["Stipend", item.stipend],
            ["Apply before", item.deadline]
        ].filter(row => row[1]).forEach(([label, value]) => {
            const box = el("div", "apply-fact");
            box.append(el("span", "", label), el("strong", "", value));
            facts.appendChild(box);
        });
        body.appendChild(facts);

        if (item.about) body.appendChild(section("About the internship", el("p", "apply-text", item.about)));
        if ((item.responsibilities || []).length) body.appendChild(section("What you will do", listOf(item.responsibilities)));
        if ((item.requirements || []).length) body.appendChild(section("Requirements", listOf(item.requirements)));

        const skillBox = el("div", "apply-skill-tags");
        const have = new Set(((window.SmartAI && window.SmartAI.getSavedSkills()) || []).map(s => window.SmartAI.normalizeSkill(s)));
        (item.skills || []).forEach(skill => {
            const own = have.has(window.SmartAI ? window.SmartAI.normalizeSkill(skill) : skill);
            skillBox.appendChild(el("span", own ? "is-have" : "", (own ? "✓ " : "") + fmt(skill)));
        });
        body.appendChild(section("Skills needed", skillBox));

        if (item.gap && item.gap.length) {
            body.appendChild(el("p", "apply-gap", "To improve your chances, learn: " + item.gap.map(fmt).join(", ") + "."));
        }

        if ((item.perks || []).length) body.appendChild(section("What you get", listOf(item.perks)));

        if (window.SmartAI) {
            body.appendChild(el("p", "apply-note", window.SmartAI.NOTE_TEXT));
        }

        panel.appendChild(body);

        const foot = el("div", "apply-foot");
        const back = el("button", "apply-btn ghost", "Close");
        back.type = "button";
        back.addEventListener("click", close);

        const applied = hasApplied(item.id);
        const apply = el("button", "apply-btn primary", applied ? "Already applied" : "Apply now");
        apply.type = "button";
        apply.disabled = applied;
        apply.setAttribute("data-autofocus", "");
        apply.addEventListener("click", () => showForm(item));
        foot.append(back, apply);
        panel.appendChild(foot);

        mount(panel);
    }

    /* ---------------- STEP 1 — FORM ---------------- */

    const FIELDS = [
        { id: "fullName", label: "Full name", required: true, type: "text", autocomplete: "name" },
        { id: "email", label: "Email", required: true, type: "email", autocomplete: "email" },
        { id: "phone", label: "Phone number", required: true, type: "tel", autocomplete: "tel" },
        { id: "location", label: "City", required: true, type: "text", autocomplete: "address-level2" },
        { id: "university", label: "University", required: true, type: "text" },
        { id: "degree", label: "Degree / Program", required: true, type: "text" },
        { id: "graduationYear", label: "Graduation year", required: false, type: "text" },
        { id: "cgpa", label: "CGPA", required: false, type: "text" }
    ];

    function initialValues() {
        const saved = window.SmartStudent ? window.SmartStudent.get() : {};
        const skills = (window.SmartAI && window.SmartAI.getSavedSkills()) || [];
        const resume = window.SmartStudent ? window.SmartStudent.getResume() : null;
        const values = { skills: skills.slice(), coverNote: "", saveToProfile: true, resumeName: resume ? resume.name : "" };
        FIELDS.forEach(field => { values[field.id] = saved[field.id] || ""; });
        return values;
    }

    function showForm(item) {
        if (!state || state.item !== item) state = { item, values: initialValues() };
        const values = state.values;

        const panel = panelShell(item, false);
        panel.appendChild(stepper(1));

        const form = el("form", "apply-body apply-form");
        form.noValidate = true;

        const filled = FIELDS.filter(f => values[f.id]).length;
        form.appendChild(el("p", "apply-intro",
            filled
                ? "We filled this in from your profile. Check it, change anything that is old, then continue."
                : "Your profile is empty, so please fill in your details. They will be saved for next time."));

        const grid = el("div", "apply-grid");
        FIELDS.forEach((field, index) => {
            const wrap = el("label", "apply-field");
            wrap.appendChild(el("span", "", field.label + (field.required ? " *" : "")));
            const input = document.createElement("input");
            input.type = field.type;
            input.id = "apply_" + field.id;
            input.value = values[field.id];
            if (field.autocomplete) input.autocomplete = field.autocomplete;
            if (index === 0) input.setAttribute("data-autofocus", "");
            input.addEventListener("input", () => {
                values[field.id] = input.value;
                wrap.classList.remove("has-error");
                const err = wrap.querySelector(".apply-error");
                if (err) err.remove();
            });
            wrap.appendChild(input);
            grid.appendChild(wrap);
        });
        form.appendChild(grid);

        // skills
        const skillsWrap = el("div", "apply-field wide");
        skillsWrap.appendChild(el("span", "", "Your skills"));
        const chipHost = el("div", "apply-skills");
        skillsWrap.appendChild(chipHost);
        form.appendChild(skillsWrap);

        if (window.SmartAI) {
            window.SmartAI.createChipEditor(chipHost, {
                skills: values.skills,
                helpText: "Remove skills you do not have, add the ones that are missing.",
                onChange: list => { values.skills = list; }
            });
        }

        // resume
        const resumeRow = el("div", "apply-resume");
        if (values.resumeName) {
            resumeRow.innerHTML = '<span class="apply-resume-icon">▤</span><div><strong>' + esc(values.resumeName) +
                '</strong><small>Your saved resume will be sent with this application.</small></div>';
        } else {
            resumeRow.classList.add("is-missing");
            resumeRow.innerHTML = '<span class="apply-resume-icon">!</span><div><strong>No resume uploaded yet</strong>' +
                '<small>Companies prefer applications with a resume.</small></div>';
        }
        const resumeLink = el("a", "apply-link", values.resumeName ? "Change" : "Upload resume");
        resumeLink.href = "resume-upload.html";
        resumeRow.appendChild(resumeLink);
        form.appendChild(resumeRow);

        // cover note
        const noteWrap = el("label", "apply-field wide");
        noteWrap.appendChild(el("span", "", "Message to the company (optional)"));
        const note = document.createElement("textarea");
        note.rows = 3;
        note.maxLength = 600;
        note.placeholder = "Why are you a good fit for this internship?";
        note.value = values.coverNote;
        note.addEventListener("input", () => { values.coverNote = note.value; });
        noteWrap.appendChild(note);
        form.appendChild(noteWrap);

        // save to profile
        const saveRow = el("label", "apply-check");
        const saveBox = document.createElement("input");
        saveBox.type = "checkbox";
        saveBox.checked = values.saveToProfile;
        saveBox.addEventListener("change", () => { values.saveToProfile = saveBox.checked; });
        saveRow.append(saveBox, el("span", "", "Save these changes to my profile"));
        form.appendChild(saveRow);

        panel.appendChild(form);

        const foot = el("div", "apply-foot");
        const back = el("button", "apply-btn ghost", "Back");
        back.type = "button";
        back.addEventListener("click", () => showDetails(item));
        const next = el("button", "apply-btn primary", "Review application");
        next.type = "button";
        foot.append(back, next);
        panel.appendChild(foot);

        function validate() {
            let first = null;
            FIELDS.forEach(field => {
                const wrap = grid.querySelector("#apply_" + field.id).parentElement;
                const value = String(values[field.id] || "").trim();
                let message = "";

                if (field.required && !value) message = "This is required.";
                else if (field.id === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email.";
                else if (field.id === "phone" && value && value.replace(/\D/g, "").length < 10) message = "Enter a valid phone number.";
                else if (field.id === "cgpa" && value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 4.5)) message = "CGPA should be between 0 and 4.";

                const old = wrap.querySelector(".apply-error");
                if (old) old.remove();
                wrap.classList.toggle("has-error", Boolean(message));
                if (message) {
                    wrap.appendChild(el("em", "apply-error", message));
                    if (!first) first = wrap.querySelector("input");
                }
            });
            if (first) first.focus();
            return !first;
        }

        next.addEventListener("click", () => { if (validate()) showReview(item); });
        form.addEventListener("submit", event => { event.preventDefault(); next.click(); });

        mount(panel);
    }

    /* ---------------- STEP 2 — REVIEW ---------------- */

    function showReview(item) {
        const values = state.values;
        const panel = panelShell(item, false);
        panel.appendChild(stepper(2));

        const body = el("div", "apply-body");
        body.appendChild(el("p", "apply-intro", "Please check everything once more. After you confirm, the company will see this."));

        const summary = el("dl", "apply-summary");
        FIELDS.forEach(field => {
            const value = String(values[field.id] || "").trim();
            if (!value) return;
            summary.append(el("dt", "", field.label), el("dd", "", value));
        });
        summary.append(el("dt", "", "Skills"),
            Object.assign(el("dd", ""), { textContent: values.skills.length ? values.skills.map(fmt).join(", ") : "None added" }));
        summary.append(el("dt", "", "Resume"), el("dd", "", values.resumeName || "Not uploaded"));
        if (values.coverNote.trim()) summary.append(el("dt", "", "Message"), el("dd", "", values.coverNote.trim()));
        body.appendChild(summary);

        const confirmRow = el("label", "apply-check strong");
        const confirmBox = document.createElement("input");
        confirmBox.type = "checkbox";
        confirmRow.append(confirmBox, el("span", "", "I confirm that my information is correct."));
        body.appendChild(confirmRow);

        const error = el("p", "apply-form-error");
        error.setAttribute("role", "alert");
        body.appendChild(error);

        panel.appendChild(body);

        const foot = el("div", "apply-foot");
        const edit = el("button", "apply-btn ghost", "Edit");
        edit.type = "button";
        edit.addEventListener("click", () => showForm(item));
        const send = el("button", "apply-btn primary", "Confirm & apply");
        send.type = "button";
        send.disabled = true;
        send.setAttribute("data-autofocus", "");
        foot.append(edit, send);
        panel.appendChild(foot);

        confirmBox.addEventListener("change", () => { send.disabled = !confirmBox.checked; });

        send.addEventListener("click", async () => {
            send.disabled = true;
            edit.disabled = true;
            send.textContent = "Sending…";
            error.textContent = "";

            const payload = {
                internshipId: item.id,
                internshipTitle: item.title,
                company: item.company,
                full_name: values.fullName.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                city: values.location.trim(),
                university: values.university.trim(),
                degree: values.degree.trim(),
                graduation_year: String(values.graduationYear || "").trim(),
                cgpa: String(values.cgpa || "").trim(),
                skills: values.skills,
                cover_note: values.coverNote.trim()
            };

            try {
                await submitApplication(payload);

                if (values.saveToProfile && window.SmartStudent) {
                    const keep = {};
                    FIELDS.forEach(field => { keep[field.id] = String(values[field.id] || "").trim(); });
                    window.SmartStudent.save(keep);
                }

                document.dispatchEvent(new CustomEvent("smartintern:applied", { detail: { id: item.id } }));
                showDone(item);
            } catch (failure) {
                error.textContent = (failure && failure.message) || "Could not send your application. Please try again.";
                send.disabled = false;
                edit.disabled = false;
                send.textContent = "Confirm & apply";
            }
        });

        mount(panel);
    }

    /* ---------------- STEP 3 — DONE ---------------- */

    function showDone(item) {
        const panel = panelShell(item, false);
        panel.appendChild(stepper(3));

        const body = el("div", "apply-body apply-done");
        body.append(
            el("div", "apply-done-icon", "✓"),
            el("h3", "", "Application sent"),
            el("p", "", "Your application for " + item.title + " at " + item.company + " has been sent. You can follow its status in My Applications.")
        );
        panel.appendChild(body);

        const foot = el("div", "apply-foot");
        const keep = el("button", "apply-btn ghost", "Keep browsing");
        keep.type = "button";
        keep.addEventListener("click", close);
        const go = el("a", "apply-btn primary", "My applications");
        go.href = "student-my-applications.html";
        go.setAttribute("data-autofocus", "");
        foot.append(keep, go);
        panel.appendChild(foot);

        mount(panel);
    }

    /* ---------------- PUBLIC ---------------- */

    function open(item, options) {
        lastFocus = document.activeElement;
        state = null;
        if (options && options.directApply) showForm(item);
        else showDetails(item);
    }

    window.SmartApply = { open, close, hasApplied };

})();
