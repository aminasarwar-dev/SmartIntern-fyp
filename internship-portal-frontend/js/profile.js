/* =========================================================
   SMARTINTERN PROFILE SETUP
   Student + Company
   Backend API Integrated
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initRoleSwitch();

    initGraduationFields();

    initProfessionalLinks();

    initFileInputs();

    initProfileForm();

    initPageAnimation();

    loadSavedRole();

});


/* =========================================================
   ROLE SWITCH
   ========================================================= */

function initRoleSwitch() {

    const roleButtons =
        document.querySelectorAll(".profile-role-btn");

    const studentFields =
        document.getElementById("studentFields");

    const companyFields =
        document.getElementById("companyFields");

    const subtitle =
        document.getElementById("profileSubtitle");


    roleButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const role = button.dataset.role;


            roleButtons.forEach((item) => {
                item.classList.remove("active");
            });


            button.classList.add("active");


            if (role === "student") {

                studentFields.classList.remove("hidden");

                companyFields.classList.add("hidden");


                if (subtitle) {
                    subtitle.textContent =
                        "Tell us a little about yourself.";
                }


                sessionStorage.setItem(
                    "smartInternRole",
                    "student"
                );

            }


            if (role === "company") {

                companyFields.classList.remove("hidden");

                studentFields.classList.add("hidden");


                if (subtitle) {
                    subtitle.textContent =
                        "Tell us a little about your company.";
                }


                sessionStorage.setItem(
                    "smartInternRole",
                    "company"
                );

            }

        });

    });

}


/* =========================================================
   LOAD SAVED ROLE
   ========================================================= */

function loadSavedRole() {

    const savedRole =
        sessionStorage.getItem("smartInternRole");


    if (!savedRole) {
        return;
    }


    const button =
        document.querySelector(
            `.profile-role-btn[data-role="${savedRole}"]`
        );


    if (button) {
        button.click();
    }

}


/* =========================================================
   GRADUATION FIELDS
   ========================================================= */

function initGraduationFields() {

    const graduationStatus =
        document.getElementById("graduationStatus");


    if (!graduationStatus) {
        return;
    }


    graduationStatus.addEventListener(
        "change",
        updateGraduationFields
    );


    updateGraduationFields();

}


/* =========================================================
   UPDATE GRADUATION FIELDS
   ========================================================= */

function updateGraduationFields() {

    const graduationStatus =
        document.getElementById("graduationStatus");


    if (!graduationStatus) {
        return;
    }


    const status =
        graduationStatus.value;


    const semesterField =
        document.getElementById("semesterField");

    const graduationYearField =
        document.getElementById("graduationYearField");

    const graduationDateField =
        document.getElementById("graduationDateField");


    if (semesterField) {
        semesterField.classList.add("hidden");
    }


    if (graduationYearField) {
        graduationYearField.classList.add("hidden");
    }


    if (graduationDateField) {
        graduationDateField.classList.add("hidden");
    }


    /* =========================
       GRADUATED
    ========================= */

    if (status === "yes") {

        if (graduationYearField) {
            graduationYearField.classList.remove("hidden");
        }


        if (graduationDateField) {
            graduationDateField.classList.remove("hidden");
        }

    }


    /* =========================
       NOT GRADUATED
    ========================= */

    if (status === "no") {

        if (semesterField) {
            semesterField.classList.remove("hidden");
        }

    }

}


/* =========================================================
   PROFESSIONAL LINKS
   ========================================================= */

function initProfessionalLinks() {

    const professionalLinks =
        document.getElementById("professionalLinks");

    const linksFields =
        document.getElementById("professionalLinksFields");


    if (!professionalLinks || !linksFields) {
        return;
    }


    professionalLinks.addEventListener("change", () => {

        if (professionalLinks.value === "show") {

            linksFields.classList.remove("hidden");

        }

        else {

            linksFields.classList.add("hidden");

        }

    });

}


/* =========================================================
   FILE INPUTS
   ========================================================= */

function initFileInputs() {

    /* =========================
       RESUME
    ========================= */

    const resume =
        document.getElementById("resume");

    const resumeName =
        document.getElementById("resumeName");


    if (resume) {

        resume.addEventListener("change", () => {

            const file =
                resume.files[0];


            if (file) {

                if (resumeName) {

                    resumeName.textContent =
                        file.name;

                }

            }

            else {

                if (resumeName) {

                    resumeName.textContent =
                        "No file selected";

                }

            }

        });

    }


    /* =========================
       TRADE LICENSE
    ========================= */

    const tradeLicense =
        document.getElementById(
            "tradeLicenseDocument"
        );

    const tradeLicenseName =
        document.getElementById(
            "tradeLicenseDocumentName"
        );


    if (tradeLicense) {

        tradeLicense.addEventListener("change", () => {

            const file =
                tradeLicense.files[0];


            if (file) {

                if (tradeLicenseName) {

                    tradeLicenseName.textContent =
                        file.name;

                }

            }

            else {

                if (tradeLicenseName) {

                    tradeLicenseName.textContent =
                        "No file selected";

                }

            }

        });

    }

}


/* =========================================================
   PROFILE FORM
   ========================================================= */

function initProfileForm() {

    const form =
        document.getElementById("profileForm");


    if (!form) {
        return;
    }


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearErrors();


        const role =
            sessionStorage.getItem(
                "smartInternRole"
            ) || getActiveRole();


        if (role === "student") {

            await handleStudentSubmit();

        }

        else if (role === "company") {

            await handleCompanySubmit();

        }

        else {

            showRoleError(
                "Please select Student or Company."
            );

        }

    });

}


/* =========================================================
   GET ACTIVE ROLE
   ========================================================= */

function getActiveRole() {

    const activeButton =
        document.querySelector(
            ".profile-role-btn.active"
        );


    if (!activeButton) {
        return "";
    }


    return activeButton.dataset.role;

}


/* =========================================================
   STUDENT SUBMIT
   ========================================================= */

async function handleStudentSubmit() {

    let valid = true;


    /* =========================
       BASIC INFORMATION
    ========================= */

    const name =
        getValue("studentName");

    const email =
        getValue("studentEmail");

    const password =
        getValue("studentPassword");

    const phone =
        getValue("studentPhone");

    const university =
        getValue("university");

    const degree =
        getValue("degree");

    const graduationStatus =
        getValue("graduationStatus");

    const semester =
        getValue("semester");

    const graduationYear =
        getValue("graduationYear");

    const graduationDate =
        getValue("graduationDate");

    const skills =
        getValue("skills");

    const location =
        getValue("studentLocation");


    const resume =
        document.getElementById("resume");


    /* =========================
       NAME
    ========================= */

    if (!name) {

        showError(
            "studentNameError",
            "Please enter your full name."
        );

        valid = false;

    }


    /* =========================
       EMAIL
    ========================= */

    if (!email) {

        showError(
            "studentEmailError",
            "Please enter your email."
        );

        valid = false;

    }

    else if (!isValidEmail(email)) {

        showError(
            "studentEmailError",
            "Please enter a valid email address."
        );

        valid = false;

    }


    /* =========================
       PASSWORD
    ========================= */

    if (!password) {

        showError(
            "studentPasswordError",
            "Please enter your password."
        );

        valid = false;

    }


    /* =========================
       PHONE
    ========================= */

    if (!phone) {

        showError(
            "studentPhoneError",
            "Please enter your phone number."
        );

        valid = false;

    }


    /* =========================
       UNIVERSITY
    ========================= */

    if (!university) {

        showError(
            "universityError",
            "Please enter your university."
        );

        valid = false;

    }


    /* =========================
       DEGREE
    ========================= */

    if (!degree) {

        showError(
            "degreeError",
            "Please select your degree."
        );

        valid = false;

    }


    /* =========================
       GRADUATION STATUS
    ========================= */

    if (!graduationStatus) {

        showError(
            "graduationStatusError",
            "Please select your graduation status."
        );

        valid = false;

    }


    /* =========================
       NOT GRADUATED
    ========================= */

    if (graduationStatus === "no") {

        if (!semester) {

            showError(
                "semesterError",
                "Please select your current semester."
            );

            valid = false;

        }

    }


    /* =========================
       GRADUATED
    ========================= */

    if (graduationStatus === "yes") {

        if (!graduationYear) {

            showError(
                "graduationYearError",
                "Please select your graduation year."
            );

            valid = false;

        }


        if (!graduationDate) {

            showError(
                "graduationDateError",
                "Please select your graduation date."
            );

            valid = false;

        }

    }


    /* =========================
       SKILLS
    ========================= */

    if (!skills) {

        showError(
            "skillsError",
            "Please enter your skills."
        );

        valid = false;

    }


    /* =========================
       LOCATION
    ========================= */

    if (!location) {

        showError(
            "studentLocationError",
            "Please enter your location."
        );

        valid = false;

    }


    /* =========================
       RESUME
    ========================= */

    const resumeFile =
        resume?.files?.[0];


    if (!resumeFile) {

        showError(
            "resumeError",
            "Please upload your CV / Resume."
        );

        valid = false;

    }

    else {

        const allowedResumeTypes = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];


        const maxSize =
            5 * 1024 * 1024;


        if (
            !allowedResumeTypes.includes(
                resumeFile.type
            )
        ) {

            showError(
                "resumeError",
                "Please upload PDF, DOC or DOCX."
            );

            valid = false;

        }


        if (resumeFile.size > maxSize) {

            showError(
                "resumeError",
                "CV / Resume must be less than 5MB."
            );

            valid = false;

        }

    }


    /* =========================
       STOP IF INVALID
    ========================= */

    if (!valid) {
        return;
    }


    /* =========================
       OPTIONAL LINKS
    ========================= */

    const linkedin =
        getValue("linkedin");

    const github =
        getValue("github");

    const portfolio =
        getValue("portfolio");


    /* =====================================================
       CREATE FORM DATA FOR FASTAPI
       Backend: POST /student/signup
       ===================================================== */

    const formData =
        new FormData();


    formData.append(
        "name",
        name
    );


    formData.append(
        "email",
        email
    );


    formData.append(
        "password",
        password
    );


    formData.append(
        "phone",
        phone
    );


    formData.append(
        "university",
        university
    );


    formData.append(
        "degree",
        degree
    );


    formData.append(
        "graduation_status",
        graduationStatus
    );


    formData.append(
        "semester",
        graduationStatus === "no"
            ? semester
            : ""
    );


    formData.append(
        "graduation_year",
        graduationStatus === "yes"
            ? graduationYear
            : ""
    );


    formData.append(
        "graduation_date",
        graduationStatus === "yes"
            ? graduationDate
            : ""
    );


    formData.append(
        "skills",
        skills
    );


    formData.append(
        "location",
        location
    );


    formData.append(
        "linkedin",
        linkedin
    );


    formData.append(
        "github",
        github
    );


    formData.append(
        "portfolio",
        portfolio
    );


    if (resumeFile) {

        formData.append(
            "resume",
            resumeFile
        );

    }


    /* =====================================================
       SEND STUDENT SIGNUP REQUEST
       ===================================================== */

    try {

        const result =
            await apiFormRequest(
                "/student/signup",
                formData
            );


        /* =========================
           SAVE TOKEN
        ========================= */

        if (result.access_token) {

            sessionStorage.setItem(
                "smartInternToken",
                result.access_token
            );

        }


        /* =========================
           SAVE ROLE
        ========================= */

        sessionStorage.setItem(
            "smartInternRole",
            "student"
        );


        /* =========================
           SAVE BACKEND STUDENT
        ========================= */

        if (result.student) {

            sessionStorage.setItem(
                "smartInternStudentProfile",
                JSON.stringify(result.student)
            );

        }


        /* =========================
           GO TO DASHBOARD
        ========================= */

        window.location.href =
            "student-dashboard.html";

    }

    catch (error) {

        showRoleError(
            error.message ||
            "Unable to create your account. Please try again."
        );

    }

}


/* =========================================================
   COMPANY SUBMIT
   ========================================================= */

async function handleCompanySubmit() {

    let valid = true;


    /* =========================
       BASIC INFORMATION
    ========================= */

    const companyName =
        getValue("companyName");

    const email =
        getValue("companyEmail");

    const password =
        getValue("companyPassword");

    const industry =
        getValue("industry");

    const contactPerson =
        getValue("contactPerson");

    const companyPhone =
        getValue("companyPhone");

    const companyLocation =
        getValue("companyLocation");

    const companyWebsite =
        getValue("companyWebsite");

    const companyDescription =
        getValue("companyDescription");


    const tradeLicense =
        document.getElementById(
            "tradeLicenseDocument"
        );


    const licenseIssueDate =
        getValue("licenseIssueDate");

    const licenseExpiryDate =
        getValue("licenseExpiryDate");


    /* =========================
       COMPANY NAME
    ========================= */

    if (!companyName) {

        showError(
            "companyNameError",
            "Please enter your company name."
        );

        valid = false;

    }


    /* =========================
       EMAIL
    ========================= */

    if (!email) {

        showError(
            "companyEmailError",
            "Please enter your email."
        );

        valid = false;

    }

    else if (!isValidEmail(email)) {

        showError(
            "companyEmailError",
            "Please enter a valid email address."
        );

        valid = false;

    }


    /* =========================
       PASSWORD
    ========================= */

    if (!password) {

        showError(
            "companyPasswordError",
            "Please enter your password."
        );

        valid = false;

    }


    /* =========================
       INDUSTRY
    ========================= */

    if (!industry) {

        showError(
            "industryError",
            "Please select your industry."
        );

        valid = false;

    }


    /* =========================
       CONTACT PERSON
    ========================= */

    if (!contactPerson) {

        showError(
            "contactPersonError",
            "Please enter the contact person's name."
        );

        valid = false;

    }


    /* =========================
       PHONE
    ========================= */

    if (!companyPhone) {

        showError(
            "companyPhoneError",
            "Please enter the company contact number."
        );

        valid = false;

    }


    /* =========================
       LOCATION
    ========================= */

    if (!companyLocation) {

        showError(
            "companyLocationError",
            "Please enter the company location."
        );

        valid = false;

    }


    /* =========================
       WEBSITE
    ========================= */

    if (!companyWebsite) {

        showError(
            "companyWebsiteError",
            "Please enter your company website."
        );

        valid = false;

    }

    else if (!isValidWebsite(companyWebsite)) {

        showError(
            "companyWebsiteError",
            "Please enter a valid website URL."
        );

        valid = false;

    }


    /* =========================
       DESCRIPTION
    ========================= */

    if (!companyDescription) {

        showError(
            "companyDescriptionError",
            "Please enter your company description."
        );

        valid = false;

    }


    /* =========================
       TRADE LICENSE
    ========================= */

    const tradeFile =
        tradeLicense?.files?.[0];


    if (!tradeFile) {

        showError(
            "tradeLicenseDocumentError",
            "Please upload the trade license document."
        );

        valid = false;

    }

    else {

        const allowedTradeTypes = [

            "application/pdf",

            "image/jpeg",

            "image/png"

        ];


        const maxSize =
            5 * 1024 * 1024;


        if (
            !allowedTradeTypes.includes(
                tradeFile.type
            )
        ) {

            showError(
                "tradeLicenseDocumentError",
                "Please upload PDF, JPG, JPEG or PNG."
            );

            valid = false;

        }


        if (tradeFile.size > maxSize) {

            showError(
                "tradeLicenseDocumentError",
                "Trade license must be less than 5MB."
            );

            valid = false;

        }

    }


    /* =========================
       LICENSE ISSUE DATE
    ========================= */

    if (!licenseIssueDate) {

        showError(
            "licenseIssueDateError",
            "Please select the license issue date."
        );

        valid = false;

    }


    /* =========================
       LICENSE EXPIRY DATE
    ========================= */

    if (!licenseExpiryDate) {

        showError(
            "licenseExpiryDateError",
            "Please select the license expiry date."
        );

        valid = false;

    }


    /* =========================
       DATE COMPARISON
    ========================= */

    if (
        licenseIssueDate &&
        licenseExpiryDate
    ) {

        const issue =
            new Date(licenseIssueDate);

        const expiry =
            new Date(licenseExpiryDate);


        if (expiry <= issue) {

            showError(
                "licenseExpiryDateError",
                "Expiry date must be after issue date."
            );

            valid = false;

        }

    }


    /* =========================
       STOP IF INVALID
    ========================= */

    if (!valid) {
        return;
    }


    /* =====================================================
       CREATE FORM DATA FOR FASTAPI
       Backend: POST /company/signup
       ===================================================== */

    const formData =
        new FormData();


    formData.append(
        "company_name",
        companyName
    );


    formData.append(
        "email",
        email
    );


    formData.append(
        "password",
        password
    );


    formData.append(
        "industry",
        industry
    );


    formData.append(
        "contact_person",
        contactPerson
    );


    formData.append(
        "phone",
        companyPhone
    );


    formData.append(
        "location",
        companyLocation
    );


    formData.append(
        "website",
        companyWebsite
    );


    formData.append(
        "description",
        companyDescription
    );


    formData.append(
        "license_issue_date",
        licenseIssueDate
    );


    formData.append(
        "license_expiry_date",
        licenseExpiryDate
    );


    if (tradeFile) {

        formData.append(
            "trade_license",
            tradeFile
        );

    }


    /* =====================================================
       SEND COMPANY SIGNUP REQUEST
       ===================================================== */

    try {

        const result =
            await apiFormRequest(
                "/company/signup",
                formData
            );


        /* =========================
           SAVE TOKEN
        ========================= */

        if (result.access_token) {

            sessionStorage.setItem(
                "smartInternToken",
                result.access_token
            );

        }


        /* =========================
           SAVE ROLE
        ========================= */

        sessionStorage.setItem(
            "smartInternRole",
            "company"
        );


        /* =========================
           SAVE BACKEND COMPANY
        ========================= */

        if (result.company) {

            sessionStorage.setItem(
                "smartInternCompanyProfile",
                JSON.stringify(result.company)
            );

        }


        /* =========================
           GO TO DASHBOARD
        ========================= */

        window.location.href =
            "company-dashboard.html";

    }

    catch (error) {

        showRoleError(
            error.message ||
            "Unable to create your company account. Please try again."
        );

    }

}


/* =========================================================
   GET VALUE SAFELY
   ========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


/* =========================================================
   WEBSITE VALIDATION
   ========================================================= */

function isValidWebsite(website) {

    let value =
        website.trim();


    if (
        !value.startsWith("http://") &&
        !value.startsWith("https://")
    ) {

        value =
            "https://" + value;

    }


    try {

        new URL(value);

        return true;

    }

    catch {

        return false;

    }

}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   ROLE ERROR
   ========================================================= */

function showRoleError(message) {

    let error =
        document.querySelector(
            ".profile-role-error"
        );


    if (!error) {

        error =
            document.createElement("span");


        error.className =
            "profile-role-error";


        const role =
            document.querySelector(
                ".profile-role"
            );


        if (role) {

            role.appendChild(error);

        }

    }


    error.textContent =
        message;

}


/* =========================================================
   CLEAR ERRORS
   ========================================================= */

function clearErrors() {

    document
        .querySelectorAll(".profile-error")
        .forEach((error) => {

            error.textContent = "";

        });


    const roleError =
        document.querySelector(
            ".profile-role-error"
        );


    if (roleError) {

        roleError.textContent = "";

    }

}


/* =========================================================
   PAGE ANIMATION
   ========================================================= */

function initPageAnimation() {

    if (
        typeof gsap ===
        "undefined"
    ) {

        return;

    }


    gsap.from(
        ".profile-card",
        {
            opacity: 0,
            y: 35,
            scale: 0.98,
            duration: 0.8,
            ease: "power3.out"
        }
    );


    gsap.from(
        ".profile-heading",
        {
            opacity: 0,
            y: 18,
            duration: 0.6,
            delay: 0.15,
            ease: "power3.out"
        }
    );


    gsap.from(
        ".profile-role",
        {
            opacity: 0,
            y: 12,
            duration: 0.5,
            delay: 0.25,
            ease: "power3.out"
        }
    );


    gsap.from(
        ".profile-input",
        {
            opacity: 0,
            y: 12,
            duration: 0.45,
            stagger: 0.035,
            delay: 0.3,
            ease: "power2.out"
        }
    );

}
