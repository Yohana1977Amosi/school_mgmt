/* =========================================================
   CLASSES MANAGEMENT
   School Management System
========================================================= */


/* =========================================================
   1. STORAGE
========================================================= */

const CLASS_STORAGE_KEY = "schoolManagementClasses";
const TEACHER_STORAGE_KEY = "schoolManagementTeachers";
const SUBJECT_STORAGE_KEY = "schoolManagementSubjects";


/* =========================================================
   2. DEFAULT DATA
========================================================= */

const DEFAULT_CLASSES = [
    {
        id: "c-001",
        className: "Form One",
        classCode: "F1",
        level: "Secondary",
        stream: "A",
        classTeacher: "t-002",
        subjectIds: ["s-001", "s-002", "s-004"],
        studentsCount: 35,
        status: "Active",
        description: "Form One A class."
    },
    {
        id: "c-002",
        className: "Standard Five",
        classCode: "STD5",
        level: "Primary",
        stream: "A",
        classTeacher: "t-001",
        subjectIds: ["s-001", "s-004"],
        studentsCount: 30,
        status: "Active",
        description: "Standard Five A class."
    }
];


const DEFAULT_SUBJECTS = [
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


/* =========================================================
   3. STATE
========================================================= */

let classes = [];
let teachers = [];
let subjects = [];

let toastTimer = null;


/* =========================================================
   4. SHORT SELECTOR
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   5. SAFE STORAGE
========================================================= */

function readStorage(key, fallback = []) {

    try {

        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return Array.isArray(parsed)
            ? parsed
            : fallback;

    } catch (error) {

        console.error(`Storage error for ${key}:`, error);

        return fallback;
    }
}


function writeStorage(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(`Unable to save ${key}:`, error);

        return false;
    }
}


/* =========================================================
   6. LOAD CLASSES
========================================================= */

function loadClasses() {

    const saved =
        readStorage(
            CLASS_STORAGE_KEY,
            null
        );

    if (Array.isArray(saved)) {

        return saved;
    }

    writeStorage(
        CLASS_STORAGE_KEY,
        DEFAULT_CLASSES
    );

    return [...DEFAULT_CLASSES];
}


/* =========================================================
   7. LOAD TEACHERS
========================================================= */

function loadTeachers() {

    teachers =
        readStorage(
            TEACHER_STORAGE_KEY,
            []
        );
}


/* =========================================================
   8. LOAD SUBJECTS
========================================================= */

function loadSubjects() {

    const saved =
        readStorage(
            SUBJECT_STORAGE_KEY,
            null
        );

    if (Array.isArray(saved) && saved.length > 0) {

        subjects = saved;

        return;
    }

    subjects = [...DEFAULT_SUBJECTS];

    writeStorage(
        SUBJECT_STORAGE_KEY,
        subjects
    );
}


/* =========================================================
   9. SAVE CLASSES
========================================================= */

function saveClasses() {

    return writeStorage(
        CLASS_STORAGE_KEY,
        classes
    );
}


/* =========================================================
   10. ESCAPE HTML
========================================================= */

function escapeHtml(value = "") {

    const element =
        document.createElement("span");

    element.textContent =
        String(value);

    return element.innerHTML;
}


/* =========================================================
   11. MODALS
========================================================= */

function openModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".class-modal.show"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );
    }
}


/* =========================================================
   12. SUCCESS TOAST
========================================================= */

function showSuccess(message) {

    const toast =
        $("successToast");

    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent =
        `✓ ${message}`;

    toast.classList.add("show");

    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3500);
}


/* =========================================================
   13. ERROR MESSAGE
========================================================= */

function showFormError(message) {

    const error =
        $("formError");

    if (!error) return;

    error.textContent =
        message;

    error.classList.add("show");
}


function clearFormError() {

    const error =
        $("formError");

    if (!error) return;

    error.textContent = "";

    error.classList.remove("show");
}


/* =========================================================
   14. TEACHER HELPERS
========================================================= */

function getTeacher(teacherId) {

    return teachers.find(
        teacher =>
            teacher.id === teacherId
    );
}


function getTeacherName(teacherId) {

    const teacher =
        getTeacher(teacherId);

    if (!teacher) {
        return "Not assigned";
    }

    const firstName =
        teacher.firstName || "";

    const lastName =
        teacher.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        teacher.name ||
        teacher.staffId ||
        "Not assigned"
    );
}


function getTeacherDisplayName(teacherId) {

    const teacher =
        getTeacher(teacherId);

    if (!teacher) {
        return "Not assigned";
    }

    const teacherName =
        getTeacherName(teacherId);

    return teacher.staffId
        ? `${teacherName} (${teacher.staffId})`
        : teacherName;
}


/* =========================================================
   15. SUBJECT HELPERS
========================================================= */

function getSubject(subjectId) {

    return subjects.find(
        subject =>
            subject.id === subjectId
    );
}


function getSubjectNames(subjectIds = []) {

    if (!Array.isArray(subjectIds)) {
        return [];
    }

    return subjectIds
        .map(id => getSubject(id))
        .filter(Boolean)
        .map(
            subject =>
                subject.subjectName
        );
}


/* =========================================================
   16. LOAD TEACHER SELECT
========================================================= */

function loadTeacherSelect(
    selectedTeacherId = ""
) {

    const select =
        $("classTeacher");

    if (!select) return;

    select.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent =
        "Select class teacher";

    select.appendChild(
        defaultOption
    );


    if (teachers.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";
        option.textContent =
            "No teachers available";
        option.disabled = true;

        select.appendChild(option);

        return;
    }


    teachers.forEach(
        teacher => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                teacher.id;

            option.textContent =
                getTeacherDisplayName(
                    teacher.id
                );

            select.appendChild(
                option
            );
        }
    );


    select.value =
        selectedTeacherId || "";
}


/* =========================================================
   17. LOAD SUBJECT SELECTOR
========================================================= */

function loadSubjectsSelector(
    selectedSubjectIds = []
) {

    const container =
        $("subjectsSelector");

    if (!container) return;

    container.innerHTML = "";


    if (subjects.length === 0) {

        const message =
            document.createElement("p");

        message.className =
            "selector-message";

        message.textContent =
            "No subjects available. Please add subjects first.";

        container.appendChild(
            message
        );

        return;
    }


    subjects.forEach(
        subject => {

            const label =
                document.createElement("label");

            label.className =
                "subject-option";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.name =
                "classSubjects";

            checkbox.value =
                subject.id;

            checkbox.checked =
                selectedSubjectIds.includes(
                    subject.id
                );


            const text =
                document.createElement(
                    "span"
                );


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                subject.subjectName;


            const code =
                document.createElement(
                    "small"
                );

            code.textContent =
                subject.subjectCode ||
                "";


            text.appendChild(name);
            text.appendChild(code);

            label.appendChild(
                checkbox
            );

            label.appendChild(
                text
            );

            container.appendChild(
                label
            );
        }
    );
}


/* =========================================================
   18. GET SELECTED SUBJECTS
========================================================= */

function getSelectedSubjectIds() {

    const checked =
        document.querySelectorAll(
            'input[name="classSubjects"]:checked'
        );

    return Array.from(
        checked
    ).map(
        checkbox =>
            checkbox.value
    );
}


/* =========================================================
   19. RENDER STATISTICS
========================================================= */

function renderStatistics() {

    const total =
        classes.length;

    const primary =
        classes.filter(
            item =>
                item.level === "Primary"
        ).length;

    const secondary =
        classes.filter(
            item =>
                item.level === "Secondary"
        ).length;

    const active =
        classes.filter(
            item =>
                item.status === "Active"
        ).length;


    if ($("totalClasses")) {
        $("totalClasses").textContent =
            total;
    }

    if ($("primaryClasses")) {
        $("primaryClasses").textContent =
            primary;
    }

    if ($("secondaryClasses")) {
        $("secondaryClasses").textContent =
            secondary;
    }

    if ($("activeClasses")) {
        $("activeClasses").textContent =
            active;
    }
}


/* =========================================================
   20. RENDER TABLE
========================================================= */

function renderClasses() {

    const tableBody =
        $("classesTableBody");

    if (!tableBody) return;


    const search =
        (
            $("searchClass")?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const level =
        $("classLevelFilter")?.value ||
        "";


    const status =
        $("classStatusFilter")?.value ||
        "";


    const filteredClasses =
        classes.filter(
            classItem => {

                const subjectNames =
                    getSubjectNames(
                        classItem.subjectIds
                    ).join(" ");


                const teacherName =
                    getTeacherName(
                        classItem.classTeacher
                    );


                const searchableText = [

                    classItem.className,
                    classItem.classCode,
                    classItem.level,
                    classItem.stream,
                    teacherName,
                    subjectNames

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const matchesLevel =
                    !level ||
                    classItem.level === level;


                const matchesStatus =
                    !status ||
                    classItem.status === status;


                return (
                    matchesSearch &&
                    matchesLevel &&
                    matchesStatus
                );
            }
        );


    renderStatistics();


    /* COUNT */

    const count =
        filteredClasses.length;

    if ($("classCount")) {

        $("classCount").textContent =
            `${count} class${count === 1 ? "" : "es"}`;
    }


    /* EMPTY */

    const emptyState =
        $("emptyState");

    if (emptyState) {

        emptyState.hidden =
            count !== 0;
    }


    /* TABLE */

    if (count === 0) {

        tableBody.innerHTML = "";

        return;
    }


    tableBody.innerHTML =
        filteredClasses
            .map(
                classItem =>
                    createClassRow(
                        classItem
                    )
            )
            .join("");
}


/* =========================================================
   21. CREATE TABLE ROW
========================================================= */

function createClassRow(
    classItem
) {

    const subjectNames =
        getSubjectNames(
            classItem.subjectIds
        );


    const visibleSubjects =
        subjectNames
            .slice(0, 3);


    const subjectDisplay =
        visibleSubjects.length > 0

            ? visibleSubjects
                .map(
                    name =>
                        `
                        <span class="subject-tag">
                            ${escapeHtml(name)}
                        </span>
                        `
                )
                .join("")

            : `
                <span class="muted-text">
                    No subjects
                </span>
              `;


    const extraSubjects =
        subjectNames.length > 3

            ? `
                <span class="subject-more">
                    +${subjectNames.length - 3}
                </span>
              `

            : "";


    const statusClass =
        String(
            classItem.status || ""
        )
            .toLowerCase();


    return `
        <tr>

            <td>
                <span class="class-name">
                    ${escapeHtml(
                        classItem.className
                    )}
                </span>
            </td>


            <td>
                ${escapeHtml(
                    classItem.classCode
                )}
            </td>


            <td>
                <span class="level-badge">
                    ${escapeHtml(
                        classItem.level
                    )}
                </span>
            </td>


            <td>
                ${escapeHtml(
                    classItem.stream || "—"
                )}
            </td>


            <td>

                <div class="subject-list">

                    ${subjectDisplay}
                    ${extraSubjects}

                </div>

            </td>


            <td>
                ${escapeHtml(
                    getTeacherName(
                        classItem.classTeacher
                    )
                )}
            </td>


            <td>
                ${Number(
                    classItem.studentsCount || 0
                )}
            </td>


            <td>

                <span class="badge ${statusClass}">

                    ${escapeHtml(
                        classItem.status ||
                        "Unknown"
                    )}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        data-action="view"
                        data-id="${escapeHtml(
                            classItem.id
                        )}">

                        View

                    </button>


                    <button
                        type="button"
                        data-action="edit"
                        data-id="${escapeHtml(
                            classItem.id
                        )}">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete"
                        data-action="delete"
                        data-id="${escapeHtml(
                            classItem.id
                        )}">

                        Delete

                    </button>

                </div>

            </td>

        </tr>
    `;
}


/* =========================================================
   22. OPEN CLASS FORM
========================================================= */

function openClassForm(
    classItem = null
) {

    const form =
        $("classForm");

    if (!form) return;


    form.reset();

    clearFormError();


    $("classRecordId").value =
        classItem
            ? classItem.id
            : "";


    $("classModalTitle").textContent =
        classItem
            ? "Edit Class"
            : "Add Class";


    $("classModalText").textContent =
        classItem
            ? "Update this class's information."
            : "Enter the class information below.";


    $("saveClassButton").textContent =
        classItem
            ? "Save Changes"
            : "Save Class";


    loadTeachers();
    loadSubjects();


    loadTeacherSelect(
        classItem
            ? classItem.classTeacher
            : ""
    );


    loadSubjectsSelector(
        classItem
            ? classItem.subjectIds || []
            : []
    );


    if (classItem) {

        $("className").value =
            classItem.className || "";

        $("classCode").value =
            classItem.classCode || "";

        $("classLevel").value =
            classItem.level || "";

        $("stream").value =
            classItem.stream || "";

        $("classStatus").value =
            classItem.status || "Active";

        $("classDescription").value =
            classItem.description || "";
    }


    openModal(
        "classModal"
    );


    setTimeout(
        () => {

            $("className")?.focus();

        },
        50
    );
}


/* =========================================================
   23. SHOW PROFILE
========================================================= */

function showProfile(
    classItem
) {

    const profileContent =
        $("profileContent");

    if (!profileContent) return;


    const subjectNames =
        getSubjectNames(
            classItem.subjectIds
        );


    const teacherName =
        getTeacherName(
            classItem.classTeacher
        );


    const initial =
        (
            classItem.className ||
            "C"
        )
            .charAt(0)
            .toUpperCase();


    profileContent.innerHTML = `

        <div class="profile-body">

            <div class="profile-identity">

                <div class="profile-initials">
                    ${escapeHtml(initial)}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(
                            classItem.className
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            classItem.classCode
                        )}
                        ·
                        ${escapeHtml(
                            classItem.level
                        )}
                    </p>

                </div>

            </div>


            <div class="profile-details">

                <div>

                    <p>Class Name</p>

                    <strong>
                        ${escapeHtml(
                            classItem.className
                        )}
                    </strong>

                </div>


                <div>

                    <p>Class Code</p>

                    <strong>
                        ${escapeHtml(
                            classItem.classCode
                        )}
                    </strong>

                </div>


                <div>

                    <p>Level</p>

                    <strong>
                        ${escapeHtml(
                            classItem.level
                        )}
                    </strong>

                </div>


                <div>

                    <p>Stream</p>

                    <strong>
                        ${escapeHtml(
                            classItem.stream || "—"
                        )}
                    </strong>

                </div>


                <div>

                    <p>Class Teacher</p>

                    <strong>
                        ${escapeHtml(
                            teacherName
                        )}
                    </strong>

                </div>


                <div>

                    <p>Students</p>

                    <strong>
                        ${Number(
                            classItem.studentsCount || 0
                        )}
                    </strong>

                </div>


                <div>

                    <p>Status</p>

                    <strong>
                        ${escapeHtml(
                            classItem.status ||
                            "Unknown"
                        )}
                    </strong>

                </div>


                <div>

                    <p>Subjects</p>

                    <strong>
                        ${
                            subjectNames.length
                                ? escapeHtml(
                                    subjectNames.join(", ")
                                  )
                                : "No subjects assigned"
                        }
                    </strong>

                </div>


                <div>

                    <p>Description</p>

                    <strong>
                        ${escapeHtml(
                            classItem.description ||
                            "—"
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;


    openModal(
        "profileModal"
    );
}


/* =========================================================
   24. SAVE CLASS
========================================================= */

function handleClassSubmit(
    event
) {

    event.preventDefault();

    clearFormError();


    const recordId =
        $("classRecordId").value.trim();


    const className =
        $("className").value.trim();


    const classCode =
        $("classCode")
            .value
            .trim()
            .toUpperCase();


    const level =
        $("classLevel").value;


    const stream =
        $("stream")
            .value
            .trim();


    const classTeacher =
        $("classTeacher").value;


    const status =
        $("classStatus").value;


    const description =
        $("classDescription")
            .value
            .trim();


    const subjectIds =
        getSelectedSubjectIds();


    /* REQUIRED FIELDS */

    if (
        !className ||
        !classCode ||
        !level ||
        !classTeacher ||
        !status
    ) {

        showFormError(
            "Please fill in all required fields."
        );

        return;
    }


    /* SUBJECT */

    if (subjectIds.length === 0) {

        showFormError(
            "Please select at least one subject."
        );

        return;
    }


    /* DUPLICATE CODE */

    const duplicate =
        classes.some(
            item =>

                String(
                    item.classCode || ""
                )
                    .toLowerCase() ===
                classCode.toLowerCase()

                &&

                item.id !== recordId
        );


    if (duplicate) {

        showFormError(
            "This Class Code is already in use."
        );

        return;
    }


    /* EXISTING CLASS */

    const existingClass =
        classes.find(
            item =>
                item.id === recordId
        );


    /* CREATE OBJECT */

    const classItem = {

        id:
            recordId ||
            `c-${Date.now()}`,

        className,

        classCode,

        level,

        stream,

        classTeacher,

        subjectIds,

        studentsCount:
            existingClass
                ? Number(
                    existingClass.studentsCount || 0
                  )
                : 0,

        status,

        description
    };


    /* UPDATE */

    if (recordId) {

        classes =
            classes.map(
                item =>
                    item.id === recordId
                        ? classItem
                        : item
            );

    }

    /* ADD */

    else {

        classes.unshift(
            classItem
        );
    }


    /* SAVE */

    const saved =
        saveClasses();


    if (!saved) {

        showFormError(
            "Unable to save class data. Please check browser storage."
        );

        return;
    }


    /* REFRESH */

    closeModal(
        "classModal"
    );

    renderClasses();


    showSuccess(
        recordId
            ? "Class details updated successfully."
            : "Class saved successfully."
    );
}


/* =========================================================
   25. DELETE CLASS
========================================================= */

function deleteClass(
    classId
) {

    const classItem =
        classes.find(
            item =>
                item.id === classId
        );


    if (!classItem) return;


    const confirmed =
        window.confirm(
            `Delete ${classItem.className}?`
        );


    if (!confirmed) return;


    classes =
        classes.filter(
            item =>
                item.id !== classId
        );


    if (!saveClasses()) {

        showSuccess(
            "Unable to delete class."
        );

        return;
    }


    renderClasses();


    showSuccess(
        "Class deleted successfully."
    );
}


/* =========================================================
   26. TABLE ACTIONS
========================================================= */

function handleTableAction(
    event
) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) return;


    const classId =
        button.dataset.id;


    const action =
        button.dataset.action;


    const classItem =
        classes.find(
            item =>
                item.id === classId
        );


    if (!classItem) return;


    if (action === "view") {

        showProfile(
            classItem
        );

        return;
    }


    if (action === "edit") {

        openClassForm(
            classItem
        );

        return;
    }


    if (action === "delete") {

        deleteClass(
            classId
        );
    }
}


/* =========================================================
   27. CLOSE MODALS
========================================================= */

function handleModalClose(
    event
) {

    const closeButton =
        event.target.closest(
            "[data-close]"
        );


    if (closeButton) {

        closeModal(
            closeButton.dataset.close
        );

        return;
    }


    if (
        event.target.classList.contains(
            "class-modal"
        )
    ) {

        closeModal(
            event.target.id
        );
    }
}


/* =========================================================
   28. ESC KEY
========================================================= */

function handleEscapeKey(
    event
) {

    if (event.key !== "Escape") {
        return;
    }


    const openModalElement =
        document.querySelector(
            ".class-modal.show"
        );


    if (openModalElement) {

        closeModal(
            openModalElement.id
        );
    }
}


/* =========================================================
   29. MOBILE SIDEBAR
========================================================= */

function initializeSidebar() {

    const sidebar =
        $("sidebar");

    const overlay =
        $("sidebarOverlay");

    const menuToggle =
        $("menuToggle");


    if (!sidebar ||
        !overlay ||
        !menuToggle) {

        return;
    }


    menuToggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "show"
            );

            overlay.classList.toggle(
                "show"
            );
        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "show"
            );

            overlay.classList.remove(
                "show"
            );
        }
    );
}


/* =========================================================
   30. INITIALIZE EVENTS
========================================================= */

function initializeClassesPage() {

    classes =
        loadClasses();

    loadTeachers();

    loadSubjects();


    /* ADD */

    $("addClassButton")
        ?.addEventListener(
            "click",
            () => {

                openClassForm();

            }
        );


    /* FORM */

    $("classForm")
        ?.addEventListener(
            "submit",
            handleClassSubmit
        );


    /* TABLE */

    $("classesTableBody")
        ?.addEventListener(
            "click",
            handleTableAction
        );


    /* SEARCH */

    $("searchClass")
        ?.addEventListener(
            "input",
            renderClasses
        );


    /* LEVEL */

    $("classLevelFilter")
        ?.addEventListener(
            "change",
            renderClasses
        );


    /* STATUS */

    $("classStatusFilter")
        ?.addEventListener(
            "change",
            renderClasses
        );


    /* MODALS */

    document.addEventListener(
        "click",
        handleModalClose
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        handleEscapeKey
    );


    /* SIDEBAR */

    initializeSidebar();


    /* FIRST RENDER */

    renderClasses();
}


/* =========================================================
   31. START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeClassesPage
    );

} else {

    initializeClassesPage();
}