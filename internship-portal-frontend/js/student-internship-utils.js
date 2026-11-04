/* =========================================================
   SMARTINTERN — STUDENT INTERNSHIP HELPERS
   ---------------------------------------------------------
   Small helpers shared by the Browse page and the Details page.
   They turn what the backend sends (StudentInternshipCard /
   StudentInternshipDetail) into the text the screens show and
   into the object the Apply popup (apply-flow.js) expects.

   Used as:  window.StudentInternships.xxx
========================================================= */
(function () {

    "use strict";

    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    /* "2026-11-30" -> "30 Nov 2026"  (no Date object, so no timezone shift) */
    function dateText(value) {

        var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));

        if (!match) {
            return "";
        }

        return Number(match[3]) + " " + MONTHS[Number(match[2]) - 1] + " " + match[1];
    }

    /* "Paid" + 30000 + "PKR" -> "PKR 30,000 / month" */
    function stipendText(item) {

        if (!item) {
            return "";
        }

        if (item.compensation_type === "Paid") {

            if (item.stipend_amount !== null && item.stipend_amount !== undefined) {
                return (item.stipend_currency || "PKR") + " " +
                    Number(item.stipend_amount).toLocaleString("en-US") + " / month";
            }

            return "Paid";
        }

        return item.compensation_type || "";
    }

    /* "Remote" + "Paid" -> "Remote · Paid" */
    function typeLabel(item) {

        return [item.work_arrangement, item.compensation_type]
            .filter(Boolean)
            .join(" · ");
    }

    function initialOf(name) {

        return String(name || "?").trim().charAt(0).toUpperCase() || "?";
    }

    /* the logo colour depends on the company name, so it stays the same */
    function logoClass(name) {

        var classes = ["logo-purple", "logo-pink", "logo-plum", "logo-soft"];
        var sum = 0;

        String(name || "").split("").forEach(function (char) {
            sum += char.charCodeAt(0);
        });

        return classes[sum % classes.length];
    }

    /* A text typed in a textarea -> list of lines (bullets / numbers removed) */
    function splitLines(text) {

        return String(text || "")
            .split(/\r?\n/)
            .map(function (line) {
                return line.replace(/^\s*(?:[-•*·–]|\d+[.)])\s*/, "").trim();
            })
            .filter(Boolean);
    }

    /* Backend detail  ->  object for window.SmartApply.open(...) */
    function toApplyItem(detail) {

        var skills = (detail.skills || []).map(function (skill) {
            return String(skill).toLowerCase();
        });

        var gap = [];

        if (window.SmartAI && window.SmartAI.getSavedSkills) {

            var saved = window.SmartAI.getSavedSkills();

            if (saved) {
                gap = window.SmartAI.computeMatch(skills, saved).gap;
            }
        }

        return {
            id: detail.id,
            title: detail.title,
            company: detail.company_name,
            initial: initialOf(detail.company_name),
            typeLabel: typeLabel(detail),
            location: detail.location || "",
            duration: detail.duration || "",
            skills: skills,
            matchPct: detail.match_pct,
            gap: gap,
            about: detail.description || "",
            responsibilities: splitLines(detail.responsibilities),
            requirements: splitLines(detail.requirements),
            perks: [],
            stipend: stipendText(detail),
            deadline: dateText(detail.application_deadline),
            hasApplied: Boolean(detail.has_applied)
        };
    }

    window.StudentInternships = {
        dateText: dateText,
        stipendText: stipendText,
        typeLabel: typeLabel,
        initialOf: initialOf,
        logoClass: logoClass,
        splitLines: splitLines,
        toApplyItem: toApplyItem
    };

})();
