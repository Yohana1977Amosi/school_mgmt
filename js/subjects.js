/* =========================================
   SUBJECTS MANAGEMENT
   School Management System
========================================= */

const storageKey = "schoolManagementSubjects";


/* =========================================
   SAMPLE SUBJECTS
========================================= */

const seedSubjects = [
    {
        id: "s-001",
        subjectName: "Mathematics",
        subjectCode: "MAT",
        department: "Mathematics",
        level: "Secondary",
        subjectType: "Core",
        teacher: "Joseph Mrema",
        status: "Active",
        description: "Mathematics and numerical skills."
    },

    {
        id: "s-002",
        subjectName: "Biology",
        subjectCode: "BIO",
        department: "Science",
        level: "Secondary",
        subjectType: "Core",
        teacher: "Amina Mashauri",
        status: "Active",
        description: "Study of living organisms and life processes."
    },

    {
        id: "s-003",
        subjectName: "Computer Science",
        subjectCode: "CS",
        department: "ICT",
        level: "Secondary",
        subjectType: "Elective",
        teacher: "John William",
        status: "Active",
        description: "Introduction to computers, programming and information technology."
    },

    {
        id: "s-004",
        subjectName: "English",
        subjectCode: "ENG",
        department: "Languages",
        level: "Primary",
        subjectType: "Core",
        teacher: "Mary Joseph",
        status: "Active",
        description: "English language and communication skills."
    }
];


/* =========================================
   SHORT SELECTOR
========================================= */

const $ = (id) => document.getElementById(id);


/* =========================================
   LOAD DATA
========================================= */

let subjects = loadSubjects();

let toastTimer;

/* =========================================
   LOAD TEACHERS FROM TEACHERS MANAGEMENT
========================================= */

function loadTeachersForSubject() {

    const teacherSelect = $("teacher");

    if (!teacherSelect) return;

    teacherSelect.innerHTML = `
        <option value="">
            Select teacher
        </option>
    `;

    try {

        const savedTeachers =
            JSON.parse(
                localStorage.getItem(
                    "schoolManagementTeachers"
                )
            );

        if (!Array.isArray(savedTeachers)) {
            return;
        }

        savedTeachers.forEach(teacher => {

            const option =
                document.createElement("option");

            option.value = teacher.id;

            option.textContent =
                `${teacher.firstName} ${teacher.lastName} (${teacher.staffId})`;

            option.dataset.teacherName =
                `${teacher.firstName} ${teacher.lastName}`;

            teacherSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Unable to load teachers:",
            error
        );

    }

}


/* =========================================
   LOAD SUBJECTS FROM LOCAL STORAGE
========================================= */

function loadSubjects() {

    try {

        const saved =
            JSON.parse(localStorage.getItem(storageKey));

        return Array.isArray(saved)
            ? saved
            : seedSubjects;

    } catch (error) {

        return seedSubjects;

    }

}


/* =========================================
   SAVE SUBJECTS
========================================= */

function saveSubjects() {

    localStorage.setItem(
        storageKey,
        JSON.stringify(subjects)
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value = "") {

    const element =
        document.createElement("span");

    element.textContent = value;

    return element.innerHTML;

}


/* =========================================
   OPEN MODAL
========================================= */

function openModal(id) {

    const modal = $(id);

    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal(id) {

    const modal = $(id);

    if (modal) {

        modal.classList.remove("show");

    }

}


/* =========================================
   SUCCESS MESSAGE
========================================= */

function showSuccess(message) {

    const toast = $("successToast");

    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = "✓ " + message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}


/* =========================================
   RENDER SUBJECTS
========================================= */

function renderSubjects() {

    const searchInput = $("searchSubject");

    const levelFilter = $("levelFilter");

    const typeFilter = $("typeFilter");

    const statusFilter = $("statusFilter");


    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";


    const selectedLevel =
        levelFilter ? levelFilter.value : "";


    const selectedType =
        typeFilter ? typeFilter.value : "";


    const selectedStatus =
        statusFilter ? statusFilter.value : "";


    /* =====================================
       FILTER SUBJECTS
    ====================================== */

    const filteredSubjects =
        subjects.filter(subject => {

            const text = `

                ${subject.subjectName}

                ${subject.subjectCode}

                ${subject.department}

                ${subject.teacher}

                ${subject.level}

                ${subject.subjectType}

            `.toLowerCase();


            return (

                (!search ||
                    text.includes(search))

                &&

                (!selectedLevel ||
                    subject.level === selectedLevel)

                &&

                (!selectedType ||
                    subject.subjectType === selectedType)

                &&

                (!selectedStatus ||
                    subject.status === selectedStatus)

            );

        });


    /* =====================================
       STATISTICS
    ====================================== */

    $("totalSubjects").textContent =
        subjects.length;


    $("coreSubjects").textContent =
        subjects.filter(
            subject =>
                subject.subjectType === "Core"
        ).length;


    $("electiveSubjects").textContent =
        subjects.filter(
            subject =>
                subject.subjectType === "Elective"
        ).length;


    $("activeSubjects").textContent =
        subjects.filter(
            subject =>
                subject.status === "Active"
        ).length;


    /* =====================================
       SUBJECT COUNT
    ====================================== */

    $("subjectCount").textContent =

        `${filteredSubjects.length} subject` +

        `${filteredSubjects.length === 1 ? "" : "s"}`;


    /* =====================================
       TABLE
    ====================================== */

    const tableBody =
        $("subjectsTableBody");


    tableBody.innerHTML =
        filteredSubjects.map(subject => `

            <tr>

                <td>

                    <span class="subject-name">

                        ${escapeHtml(
                            subject.teacherName || "Not assigned"
                        )}

                    </span>

                    <span class="subject-code">

                        ${escapeHtml(
                            subject.description || "No description"
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        subject.subjectCode
                    )}

                </td>


                <td>

                    <span class="department-name">

                        ${escapeHtml(
                            subject.department
                        )}

                    </span>

                </td>


                <td>

                    <span class="level-badge">

                        ${escapeHtml(
                            subject.level
                        )}

                    </span>

                </td>


                <td>

                    <span class="type-badge ${
                        subject.subjectType
                            .toLowerCase()
                    }">

                        ${escapeHtml(
                            subject.subjectType
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        subject.teacher
                    )}

                </td>


                <td>

                    <span class="badge ${
                        subject.status.toLowerCase()
                    }">

                        ${escapeHtml(
                            subject.status
                        )}

                    </span>

                </td>


                <td class="action-buttons">

                    <button
                        type="button"
                        data-action="view"
                        data-id="${subject.id}">

                        View

                    </button>


                    <button
                        type="button"
                        data-action="edit"
                        data-id="${subject.id}">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete"
                        data-action="delete"
                        data-id="${subject.id}">

                        Delete

                    </button>

                </td>

            </tr>

        `).join("");


    /* =====================================
       EMPTY STATE
    ====================================== */

    $("emptyState").hidden =
        filteredSubjects.length !== 0;

}


/* =========================================
   OPEN SUBJECT FORM
========================================= */

function openSubjectForm(subject = null) {

    $("subjectForm").reset();

    $("formError").textContent = "";

    $("subjectRecordId").value =
        subject ? subject.id : "";
         
    loadTeachersForSubject();


    /* =====================================
       CHANGE MODAL TITLE
    ====================================== */

    $("subjectModalTitle").textContent =

        subject
            ? "Edit Subject"
            : "Add Subject";


    $("subjectModalText").textContent =

        subject

            ? "Update this subject's information."

            : "Enter the subject information below.";


    $("saveSubjectButton").textContent =

        subject
            ? "Save Changes"
            : "Save Subject";


    /* =====================================
       FILL FORM WHEN EDITING
    ====================================== */

    if (subject) {

        $("subjectName").value =
            subject.subjectName || "";


        $("subjectCode").value =
            subject.subjectCode || "";


        $("department").value =
            subject.department || "";


        $("level").value =
            subject.level || "";


        $("subjectType").value =
            subject.subjectType || "";


        $("teacher").value =
            subject.teacher || "";


        $("status").value =
            subject.status || "Active";


        $("description").value =
            subject.description || "";

    }


    openModal("subjectModal");

}


/* =========================================
   SHOW SUBJECT PROFILE
========================================= */

function showProfile(subject) {

    const firstLetter =
        subject.subjectName
            ? subject.subjectName.charAt(0).toUpperCase()
            : "S";


    $("profileContent").innerHTML = `

        <div class="profile-body">


            <div class="profile-identity">

                <div class="profile-initials">

                    ${escapeHtml(firstLetter)}

                </div>


                <div>

                    <h3>

                        ${escapeHtml(
                            subject.subjectName
                        )}

                    </h3>

                    <p>

                        ${escapeHtml(
                            subject.subjectCode
                        )}

                        ·

                        ${escapeHtml(
                            subject.department
                        )}

                    </p>

                </div>

            </div>


            <div class="profile-details">


                <div>

                    <p>Subject Name</p>

                    <strong>

                        ${escapeHtml(
                            subject.teacherName || "Not assigned"
                        )}

                    </strong>

                </div>


                <div>

                    <p>Subject Code</p>

                    <strong>

                        ${escapeHtml(
                            subject.subjectCode
                        )}

                    </strong>

                </div>


                <div>

                    <p>Department</p>

                    <strong>

                        ${escapeHtml(
                            subject.department
                        )}

                    </strong>

                </div>


                <div>

                    <p>Level</p>

                    <strong>

                        ${escapeHtml(
                            subject.level
                        )}

                    </strong>

                </div>


                <div>

                    <p>Subject Type</p>

                    <strong>

                        ${escapeHtml(
                            subject.subjectType
                        )}

                    </strong>

                </div>


                <div>

                    <p>Teacher</p>

                    <strong>

                        ${escapeHtml(
                            subject.teacher
                        )}

                    </strong>

                </div>


                <div>

                    <p>Status</p>

                    <strong>

                        ${escapeHtml(
                            subject.status
                        )}

                    </strong>

                </div>


                <div>

                    <p>Description</p>

                    <strong>

                        ${escapeHtml(
                            subject.description || "—"
                        )}

                    </strong>

                </div>


            </div>

        </div>

    `;


    openModal("profileModal");

}


/* =========================================
   ADD SUBJECT BUTTON
========================================= */

$("addSubjectButton")
    .addEventListener("click", () => {

        openSubjectForm();

    });


/* =========================================
   SUBJECT FORM SUBMIT
========================================= */

$("subjectForm")
    .addEventListener("submit", (event) => {

        event.preventDefault();


        const recordId =
            $("subjectRecordId").value;


        /* =================================
           COLLECT FORM DATA
        ================================== */

        const subject = {

            id:
                recordId ||
                `s-${Date.now()}`,

            subjectName:
                $("subjectName")
                    .value
                    .trim(),

            subjectCode:
                $("subjectCode")
                    .value
                    .trim()
                    .toUpperCase(),

            department:
                $("department")
                    .value
                    .trim(),

            level:
                $("level")
                    .value,

            subjectType:
                $("subjectType")
                    .value,

            teacher:
                $("teacher")
                    .value,
                    teacherName:

                           $ 
                    ("teacher") .selectedOptions[0]?.
                    dataset.teacherName || "",
            status:
                $("status")
                    .value,

            description:
                $("description")
                    .value
                    .trim()

        };


        /* =================================
           VALIDATION
        ================================== */

        if (
            !subject.subjectName ||
            !subject.subjectCode ||
            !subject.department ||
            !subject.level ||
            !subject.subjectType ||
            !subject.teacher
        ) {

            $("formError").textContent =
                "Please fill in all required fields.";

            return;

        }


        /* =================================
           DUPLICATE SUBJECT CODE
        ================================== */

        const duplicate =
            subjects.some(item =>

                item.subjectCode
                    .toLowerCase() ===
                subject.subjectCode
                    .toLowerCase()

                &&

                item.id !== recordId

            );


        if (duplicate) {

            $("formError").textContent =
                "This Subject Code is already in use.";

            return;

        }


        /* =================================
           ADD OR UPDATE
        ================================== */

        if (recordId) {

            subjects =
                subjects.map(item =>

                    item.id === recordId
                        ? subject
                        : item

                );

        } else {

            subjects.unshift(subject);

        }


        /* =================================
           SAVE
        ================================== */

        saveSubjects();


        /* =================================
           CLOSE + REFRESH
        ================================== */

        closeModal("subjectModal");

        renderSubjects();


        /* =================================
           SUCCESS MESSAGE
        ================================== */

        showSuccess(

            recordId

                ? "Subject details updated successfully."

                : "Subject saved successfully."

        );

    });


/* =========================================
   TABLE ACTIONS
========================================= */

$("subjectsTableBody")
    .addEventListener("click", (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) return;


        const subject =
            subjects.find(
                item =>
                    item.id ===
                    button.dataset.id
            );


        if (!subject) return;


        /* =================================
           VIEW
        ================================== */

        if (
            button.dataset.action === "view"
        ) {

            showProfile(subject);

        }


        /* =================================
           EDIT
        ================================== */

        if (
            button.dataset.action === "edit"
        ) {

            openSubjectForm(subject);

        }


        /* =================================
           DELETE
        ================================== */

        if (
            button.dataset.action === "delete"
        ) {

            const confirmed =
                confirm(
                    `Delete ${subject.subjectName}?`
                );


            if (!confirmed) return;


            subjects =
                subjects.filter(
                    item =>
                        item.id !== subject.id
                );


            saveSubjects();

            renderSubjects();


            showSuccess(
                "Subject deleted successfully."
            );

        }

    });


/* =========================================
   SEARCH
========================================= */

$("searchSubject")
    .addEventListener(
        "input",
        renderSubjects
    );


/* =========================================
   LEVEL FILTER
========================================= */

$("levelFilter")
    .addEventListener(
        "change",
        renderSubjects
    );


/* =========================================
   TYPE FILTER
========================================= */

$("typeFilter")
    .addEventListener(
        "change",
        renderSubjects
    );


/* =========================================
   STATUS FILTER
========================================= */

$("statusFilter")
    .addEventListener(
        "change",
        renderSubjects
    );


/* =========================================
   CLOSE MODALS
========================================= */

document.addEventListener(
    "click",
    (event) => {

        const closeButton =
            event.target.closest(
                "[data-close]"
            );


        if (closeButton) {

            closeModal(
                closeButton.dataset.close
            );

        }


        /* Close when clicking outside */

        if (
            event.target.classList
                .contains("modal")
        ) {

            closeModal(
                event.target.id
            );

        }

    }
);


/* =========================================
   MOBILE SIDEBAR
========================================= */

$("sidebarOverlay")
    .addEventListener("click", () => {

        $("sidebar")
            .classList
            .remove("show");

        $("sidebarOverlay")
            .classList
            .remove("show");

    });


document
    .querySelector(".menu-toggle")
    .addEventListener("click", () => {

        $("sidebar")
            .classList
            .toggle("show");

        $("sidebarOverlay")
            .classList
            .toggle("show");

    });


/* =========================================
   INITIAL RENDER
========================================= */
loadTeachersForSubject();
renderSubjects();