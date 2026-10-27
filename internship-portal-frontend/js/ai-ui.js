/* =========================================================
   SMARTINTERN — AI UI KIT
   ---------------------------------------------------------
   Shared pieces for every AI screen:

     SmartAI.formatSkill("rest api")        -> "REST API"
     SmartAI.createChipEditor(container, options)   editable skill chips
     SmartAI.matchBadge(matchPct)           -> HTML for the % badge
     SmartAI.gapLine(gapList)               -> HTML "Missing: ..."
     SmartAI.noteElement()                  the "aid, not auto-reject" line
     SmartAI.emptyHintElement()             "Add your skills to see your match"
     SmartAI.computeMatch(required, have)   same shape the backend sends

   The AI backend sends:
     skills  : ["python", "sql", "git"]            (lower case)
     match   : { match_pct, matched: [...], gap: [...] }

   CONNECTING THE BACKEND LATER
   ---------------------------------------------------------
   1. Set SmartAI.config.useMock = false
   2. Fill SmartAI.config.endpoints (extract / confirm / match)
   3. Adjust the two small functions  extractSkills()  and
      confirmSkills()  at the bottom if the routes need other
      fields. Nothing else in the pages has to change.
========================================================= */
(function () {

    "use strict";

    const config = {
        useMock: true,          // true = sample behaviour, no backend calls
        endpoints: {
            extract: "",        // e.g. POST /student/resume/extract-skills
            confirm: "",        // e.g. PUT  /student/skills
            match: ""           // e.g. GET  /student/matches
        }
    };

    const MAX_SKILLS = 30;      // same limits as the backend
    const MAX_SKILL_LENGTH = 50;

    const NOTE_TEXT =
        "Match % is an aid for the company. The company makes the final decision.";

    /* ---------------- SKILL NAMES ---------------- */

    // Words that are written in capitals
    const ACRONYMS = new Set([
        "sql", "html", "css", "api", "rest", "aws", "gcp", "ai", "ml", "nlp",
        "ui", "ux", "php", "xml", "json", "yaml", "http", "https", "ci", "cd",
        "cli", "sdk", "orm", "oop", "tdd", "seo", "crm", "erp", "ios", "gui",
        "ssh", "tcp", "ip", "vpn", "dns", "jwt", "oauth", "cpu", "gpu", "etl",
        "bi", "qa", "ide", "mvc", "spa", "sass", "pwa", "tcp/ip"
    ]);

    // Names that have their own spelling
    const SPECIAL = {
        javascript: "JavaScript", typescript: "TypeScript", nodejs: "Node.js",
        "node.js": "Node.js", reactjs: "React", "react.js": "React",
        vuejs: "Vue.js", "vue.js": "Vue.js", nextjs: "Next.js", "next.js": "Next.js",
        fastapi: "FastAPI", postgresql: "PostgreSQL", mysql: "MySQL",
        mongodb: "MongoDB", github: "GitHub", gitlab: "GitLab", devops: "DevOps",
        tensorflow: "TensorFlow", pytorch: "PyTorch", numpy: "NumPy",
        pandas: "pandas", scikit: "scikit-learn", "scikit-learn": "scikit-learn",
        "power bi": "Power BI", powerbi: "Power BI", linux: "Linux",
        "c++": "C++", "c#": "C#", ".net": ".NET", figma: "Figma", jira: "Jira",
        django: "Django", flask: "Flask", docker: "Docker", kubernetes: "Kubernetes",
        "machine learning": "Machine Learning", "deep learning": "Deep Learning",
        "data analysis": "Data Analysis", apis: "APIs", "ci/cd": "CI/CD", "ui / ux": "UI / UX", "ui/ux": "UI/UX"
    };

    function formatSkill(name) {
        const clean = String(name ?? "").trim().replace(/\s+/g, " ");
        const key = clean.toLowerCase();

        if (!clean) return "";
        if (SPECIAL[key]) return SPECIAL[key];

        return key
            .split(" ")
            .map(word => {
                if (ACRONYMS.has(word)) return word.toUpperCase();
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    }

    // What we store / send: lower case, single spaces
    function normalizeSkill(name) {
        return String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    /* ---------------- MATCH HELPERS ---------------- */

    // Same shape the backend returns: { match_pct, matched, gap }
    function computeMatch(required, have) {
        const needed = [...new Set((required || []).map(normalizeSkill).filter(Boolean))];
        const owned = new Set((have || []).map(normalizeSkill).filter(Boolean));

        const matched = needed.filter(skill => owned.has(skill));
        const gap = needed.filter(skill => !owned.has(skill));

        return {
            match_pct: needed.length
                ? Math.round((matched.length / needed.length) * 1000) / 10
                : 0,
            matched,
            gap
        };
    }

    function matchLevel(pct) {
        if (pct >= 75) return "high";
        if (pct >= 40) return "mid";
        return "low";
    }

    function matchBadge(pct) {
        const value = Math.max(0, Math.min(100, Number(pct) || 0));
        const shown = Number.isInteger(value) ? value : value.toFixed(1);

        return `<span class="ai-match-badge is-${matchLevel(value)}">${shown}% match</span>`;
    }

    function gapLine(gap) {
        if (!gap || !gap.length) {
            return `<span class="ai-gap-line is-complete">✓ You have all required skills</span>`;
        }

        const shown = gap.slice(0, 4).map(item => escapeHTML(formatSkill(item))).join(", ");
        const more = gap.length > 4 ? ` +${gap.length - 4} more` : "";

        return `<span class="ai-gap-line">Missing: ${shown}${more}</span>`;
    }

    function matchTooltip(match) {
        const matched = (match.matched || []).map(formatSkill).join(", ") || "none yet";
        const gap = (match.gap || []).map(formatSkill).join(", ") || "none";

        return `You have: ${matched}. Missing: ${gap}.`;
    }

    function noteElement() {
        const note = el("p", "ai-note-line");
        note.append(el("span", "ai-note-icon", "ⓘ"), document.createTextNode(" " + NOTE_TEXT));
        return note;
    }

    function emptyHintElement() {
        const hint = el("div", "ai-empty-hint");
        hint.setAttribute("role", "status");

        const text = el("div");
        text.append(
            el("strong", "", "Add your skills to see your match"),
            el("span", "", "Your match % starts at 0 until we know your skills.")
        );

        const link = el("a", "ai-btn primary", "Add skills");
        link.href = "student-profile.html#skills";

        hint.append(el("div", "ai-empty-icon", "✦"), text, link);
        return hint;
    }

    /* ---------------- EDITABLE SKILL CHIPS ---------------- */

    function createChipEditor(container, options = {}) {
        const {
            skills = [],
            loading = false,
            confirmText = "Confirm skills",
            minSkills = 0,
            helpText = "AI can make mistakes. Add a missing skill, remove a wrong one " +
                       "(double-click a skill to rename it), then confirm.",
            onChange = () => {},
            onConfirm = () => {}
        } = options;

        let list = [];
        let isLoading = false;
        let confirmed = false;

        container.innerHTML = "";
        container.classList.add("ai-chips");

        const box = el("div", "ai-chip-box");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "ai-chip-input";
        input.placeholder = "Add a skill and press Enter";
        input.maxLength = MAX_SKILL_LENGTH;
        input.setAttribute("aria-label", "Add a skill");

        const status = el("p", "ai-chip-status");
        status.setAttribute("role", "status");

        const help = el("p", "ai-chip-help", helpText);

        const actions = el("div", "ai-chip-actions");
        const count = el("span", "ai-chip-count");
        const confirmButton = el("button", "ai-btn primary", confirmText);
        confirmButton.type = "button";
        actions.append(count, confirmButton);

        container.append(box, status, help, actions);

        function updateMeta() {
            count.textContent = `${list.length} of ${MAX_SKILLS} skills`;
            confirmButton.disabled = isLoading || list.length < minSkills;
        }

        function say(message) { status.textContent = message || ""; }

        function addSkill(raw) {
            const name = normalizeSkill(raw).replace(/,+$/, "");

            if (!name) return false;

            if (name.length > MAX_SKILL_LENGTH) {
                say(`A skill can have up to ${MAX_SKILL_LENGTH} characters.`);
                return false;
            }

            if (list.includes(name)) {
                say(`"${formatSkill(name)}" is already in the list.`);
                return false;
            }

            if (list.length >= MAX_SKILLS) {
                say(`You can add up to ${MAX_SKILLS} skills.`);
                return false;
            }

            list.push(name);
            confirmed = false;
            say("");
            return true;
        }

        function changed() {
            render();
            onChange(list.slice());
        }

        function startEdit(index, chip) {
            const editor = document.createElement("input");
            editor.type = "text";
            editor.className = "ai-chip-edit";
            editor.value = list[index];
            editor.maxLength = MAX_SKILL_LENGTH;
            editor.setAttribute("aria-label", "Rename skill");

            chip.replaceWith(editor);
            editor.focus();
            editor.select();

            let done = false;

            function finish(save) {
                if (done) return;
                done = true;

                const next = normalizeSkill(editor.value);

                if (save && next && next !== list[index]) {
                    if (list.includes(next)) {
                        say(`"${formatSkill(next)}" is already in the list.`);
                    } else if (next.length <= MAX_SKILL_LENGTH) {
                        list[index] = next;
                        confirmed = false;
                        say("");
                    }
                }

                changed();
            }

            editor.addEventListener("blur", () => finish(true));
            editor.addEventListener("keydown", event => {
                if (event.key === "Enter") { event.preventDefault(); finish(true); }
                if (event.key === "Escape") { event.preventDefault(); finish(false); }
            });
        }

        function render() {
            box.innerHTML = "";
            box.setAttribute("aria-busy", String(isLoading));

            if (isLoading) {
                for (let i = 0; i < 6; i++) {
                    const bone = el("span", "ai-chip-skeleton");
                    bone.style.width = `${60 + ((i * 23) % 50)}px`;
                    box.appendChild(bone);
                }
                say("Reading your information and finding skills…");
            } else {
                list.forEach((skill, index) => {
                    const chip = el("span", "ai-chip");
                    chip.setAttribute("role", "listitem");
                    chip.tabIndex = 0;
                    chip.title = "Double-click to rename";

                    const text = el("span", "ai-chip-text", formatSkill(skill));

                    const remove = el("button", "ai-chip-remove", "×");
                    remove.type = "button";
                    remove.setAttribute("aria-label", `Remove ${formatSkill(skill)}`);
                    remove.addEventListener("click", event => {
                        event.stopPropagation();
                        list.splice(index, 1);
                        confirmed = false;
                        changed();
                        input.focus();
                    });

                    chip.addEventListener("dblclick", () => startEdit(index, chip));
                    chip.addEventListener("keydown", event => {
                        if (event.key === "Enter" || event.key === "F2") {
                            event.preventDefault();
                            startEdit(index, chip);
                        }
                        if (event.key === "Delete" || event.key === "Backspace") {
                            event.preventDefault();
                            list.splice(index, 1);
                            confirmed = false;
                            changed();
                            input.focus();
                        }
                    });

                    chip.append(text, remove);
                    box.appendChild(chip);
                });

                if (!list.length) {
                    box.appendChild(el("span", "ai-chip-empty", "No skills yet. Add your first skill below."));
                }

                if (status.textContent.startsWith("Reading")) say("");
            }

            box.appendChild(input);
            input.disabled = isLoading;
            updateMeta();
        }

        input.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();

                if (addSkill(input.value)) {
                    input.value = "";
                    changed();
                    input.focus();
                }
            }

            if (event.key === "Backspace" && !input.value && list.length) {
                list.pop();
                confirmed = false;
                changed();
                input.focus();
            }
        });

        // Pasting "python, sql, git" adds all of them
        input.addEventListener("paste", event => {
            const text = (event.clipboardData || window.clipboardData)?.getData("text") || "";

            if (!/[,\n]/.test(text)) return;

            event.preventDefault();
            text.split(/[,\n]/).forEach(addSkill);
            input.value = "";
            changed();
        });

        // Leaving the box with text typed adds it too
        input.addEventListener("blur", () => {
            if (input.value.trim() && addSkill(input.value)) {
                input.value = "";
                changed();
            }
        });

        confirmButton.addEventListener("click", async () => {
            if (input.value.trim() && addSkill(input.value)) {
                input.value = "";
                render();
            }

            if (list.length < minSkills) {
                say(`Please add at least ${minSkills} skill${minSkills === 1 ? "" : "s"}.`);
                return;
            }

            confirmButton.disabled = true;
            const original = confirmButton.textContent;
            confirmButton.textContent = "Saving…";

            try {
                await onConfirm(list.slice());
                confirmed = true;
                say("Skills confirmed and saved.");
            } catch (error) {
                // the server's message is always shown
                say(error?.message || "Could not save your skills. Please try again.");
            } finally {
                confirmButton.textContent = original;
                updateMeta();
            }
        });

        const api = {
            getSkills: () => list.slice(),
            isConfirmed: () => confirmed,
            setSkills(next) {
                list = [];
                (next || []).forEach(addSkill);
                confirmed = false;
                say("");
                render();
            },
            setLoading(value) {
                isLoading = Boolean(value);
                render();
            }
        };

        isLoading = loading;
        (skills || []).forEach(addSkill);
        render();

        return api;
    }

    /* ---------------- BACKEND (mock until the routes exist) ---------------- */

    function authHeaders(extra = {}) {
        const token =
            sessionStorage.getItem("smartInternToken") ||
            sessionStorage.getItem("access_token") || "";

        return { Authorization: `Bearer ${token}`, ...extra };
    }

    const SAMPLE_SKILLS = ["python", "sql", "git", "rest api", "html", "css"];

    // Resume file or text -> ["python", "sql", ...]
    async function extractSkills(source) {
        if (config.useMock || !config.endpoints.extract) {
            await new Promise(resolve => setTimeout(resolve, 1600));   // "takes a second or two"
            return SAMPLE_SKILLS.slice();
        }

        const body = new FormData();
        if (source instanceof File) body.append("resume", source);

        const data = await apiRequest(config.endpoints.extract, {
            method: "POST",
            headers: authHeaders(),
            body
        });

        return data.skills || [];
    }

    // The user confirmed the chips -> save them
    async function confirmSkills(skills) {
        if (config.useMock || !config.endpoints.confirm) {
            localStorage.setItem("smartInternConfirmedSkills", JSON.stringify(skills));
            return { skills };
        }

        return apiRequest(config.endpoints.confirm, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ skills })
        });
    }

    function getSavedSkills() {
        try {
            const stored = localStorage.getItem("smartInternConfirmedSkills");
            return stored === null ? null : JSON.parse(stored);
        } catch (error) {
            return null;
        }
    }

    window.SmartAI = {
        config,
        NOTE_TEXT,
        formatSkill,
        normalizeSkill,
        escapeHTML,
        computeMatch,
        matchLevel,
        matchBadge,
        gapLine,
        matchTooltip,
        noteElement,
        emptyHintElement,
        createChipEditor,
        extractSkills,
        confirmSkills,
        getSavedSkills
    };

})();
