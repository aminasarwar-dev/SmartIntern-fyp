/* =========================================================
   SMARTINTERN — DIALOGS (replaces confirm / prompt / alert)
   ---------------------------------------------------------
   Load in <head> with  <link href="../css/dialog.css">  and
   <script src="../js/dialog.js"></script>

     const ok   = await SmartDialog.confirm({ title, message, confirmText, danger });
     const text = await SmartDialog.prompt({ title, message, label, placeholder, required });
                  -> string, or null when cancelled
     SmartDialog.alert(message, title)

   window.alert() is also routed here, so old alert("...") calls
   show a styled message instead of the browser popup.
========================================================= */
(function () {

    "use strict";

    let root = null;
    let queue = Promise.resolve();

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function ensureRoot() {
        if (root && document.body.contains(root)) return root;

        root = el("div", "sd-overlay");
        root.setAttribute("aria-hidden", "true");
        document.body.appendChild(root);

        return root;
    }

    // Opens one dialog and resolves with whatever `build` passes to done().
    function open(build) {
        const run = () => new Promise(resolve => {
            const overlay = ensureRoot();
            overlay.innerHTML = "";

            const card = el("section", "sd-card");
            card.setAttribute("role", "dialog");
            card.setAttribute("aria-modal", "true");

            const previousFocus = document.activeElement;

            function done(value) {
                overlay.classList.remove("show");
                overlay.setAttribute("aria-hidden", "true");
                document.removeEventListener("keydown", onKey, true);
                overlay.innerHTML = "";

                if (previousFocus && previousFocus.focus) {
                    try { previousFocus.focus(); } catch (error) { /* ignore */ }
                }

                resolve(value);
            }

            let cancelValue = null;

            function onKey(event) {
                if (event.key === "Escape") {
                    event.stopPropagation();
                    done(cancelValue);
                }
            }

            const api = {
                card,
                done,
                setCancelValue: value => { cancelValue = value; }
            };

            build(api);

            overlay.appendChild(card);
            overlay.onclick = event => {
                if (event.target === overlay) done(cancelValue);
            };

            document.addEventListener("keydown", onKey, true);
            overlay.classList.add("show");
            overlay.setAttribute("aria-hidden", "false");

            const focusTarget =
                card.querySelector("[data-autofocus]") ||
                card.querySelector("button");

            if (focusTarget) focusTarget.focus();
        });

        // One dialog at a time
        const result = queue.then(run);
        queue = result.catch(() => {});

        return result;
    }

    function header(card, title, message) {
        card.appendChild(el("h2", "sd-title", title));

        if (message) {
            card.appendChild(el("p", "sd-text", message));
        }
    }

    function confirmDialog(options = {}) {
        const {
            title = "Are you sure?",
            message = "",
            confirmText = "Confirm",
            cancelText = "Cancel",
            danger = false
        } = typeof options === "string" ? { message: options } : options;

        return open(({ card, done, setCancelValue }) => {
            setCancelValue(false);
            header(card, title, message);

            const actions = el("div", "sd-actions");
            const cancel = el("button", "sd-btn", cancelText);
            cancel.type = "button";
            cancel.onclick = () => done(false);

            const ok = el("button", "sd-btn primary" + (danger ? " danger" : ""), confirmText);
            ok.type = "button";
            ok.onclick = () => done(true);

            actions.append(cancel, ok);
            card.appendChild(actions);
        });
    }

    function promptDialog(options = {}) {
        const {
            title = "Enter a value",
            message = "",
            label = "",
            placeholder = "",
            confirmText = "Submit",
            cancelText = "Cancel",
            required = false,
            multiline = true,
            danger = false
        } = typeof options === "string" ? { message: options } : options;

        return open(({ card, done, setCancelValue }) => {
            setCancelValue(null);
            header(card, title, message);

            const field = el("div", "sd-field");
            const inputId = "sdInput" + Date.now();

            if (label) {
                const labelEl = el("label", "", label);
                labelEl.setAttribute("for", inputId);
                field.appendChild(labelEl);
            }

            const input = document.createElement(multiline ? "textarea" : "input");
            input.id = inputId;
            input.placeholder = placeholder;
            input.setAttribute("data-autofocus", "");

            if (multiline) input.rows = 3;
            else input.type = "text";

            const error = el("p", "sd-error");
            error.setAttribute("role", "alert");

            field.append(input, error);
            card.appendChild(field);

            const actions = el("div", "sd-actions");
            const cancel = el("button", "sd-btn", cancelText);
            cancel.type = "button";
            cancel.onclick = () => done(null);

            const ok = el("button", "sd-btn primary" + (danger ? " danger" : ""), confirmText);
            ok.type = "button";
            ok.onclick = () => {
                const value = input.value.trim();

                if (required && !value) {
                    error.textContent = "This field is required.";
                    input.focus();
                    return;
                }

                done(value);
            };

            input.addEventListener("input", () => { error.textContent = ""; });

            if (!multiline) {
                input.addEventListener("keydown", event => {
                    if (event.key === "Enter") ok.click();
                });
            }

            actions.append(cancel, ok);
            card.appendChild(actions);
        });
    }

    function alertDialog(message, title = "Notice") {
        return open(({ card, done, setCancelValue }) => {
            setCancelValue(true);
            header(card, title, String(message ?? ""));

            const actions = el("div", "sd-actions");
            const ok = el("button", "sd-btn primary", "OK");
            ok.type = "button";
            ok.onclick = () => done(true);
            actions.appendChild(ok);
            card.appendChild(actions);
        });
    }

    window.SmartDialog = {
        confirm: confirmDialog,
        prompt: promptDialog,
        alert: alertDialog
    };

    // Old alert("...") calls get the styled dialog (non-blocking).
    window.alert = function (message) {
        if (document.body) {
            alertDialog(message);
        } else {
            document.addEventListener("DOMContentLoaded", () => alertDialog(message));
        }
    };

})();
