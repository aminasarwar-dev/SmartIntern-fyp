/* =========================================================
   SMARTINTERN — AI SCREENS
   ---------------------------------------------------------
   Puts the AI pieces (js/ai-ui.js) on the pages:

     student-profile.html            editable skill chips
     resume-upload.html              loading -> chips -> confirm
     student-browse-internships.html match badge, missing skills,
                                     sorted by match, empty hint
     ai-candidate-matches.html       ranked by match + the note

   Until the AI routes exist these screens use SmartAI.config.useMock.
   The match on the browse page is computed in the browser from each
   card's listed skills and the student's confirmed skills (same
   shape the backend will return: match_pct / matched / gap).
========================================================= */
(function () {

    "use strict";

    const AI = window.SmartAI;

    if (!AI) {
        return;
    }

    const page = window.location.pathname.split("/").pop().replace(".html", "");

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    /* ---------------- STUDENT PROFILE: skills as chips ---------------- */

    function initProfile() {
        const box = document.querySelector(".skills-box");

        if (!box) return;

        const section = box.closest(".profile-card");
        if (section) section.id = "skills";

        // Start from what the student confirmed before, else the chips in the page
        const written = [...box.querySelectorAll(".profile-skill")]
            .map(chip => AI.normalizeSkill(chip.textContent));

        const saved = AI.getSavedSkills();

        const editor = AI.createChipEditor(box, {
            skills: saved !== null ? saved : written,
            confirmText: "Confirm skills",
            onConfirm: skills => AI.confirmSkills(skills)
        });

        if (window.location.hash === "#skills" && section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        return editor;
    }

    /* ---------------- RESUME UPLOAD: loading -> chips -> confirm ---------------- */

    function initResume() {
        const anchor = document.querySelector(".resume-tip");

        if (!anchor) return;

        let panel = null;
        let editor = null;

        function buildPanel() {
            panel = document.createElement("section");
            panel.className = "ai-review-panel";
            panel.id = "skillReview";

            const title = document.createElement("h3");
            title.textContent = "Review your skills";

            const intro = document.createElement("p");
            intro.textContent =
                "We read your resume and found these skills. Please check them. " +
                "Your matches are calculated only after you confirm.";

            const mount = document.createElement("div");

            panel.append(title, intro, mount);
            anchor.before(panel);

            editor = AI.createChipEditor(mount, {
                loading: true,
                confirmText: "Confirm and find my matches",
                onConfirm: async skills => {
                    await AI.confirmSkills(skills);
                }
            });
        }

        async function run(file) {
            if (!panel) buildPanel();

            editor.setLoading(true);
            panel.scrollIntoView({ behavior: "smooth", block: "center" });

            try {
                editor.setSkills(await AI.extractSkills(file));
            } catch (error) {
                editor.setSkills([]);
            }

            editor.setLoading(false);
        }

        document.addEventListener("smartintern:resume-uploaded", event => {
            run(event.detail?.file);
        });
    }

    /* ---------------- BROWSE: match badge, gap, sort, empty hint ---------------- */

    function initBrowse() {
        const grid = document.getElementById("internshipGrid");

        if (!grid) return;

        const forcedEmpty = new URLSearchParams(window.location.search).get("demo") === "empty";
        const saved = AI.getSavedSkills();

        // Skills the student confirmed. Before anything is saved, use the profile sample.
        const studentSkills = forcedEmpty
            ? []
            : (saved !== null
                ? saved
                : ["html", "css", "javascript", "git", "ui / ux"]);

        const hasSkills = studentSkills.length > 0;

        const cards = [...grid.querySelectorAll(".browse-card")];

        cards.forEach(card => {
            const required = [...card.querySelectorAll(".skill-list span")]
                .map(span => span.textContent);

            const match = AI.computeMatch(required, studentSkills);
            card.dataset.match = match.match_pct;

            const badge = card.querySelector(".match-score");

            if (badge) {
                badge.textContent = hasSkills ? `${formatPct(match.match_pct)}% Match` : "Add skills";
                badge.title = AI.matchTooltip(match);
                badge.classList.remove("is-high", "is-mid", "is-low");
                badge.classList.add(`is-${AI.matchLevel(match.match_pct)}`);
            }

            // replace the fixed "Strong skill match" text with the real gap
            const note = card.querySelector(".ai-note");

            if (note) {
                note.innerHTML = hasSkills
                    ? AI.gapLine(match.gap)
                    : '<span class="ai-gap-line">Add your skills to see your match</span>';
            }
        });

        // Best match first
        cards
            .sort((a, b) => Number(b.dataset.match) - Number(a.dataset.match))
            .forEach(card => grid.appendChild(card));

        const heading = document.querySelector(".results-heading");

        if (heading) {
            const wrapper = document.createElement("div");
            wrapper.className = "ai-screen-extra";

            if (!hasSkills) wrapper.appendChild(AI.emptyHintElement());
            wrapper.appendChild(AI.noteElement());

            heading.after(wrapper);
        }
    }

    function formatPct(value) {
        return Number.isInteger(value) ? value : value.toFixed(1);
    }

    /* ---------------- COMPANY: ranked candidates + note ---------------- */

    function initCandidates() {
        const grid = document.getElementById("candidateGrid");

        if (!grid) return;

        // Highest match first
        [...grid.querySelectorAll(".ai-candidate-card")]
            .sort((a, b) => Number(b.dataset.score) - Number(a.dataset.score))
            .forEach(card => grid.appendChild(card));

        const heading = document.querySelector(".ai-results-heading");

        if (heading) {
            const note = AI.noteElement();
            note.style.marginTop = "14px";
            heading.after(note);
        }

        // Every match badge explains that it is only an aid
        grid.querySelectorAll(".ai-score-badge").forEach(badge => {
            badge.title = AI.NOTE_TEXT;
        });
    }

    ready(() => {
        if (page === "student-profile") initProfile();
        if (page === "resume-upload") initResume();
        if (page === "student-browse-internships") initBrowse();
        if (page === "ai-candidate-matches") initCandidates();
    });

})();
