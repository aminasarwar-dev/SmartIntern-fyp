/* =========================================================
   SMARTINTERN CUSTOM LOGOUT MODAL
   ---------------------------------------------------------
   Same on every student and company page:
   click "Logout" -> a modal asks -> Cancel or Logout.
   Nothing else happens. Page scripts that had their own
   logout code are bypassed (this handler runs first).
   ========================================================= */

(function () {

    "use strict";

    let modal = null;
    let cancelBtn = null;
    let confirmBtn = null;

    function ensureStyles() {

        if (document.querySelector('link[href$="logout-model.css"]')) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../css/logout-model.css";
        document.head.appendChild(link);

    }


    function build() {

        if (modal && document.body.contains(modal)) {
            return;
        }

        ensureStyles();

        modal = document.createElement("div");
        modal.className = "logout-modal";

        modal.innerHTML = `

            <div
                class="logout-modal-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logoutModalTitle"
            >

                <div class="logout-modal-content">

                    <h2 id="logoutModalTitle">
                        Are you sure <em>to logout?</em>
                    </h2>

                    <p>
                        You will be signed out of your SmartIntern account.
                    </p>

                </div>

                <div class="logout-modal-actions">

                    <button
                        type="button"
                        class="logout-modal-btn logout-cancel-btn"
                        id="logoutCancelBtn"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="logout-modal-btn logout-confirm-btn"
                        id="logoutConfirmBtn"
                    >
                        Logout
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(modal);

        cancelBtn = modal.querySelector("#logoutCancelBtn");
        confirmBtn = modal.querySelector("#logoutConfirmBtn");

        cancelBtn.addEventListener("click", closeModal);

        modal.addEventListener("mousedown", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        confirmBtn.addEventListener("click", () => {

            try {
                sessionStorage.clear();
                localStorage.removeItem("smartInternUser");
                localStorage.removeItem("smartInternRole");
            } catch (error) { /* ignore */ }

            window.location.href = "login.html";

        });

    }


    function openModal() {

        build();

        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        setTimeout(() => cancelBtn && cancelBtn.focus(), 100);

    }


    function closeModal() {

        if (!modal) {
            return;
        }

        modal.classList.remove("show");
        document.body.style.overflow = "";

    }


    /*
     * Capture phase on the document: this runs BEFORE any
     * click handler a page added to the Logout link, so every
     * page behaves exactly the same.
     */

    document.addEventListener(
        "click",
        event => {

            const link = event.target.closest
                ? event.target.closest("#logoutLink")
                : null;

            if (!link) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            openModal();

        },
        true
    );


    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && modal && modal.classList.contains("show")) {
            closeModal();
        }

    });

})();
