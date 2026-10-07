/* =========================================================
   STUDENTS MANAGEMENT SYSTEM
   STUDENTS ↔ CLASSES INTEGRATION
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const studentStorageKey = "students";
const classStorageKey = "schoolManagementClasses";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let students = [];
let classes = [];
let toastTimer;


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value = "") {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}


/* =========================================================
   LOAD STUDENTS
   ========================================================= */

function loadStudents() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(studentStorageKey)
        );

        students = Array.isArray(saved)
            ? saved
            : [];

    } catch (error) {

        console.error(
            "Unable to load students:",
            error
        );

        students = [];
    }
}


/* =========================================================
   SAVE STUDENTS
   ========================================================= */

function saveStudents() {

    try {
        localStorage.setItem(
            studentStorageKey,
            JSON.stringify(students)
        );
        return true;
    } catch (error) {
        console.error("Unable to save students:", error);
        return false;
    }
}


/* =========================================================
   LOAD CLASSES
   ========================================================= */

function loadClasses() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(classStorageKey)
        );

        classes = Array.isArray(saved)
            ? saved
            : [];

    } catch (error) {

        console.error(
            "Unable to load classes:",
            error
        );

        classes = [];
    }
}


/* =========================================================
   GET CLASS BY ID
   ========================================================= */

function getClassById(classId) {

    return classes.find(
        function (classItem) {

            return classItem.id === classId;

        }
    );
}


/* =========================================================
   GET CLASS NAME
   ========================================================= */

function getClassName(
    classId,
    fallbackName = ""
) {

    const classItem =
        getClassById(classId);

    if (classItem) {

        return classItem.className;

    }

    return fallbackName ||
        "No class assigned";
}


/* =========================================================
   MIGRATE OLD STUDENTS
   ========================================================= */

function migrateStudentClassData() {

    let changed = false;

    students = students.map(
        function (student) {

            const updatedStudent = {
                ...student
            };


            /* -----------------------------------------
               CLASS ID ALREADY EXISTS
               ----------------------------------------- */

            if (
                updatedStudent.classId &&
                getClassById(
                    updatedStudent.classId
                )
            ) {

                updatedStudent.className =
                    getClassName(
                        updatedStudent.classId,
                        updatedStudent.className
                    );

                return updatedStudent;
            }


            /* -----------------------------------------
               FIND CLASS USING OLD CLASS NAME
               ----------------------------------------- */

            if (
                updatedStudent.className
            ) {

                const matchingClass =
                    classes.find(
                        function (classItem) {

                            return (
                                String(
                                    classItem.className
                                )
                                    .toLowerCase()
                                ===
                                String(
                                    updatedStudent.className
                                )
                                    .toLowerCase()
                            );

                        }
                    );


                if (matchingClass) {

                    updatedStudent.classId =
                        matchingClass.id;

                    updatedStudent.className =
                        matchingClass.className;

                    changed = true;
                }
            }


            return updatedStudent;

        }
    );


    if (changed) {

        saveStudents();

    }
}


/* =========================================================
   GENERATE ADMISSION NUMBER
   ========================================================= */

function generateAdmissionNumber() {

    let number =
        students.length + 1;

    let admissionNumber;


    do {

        admissionNumber =
            "ADM" +
            String(number)
                .padStart(4, "0");

        number++;

    } while (

        students.some(
            function (student) {

                return (
                    String(
                        student.admissionNumber || ""
                    )
                        .toLowerCase()
                    ===
                    admissionNumber.toLowerCase()
                );

            }
        )

    );


    return admissionNumber;
}


/* =========================================================
   LOAD CLASS SELECT
   ========================================================= */

function loadClassSelect(
    selectId,
    selectedClassId = ""
) {

    const select =
        $(selectId);

    if (!select) {

        console.warn(
            `#${selectId} haijapatikana.`
        );

        return;
    }


    select.innerHTML = "";


    /* Default option */

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "Select class";

    select.appendChild(
        defaultOption
    );


    /* No classes */

    if (classes.length === 0) {

        const emptyOption =
            document.createElement("option");

        emptyOption.value = "";

        emptyOption.disabled = true;

        emptyOption.textContent =
            "No classes available";

        select.appendChild(
            emptyOption
        );

        return;
    }


    /* Add classes */

    classes.forEach(
        function (classItem) {

            const option =
                document.createElement(
                    "option"
                );

            /*
             * IMPORTANT:
             * Value is CLASS ID
             */

            option.value =
                classItem.id;

            option.textContent =
                `${classItem.className} (${classItem.classCode})`;


            if (
                classItem.id ===
                selectedClassId
            ) {

                option.selected = true;

            }


            select.appendChild(
                option
            );

        }
    );
}


/* =========================================================
   LOAD CLASS FILTER
   ========================================================= */

function loadClassFilter(
    selectedClassId = ""
) {

    const filter =
        $("classFilter");

    if (!filter) {
        return;
    }


    filter.innerHTML = `
        <option value="all">
            All Classes
        </option>
    `;


    classes.forEach(
        function (classItem) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                classItem.id;

            option.textContent =
                `${classItem.className} (${classItem.classCode})`;


            if (
                classItem.id ===
                selectedClassId
            ) {

                option.selected = true;

            }


            filter.appendChild(
                option
            );

        }
    );
}


/* =========================================================
   SYNC CLASS STUDENT COUNTS
   ========================================================= */

function syncClassStudentCounts() {

    let changed = false;


    classes = classes.map(
        function (classItem) {

            const count =
                students.filter(
                    function (student) {

                        return (
                            student.classId
                            ===
                            classItem.id
                        );

                    }
                ).length;


            if (
                classItem.studentsCount
                !==
                count
            ) {

                changed = true;

            }


            return {
                ...classItem,
                studentsCount: count
            };

        }
    );


    if (changed) {

        localStorage.setItem(
            classStorageKey,
            JSON.stringify(classes)
        );

    }
}


/* =========================================================
   MODALS
   ========================================================= */

function openStudentModal() {

    const modal =
        $("studentModal");

    if (modal) {
        const formError = $("formError");
        if (formError) {
            formError.textContent = "";
        }

        modal.classList.add(
            "show"
        );

    }
}


function closeStudentModal() {

    const modal =
        $("studentModal");

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }
}


function closeProfileModal() {

    const modal =
        $("profileModal");

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }
}


function closeEditModal() {

    const modal =
        $("editStudentModal");

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }
}


/* =========================================================
   CLOSE MODALS BACKGROUND
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const studentModal =
            $("studentModal");

        const profileModal =
            $("profileModal");

        const editModal =
            $("editStudentModal");


        if (
            event.target ===
            studentModal
        ) {

            closeStudentModal();

        }


        if (
            event.target ===
            profileModal
        ) {

            closeProfileModal();

        }


        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   DISPLAY STUDENTS
   ========================================================= */

function displayStudents(
    studentList = students
) {

    const tableBody =
        document.querySelector(
            "#studentsTable tbody"
        );


    if (!tableBody) {

        console.error(
            "#studentsTable tbody haijapatikana."
        );

        return;
    }


    tableBody.innerHTML = "";


    if (
        studentList.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >
                    No students found.
                </td>
            </tr>
        `;


        updateStudentStatistics();

        updateStudentCountText();
        updateBulkStudentSelection();

        return;
    }


    studentList.forEach(
        function (student) {

            const realIndex =
                students.indexOf(
                    student
                );


            const firstName =
                student.firstName || "";


            const lastName =
                student.lastName || "";


            const initials =
                (
                    firstName.charAt(0) +
                    lastName.charAt(0)
                ).toUpperCase();


            const className =
                getClassName(
                    student.classId,
                    student.className
                );


            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
                <td>
                    <input
                        type="checkbox"
                        class="student-select-checkbox"
                        value="${realIndex}"
                        aria-label="Select ${escapeHtml(
                            `${firstName} ${lastName}`.trim() || "student"
                        )}">
                </td>

                <td>
                    <div class="student-info">

                        <div class="student-avatar">
                            ${escapeHtml(
                                initials || "ST"
                            )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    firstName
                                )}
                                ${escapeHtml(
                                    lastName
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    student.email ||
                                    "No email"
                                )}
                            </small>

                        </div>

                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        student.admissionNumber ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        student.gender ||
                        "-"
                    )}
                </td>

                <td>
                    <span class="class-badge">
                        ${escapeHtml(
                            className
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        student.phone ||
                        "-"
                    )}
                </td>

                <td>
                    <span class="status active">
                        Active
                    </span>
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="view-btn"
                            onclick="viewStudent(${realIndex})"
                            title="View"
                        >
                            👁
                        </button>

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editStudent(${realIndex})"
                            title="Edit"
                        >
                            ✏
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteStudent(${realIndex})"
                            title="Delete"
                        >
                            🗑
                        </button>

                    </div>

                </td>
            `;


            tableBody.appendChild(
                row
            );

        }
    );


    updateStudentStatistics();

    updateStudentCountText();
    updateBulkStudentSelection();
}


function updateBulkStudentSelection() {

    const table =
        $("studentsTable");

    const deleteButton =
        $("deleteSelectedStudents");

    const selectAll =
        $("selectAllStudents");

    if (!table || !deleteButton || !selectAll) {
        return;
    }

    const checkboxes = Array.from(
        table.querySelectorAll(
            "tbody .student-select-checkbox"
        )
    );
    const selectedCount = checkboxes.filter(
        function (checkbox) {
            return checkbox.checked;
        }
    ).length;

    deleteButton.textContent =
        `Delete selected (${selectedCount})`;
    deleteButton.disabled =
        selectedCount === 0;

    selectAll.checked =
        checkboxes.length > 0 &&
        selectedCount === checkboxes.length;
    selectAll.indeterminate =
        selectedCount > 0 &&
        selectedCount < checkboxes.length;
}


function setupBulkStudentDelete() {

    const table =
        $("studentsTable");

    const selectAll =
        $("selectAllStudents");

    const deleteButton =
        $("deleteSelectedStudents");

    if (!table || !selectAll || !deleteButton) {
        console.error(
            "Bulk student delete controls are missing from the page."
        );
        return;
    }

    selectAll.addEventListener(
        "change",
        function () {
            table.querySelectorAll(
                "tbody .student-select-checkbox"
            ).forEach(
                function (checkbox) {
                    checkbox.checked = selectAll.checked;
                }
            );
            updateBulkStudentSelection();
        }
    );

    table.addEventListener(
        "change",
        function (event) {
            if (
                event.target.matches(
                    ".student-select-checkbox"
                )
            ) {
                updateBulkStudentSelection();
            }
        }
    );

    deleteButton.addEventListener(
        "click",
        function () {
            const selectedIndexes = Array.from(
                table.querySelectorAll(
                    "tbody .student-select-checkbox:checked"
                )
            )
                .map(function (checkbox) {
                    return Number(checkbox.value);
                })
                .filter(function (index) {
                    return Number.isInteger(index) &&
                        index >= 0 &&
                        index < students.length;
                });

            if (selectedIndexes.length === 0) {
                updateBulkStudentSelection();
                return;
            }

            const confirmed = confirm(
                `Delete ${selectedIndexes.length} selected student(s)? This cannot be undone.`
            );

            if (!confirmed) {
                return;
            }

            const selectedIndexSet =
                new Set(selectedIndexes);
            const originalStudents = students;

            students = students.filter(
                function (student, index) {
                    return !selectedIndexSet.has(index);
                }
            );

            if (!saveStudents()) {
                students = originalStudents;
                alert(
                    "Unable to delete the selected students because the changes could not be saved."
                );
                return;
            }

            syncClassStudentCounts();
            displayStudents();
            alert(
                `${selectedIndexes.length} student(s) deleted successfully.`
            );
        }
    );
}


/* =========================================================
   ADD STUDENT
   ========================================================= */

function setupStudentForm() {

    const studentForm =
        $("studentForm");


    if (!studentForm) {

        console.error(
            "ERROR: #studentForm haijapatikana."
        );

        return;
    }


    studentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const formData =
                new FormData(
                    studentForm
                );

            const formError =
                $("formError");

            if (formError) {
                formError.textContent = "";
            }

            /* =========================================
               GET SELECTED CLASS ID
               ========================================= */

            const classId =
                $("studentClass").value;


            /* =========================================
               FIND CLASS USING ID
               ========================================= */

            const selectedClass = classes.find(
                     classItem => classItem.id === classId); 


            /* =========================================
               VALIDATE CLASS
               ========================================= */

            if (!selectedClass) {

                if (formError) {
                    formError.textContent =
                        "Please select a valid class.";
                }

                return;
            }


            /* =========================================
               CREATE STUDENT
               ========================================= */

            const student = {

                firstName:
                    String(
                        formData.get(
                            "firstName"
                        ) || ""
                    ).trim(),

                lastName:
                    String(
                        formData.get(
                            "lastName"
                        ) || ""
                    ).trim(),

                gender:
                    String(
                        formData.get(
                            "gender"
                        ) || ""
                    ).trim(),

                email:
                    String(
                        formData.get(
                            "email"
                        ) || ""
                    ).trim(),

                dateOfBirth:
                    String(
                        formData.get(
                            "dateOfBirth"
                        ) || ""
                    ).trim(),

                /* CLASS RELATION */

                classId:
                    selectedClass.id,

                className:
                    selectedClass.className,

                admissionNumber:
                    String(
                        formData.get(
                            "admissionNumber"
                        ) || ""
                    ).trim(),

                guardian:
                    String(
                        formData.get(
                            "guardian"
                        ) || ""
                    ).trim(),

                phone:
                    String(
                        formData.get(
                            "phone"
                        ) || ""
                    ).trim(),

                address:
                    String(
                        formData.get(
                            "address"
                        ) || ""
                    ).trim()
            };


            /* =========================================
               GENERATE ADMISSION NUMBER
               ========================================= */

            if (
                !student.admissionNumber
            ) {

                student.admissionNumber =
                    generateAdmissionNumber();

            }


            /* =========================================
               DUPLICATE ADMISSION
               ========================================= */

            const duplicate =
                students.some(
                    function (
                        existingStudent
                    ) {

                        return (
                            String(
                                existingStudent
                                    .admissionNumber ||
                                ""
                            )
                                .toLowerCase()
                            ===
                            student
                                .admissionNumber
                                .toLowerCase()
                        );

                    }
                );


            if (duplicate) {

                if (formError) {
                    formError.textContent =
                        "That admission number is already in use. Please enter a different number.";
                }

                return;
            }


            /* =========================================
               ADD STUDENT
               ========================================= */

            students.push(
                student
            );


            /* =========================================
               SAVE
               ========================================= */

            if (!saveStudents()) {
                students.pop();
                if (formError) {
                    formError.textContent =
                        "Unable to save the student. Please check browser storage and try again.";
                }
                return;
            }


            /* =========================================
               UPDATE CLASS COUNT
               ========================================= */

            syncClassStudentCounts();


            /* =========================================
               REFRESH
               ========================================= */

            displayStudents();


            closeStudentModal();

            studentForm.reset();


            /* =========================================
               SUCCESS
               ========================================= */

            alert(
                "✓ Student added successfully!"
            );

        }
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchStudents() {

    const searchInput =
        $("studentSearch");

    if (!searchInput) {
        return;
    }


    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchValue) {

        displayStudents();

        return;
    }


    const filtered =
        students.filter(
            function (student) {

                const className =
                    getClassName(
                        student.classId,
                        student.className
                    );


                return (

                    String(
                        student.firstName ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    String(
                        student.lastName ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    String(
                        student.admissionNumber ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    String(
                        className ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    String(
                        student.phone ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                );

            }
        );


    displayStudents(
        filtered
    );
}


/* =========================================================
   FILTER STUDENTS BY CLASS
   ========================================================= */

function filterStudents() {

    const filter =
        $("classFilter");

    if (!filter) {
        return;
    }


    const selectedClassId =
        filter.value;


    if (
        !selectedClassId ||
        selectedClassId === "all"
    ) {

        displayStudents();

        return;
    }


    const filtered =
        students.filter(
            function (student) {

                return (
                    student.classId
                    ===
                    selectedClassId
                );

            }
        );


    displayStudents(
        filtered
    );
}


/* =========================================================
   VIEW STUDENT
   ========================================================= */

function viewStudent(index) {

    const student =
        students[index];

    if (!student) {
        return;
    }


    const firstName =
        student.firstName || "";


    const lastName =
        student.lastName || "";


    const initials =
        (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();


    const className =
        getClassName(
            student.classId,
            student.className
        );


    const data = {

        profileAvatar:
            initials || "ST",

        profileName:
            `${firstName} ${lastName}`
                .trim()
            ||
            "Unknown Student",

        profileAdmission:
            student.admissionNumber
            ||
            "-",

        profileGender:
            student.gender
            ||
            "-",

        profileDOB:
            student.dateOfBirth
            ||
            "Not provided",

        profileAdmission2:
            student.admissionNumber
            ||
            "-",

        profileClass:
            className
            ||
            "-",

        profileClass2:
            className
            ||
            "-",

        profileGuardian:
            student.guardian
            ||
            "Not provided",

        profilePhone:
            student.phone
            ||
            "Not provided",

        profileAddress:
            student.address
            ||
            "Not provided"

    };


    Object.keys(data).forEach(
        function (id) {

            const element =
                $(id);

            if (element) {

                element.textContent =
                    data[id];

            }

        }
    );


    const modal =
        $("profileModal");

    if (modal) {

        modal.classList.add(
            "show"
        );

    }
}


/* =========================================================
   EDIT STUDENT
   ========================================================= */

function editStudent(index) {

    const student =
        students[index];

    if (!student) {
        return;
    }


    loadClasses();


    loadClassSelect(
        "editClass",
        student.classId || ""
    );


    const fields = {

        editStudentIndex:
            index,

        editFirstName:
            student.firstName
            ||
            "",

        editLastName:
            student.lastName
            ||
            "",

        editGender:
            student.gender
            ||
            "",

        editDOB:
            student.dateOfBirth
            ||
            "",

        editAdmission:
            student.admissionNumber
            ||
            "",

        editGuardian:
            student.guardian
            ||
            "",

        editPhone:
            student.phone
            ||
            "",

        editAddress:
            student.address
            ||
            ""

    };


    Object.keys(fields).forEach(
        function (id) {

            const element =
                $(id);

            if (element) {

                element.value =
                    fields[id];

            }

        }
    );


    const editModal =
        $("editStudentModal");

    if (editModal) {

        editModal.classList.add(
            "show"
        );

    }
}


/* =========================================================
   UPDATE STUDENT
   ========================================================= */

function setupEditStudentForm() {

    const editForm =
        $("editStudentForm");

    if (!editForm) {

        console.warn(
            "#editStudentForm haijapatikana."
        );

        return;
    }


    editForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const index =
                Number(
                    $("editStudentIndex")
                        ?.value
                );


            if (
                Number.isNaN(index) ||
                !students[index]
            ) {

                alert(
                    "Student anayehaririwa hakupatikana."
                );

                return;
            }


            const selectedClassId =
                String(
                    $("editClass")
                        ?.value
                    ||
                    ""
                ).trim();


            const selectedClass =
                getClassById(
                    selectedClassId
                );


            if (!selectedClass) {

                alert(
                    "Please select a valid class."
                );

                return;
            }


            const updatedAdmission =
                String(
                    $("editAdmission")
                        ?.value
                    ||
                    ""
                ).trim();


            /* Duplicate admission */

            const duplicate =
                students.some(
                    function (
                        student,
                        studentIndex
                    ) {

                        return (

                            studentIndex !==
                            index

                            &&

                            String(
                                student.admissionNumber
                                ||
                                ""
                            )
                                .toLowerCase()

                            ===

                            updatedAdmission
                                .toLowerCase()

                        );

                    }
                );


            if (duplicate) {

                alert(
                    "Admission Number hiyo tayari inatumika."
                );

                return;
            }


            /* Update */

            students[index] = {

                ...students[index],

                firstName:
                    String(
                        $("editFirstName")
                            ?.value
                        ||
                        ""
                    ).trim(),

                lastName:
                    String(
                        $("editLastName")
                            ?.value
                        ||
                        ""
                    ).trim(),

                gender:
                    $("editGender")
                        ?.value
                    ||
                    "",

                dateOfBirth:
                    $("editDOB")
                        ?.value
                    ||
                    "",

                admissionNumber:
                    updatedAdmission,

                guardian:
                    String(
                        $("editGuardian")
                            ?.value
                        ||
                        ""
                    ).trim(),

                phone:
                    String(
                        $("editPhone")
                            ?.value
                        ||
                        ""
                    ).trim(),

                address:
                    String(
                        $("editAddress")
                            ?.value
                        ||
                        ""
                    ).trim(),

                /* CLASS RELATION */

                classId:
                    selectedClass.id,

                className:
                    selectedClass.className

            };


            saveStudents();


            syncClassStudentCounts();


            displayStudents();


            closeEditModal();


            alert(
                "✓ Student information updated successfully!"
            );

        }
    );
}


/* =========================================================
   DELETE STUDENT
   ========================================================= */

function deleteStudent(index) {

    const student =
        students[index];

    if (!student) {
        return;
    }


    const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`
            .trim();


    const confirmed =
        confirm(
            `Are you sure you want to delete ${studentName || "this student"}?`
        );


    if (!confirmed) {
        return;
    }


    students.splice(
        index,
        1
    );


    saveStudents();


    syncClassStudentCounts();


    displayStudents();


    alert(
        "✓ Student deleted successfully!"
    );
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStudentStatistics() {

    const total =
        students.length;


    const male =
        students.filter(
            function (student) {

                return (
                    student.gender
                    ===
                    "Male"
                );

            }
        ).length;


    const female =
        students.filter(
            function (student) {

                return (
                    student.gender
                    ===
                    "Female"
                );

            }
        ).length;


    const active =
        students.length;


    const cards =
        document.querySelectorAll(
            ".summary-card"
        );


    if (
        cards.length >= 4
    ) {

        const totalValue =
            cards[0]
                .querySelector(
                    "strong"
                );


        const maleValue =
            cards[1]
                .querySelector(
                    "strong"
                );


        const femaleValue =
            cards[2]
                .querySelector(
                    "strong"
                );


        const activeValue =
            cards[3]
                .querySelector(
                    "strong"
                );


        if (totalValue) {

            totalValue.textContent =
                total;

        }


        if (maleValue) {

            maleValue.textContent =
                male;

        }


        if (femaleValue) {

            femaleValue.textContent =
                female;

        }


        if (activeValue) {

            activeValue.textContent =
                active;

        }

    }
}


/* =========================================================
   STUDENT COUNT TEXT
   ========================================================= */

function updateStudentCountText() {

    const countText =
        document.querySelector(
            ".students-panel .table-toolbar p"
        );


    if (countText) {

        countText.textContent =
            `${students.length} students registered`;

    }


    const paginationText =
        document.querySelector(
            ".pagination > span"
        );


    if (paginationText) {

        if (
            students.length === 0
        ) {

            paginationText.textContent =
                "Showing 0 students";

        } else {

            paginationText.textContent =
                `Showing ${students.length} of ${students.length} students`;

        }

    }
}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "show"
        );

    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Students Management System initializing..."
        );


        /* 1. Load data */

        loadStudents();

        loadClasses();


        /* 2. Migrate old class data */

        migrateStudentClassData();


        /* 3. Update class counts */

        syncClassStudentCounts();


        /* 4. Load class selectors */

        loadClassSelect(
            "studentClass"
        );

        loadClassSelect(
            "editClass"
        );

        loadClassFilter();


        /* 5. Setup forms */

        setupStudentForm();

        setupEditStudentForm();
        setupBulkStudentDelete();


        /* 6. Display students */

        displayStudents();


        console.log(
            "Students Management System ready."
        );

    }
);
