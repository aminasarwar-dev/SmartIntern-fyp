/* =========================================================
   SMARTINTERN
   STUDENT — INTERNSHIP DETAILS  (connected to the backend)
   ---------------------------------------------------------
   Address:  /internship-detail?id=12
   Calls:    GET /student/internships/{id}

   - Fills the page from the server.
   - "Apply now" opens the same apply popup as the Browse page.
   - Closed / expired / hidden internships give 404 -> message.
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {

    const helpers = window.StudentInternships;

    const byId = id => document.getElementById(id);

    const stateBox = byId("detailState");
    const bodyBox = byId("detailBody");
    const applyButton = byId("detailApply");

    let item = null;


    /* ---------------- helpers ---------------- */

    function setText(id, value) {
        const node = byId(id);
        if (node) { node.textContent = value; }
    }

    /* shows the <li data-fact> only when it has a value */
    function setFact(listId, name, value) {

        const row = byId(listId).querySelector('[data-fact="' + name + '"]');
        const span = row.querySelector("span");
        const has = value !== null && value !== undefined && String(value).trim() !== "";

        span.textContent = has ? String(value) : "";
        row.hidden = !has;
    }

    function fillList(boxId, listId, lines) {

        const list = byId(listId);

        list.replaceChildren();

        lines.forEach(line => {
            const li = document.createElement("li");
            li.textContent = line;
            list.appendChild(li);
        });

        byId(boxId).hidden = lines.length === 0;
    }

    function fail(title, message) {

        setText("detailTitle", title);
        setText("detailCompany", "");
        byId("detailTags").replaceChildren();

        stateBox.textContent = message;
        stateBox.hidden = false;
        bodyBox.hidden = true;
    }

    function workText(detail) {

        if (detail.work_arrangement === "Remote") {
            return ["Remote", detail.remote_region, detail.remote_timezone]
                .filter(Boolean).join(" · ");
        }

        return [detail.work_arrangement, detail.office_city, detail.office_address]
            .filter(Boolean).join(" · ");
    }

    function educationText(detail) {

        return [detail.education_level, detail.academic_background]
            .filter(Boolean).join(" · ");
    }


    /* ---------------- draw the page ---------------- */

    function render(detail) {

        setText("detailTitle", detail.title);

        // "Remote" is both the location and the work type -> show it once
        const arrangement =
            detail.work_arrangement === detail.location ? "" : detail.work_arrangement;

        setText(
            "detailCompany",
            [detail.company_name, detail.location, arrangement]
                .filter(Boolean).join(" · ")
        );

        const tags = byId("detailTags");
        tags.replaceChildren();
        (detail.skills || []).forEach(skill => {
            const span = document.createElement("span");
            span.textContent = skill;
            tags.appendChild(span);
        });

        setText("detailDescription", detail.description || "");

        fillList("detailResponsibilitiesBox", "detailResponsibilities",
            helpers.splitLines(detail.responsibilities));
        fillList("detailRequirementsBox", "detailRequirements",
            helpers.splitLines(detail.requirements));

        setFact("detailFacts", "work", workText(detail));
        setFact("detailFacts", "duration", detail.duration);
        setFact("detailFacts", "schedule", detail.schedule);
        setFact("detailFacts", "hours", detail.hours_per_week);
        setFact("detailFacts", "start", helpers.dateText(detail.start_date));
        setFact("detailFacts", "positions", detail.positions);
        setFact("detailFacts", "education", educationText(detail));
        setFact("detailFacts", "stipend", helpers.stipendText(detail));
        setFact("detailFacts", "deadline", helpers.dateText(detail.application_deadline));

        /* company part (public information only) */
        const company = detail.company || {};

        byId("detailCompanyBox").hidden = !(
            company.description || company.industry || company.location || company.website
        );

        setText("detailCompanyAbout", company.description || "");
        setFact("detailCompanyFacts", "industry", company.industry);
        setFact("detailCompanyFacts", "location", company.location);

        /* website: a link, but only for http / https addresses */
        const websiteRow = byId("detailCompanyFacts").querySelector('[data-fact="website"]');
        const websiteSpan = websiteRow.querySelector("span");
        websiteSpan.replaceChildren();
        websiteRow.hidden = true;

        if (company.website && /^https?:\/\//i.test(company.website)) {
            const link = document.createElement("a");
            link.href = company.website;
            link.textContent = company.website;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            websiteSpan.appendChild(link);
            websiteRow.hidden = false;
        }

        /* apply button */
        if (!detail.can_apply || detail.has_applied) {
            applyButton.textContent = "Already applied";
            applyButton.setAttribute("aria-disabled", "true");
        }
    }


    /* ---------------- apply ---------------- */

    applyButton.addEventListener("click", event => {

        event.preventDefault();

        if (!item || applyButton.getAttribute("aria-disabled") === "true") { return; }
        if (!window.SmartApply) { return; }

        window.SmartApply.open(helpers.toApplyItem(item), { directApply: true });
    });


    /* ---------------- load ---------------- */

    const id = new URLSearchParams(window.location.search).get("id");

    if (!id || !/^\d+$/.test(id)) {
        fail("Internship not found", "This link is not valid. Please choose an internship from the list.");
        return;
    }

    try {

        item = await getStudentInternshipAPI(id);

        render(item);

    } catch (error) {

        if (error.status === 401) {
            if (window.SmartInternSession) { window.SmartInternSession.clear(); }
            window.location.replace("/login");
            return;
        }

        if (error.status === 404) {
            fail(
                "Internship not found",
                "This internship is closed, expired or no longer available."
            );
            return;
        }

        fail(
            "Could not load the internship",
            error.message || "Please check your connection and try again."
        );
    }

});
