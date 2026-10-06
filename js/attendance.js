(function () {
    "use strict";

    // Demo records; replace this list with students loaded from the school database.
    const students = [
        { id: "ADM001245", name: "John Michael", className: "Form 4", level: "ordinary", stream: "A" },
        { id: "ADM001246", name: "Aisha Said", className: "Form 3", level: "ordinary", stream: "A" },
        { id: "ADM001247", name: "Daniel Kelvin", className: "Form 2", level: "ordinary", stream: "B" },
        { id: "ADM001248", name: "Fatma Nassor", className: "Form 1", level: "ordinary", stream: "B" },
        { id: "ADM001249", name: "Yohana Isaya", className: "Form 4", level: "ordinary", stream: "B" },
        { id: "ADM005101", name: "Neema Joseph", className: "Form 5", level: "advanced", stream: "A" },
        { id: "ADM005102", name: "Peter Emmanuel", className: "Form 5", level: "advanced", stream: "B" },
        { id: "ADM006101", name: "Grace Michael", className: "Form 6", level: "advanced", stream: "A" },
        { id: "ADM006102", name: "Hassan Ally", className: "Form 6", level: "advanced", stream: "B" }
    ];

    const statusOptions = ["Present", "Absent", "Late", "Excused"];
    const dateInput = document.getElementById("attendanceDate");
    const levelFilter = document.getElementById("levelFilter");
    const classFilter = document.getElementById("classFilter");
    const sessionFilter = document.getElementById("sessionFilter");
    const streamFilter = document.getElementById("streamFilter");
    const searchInput = document.getElementById("studentSearch");
    const rows = document.getElementById("attendanceRows");
    const message = document.getElementById("attendanceMessage");
    const storageKey = "schoolManagementAttendance";
    let attendanceRecords = {};

    function todayAsInputValue() {
        const now = new Date();
        const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 10);
    }

    function recordKey(studentId) {
        return [dateInput.value, sessionFilter.value, studentId].join("|");
    }

    function loadRecords() {
        try {
            const saved = window.localStorage.getItem(storageKey);
            attendanceRecords = saved ? JSON.parse(saved) : {};
            if (!attendanceRecords || Array.isArray(attendanceRecords) || typeof attendanceRecords !== "object") {
                throw new Error("Saved attendance data has an invalid format.");
            }
        } catch (error) {
            attendanceRecords = {};
            message.textContent = "Saved attendance could not be read. New changes may not include previous records.";
            console.error("Unable to load attendance records:", error);
        }
    }

    function saveRecords() {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(attendanceRecords));
            message.textContent = "Attendance saved in this browser.";
        } catch (error) {
            message.textContent = "Could not save attendance. Check browser storage settings and try again.";
            console.error("Unable to save attendance records:", error);
        }
    }

    function visibleStudents() {
        const level = levelFilter.value;
        const selectedClass = classFilter.value;
        const selectedStream = streamFilter.value;
        const search = searchInput.value.trim().toLowerCase();

        return students.filter(function (student) {
            const matchesClass = selectedClass === "all" || student.className === selectedClass;
            const matchesStream = selectedStream === "all" || student.stream === selectedStream;
            const matchesSearch = !search ||
                student.name.toLowerCase().includes(search) ||
                student.id.toLowerCase().includes(search);

            return student.level === level && matchesClass && matchesStream && matchesSearch;
        });
    }

    function updateClassOptions() {
        const previousClass = classFilter.value;
        const classNames = students
            .filter(function (student) {
                return student.level === levelFilter.value;
            })
            .map(function (student) {
                return student.className;
            })
            .filter(function (className, index, allClasses) {
                return allClasses.indexOf(className) === index;
            })
            .sort(function (first, second) {
                return Number(first.replace("Form ", "")) - Number(second.replace("Form ", ""));
            });

        classFilter.replaceChildren(new Option("All classes", "all"));
        classNames.forEach(function (className) {
            classFilter.add(new Option(className, className));
        });

        if (classNames.includes(previousClass)) {
            classFilter.value = previousClass;
        }
    }

    function createStudentRow(student) {
        const row = document.createElement("tr");
        row.dataset.studentId = student.id;

        const studentCell = document.createElement("td");
        const studentInfo = document.createElement("div");
        studentInfo.className = "attendance-student";
        const avatar = document.createElement("div");
        avatar.className = "attendance-student-avatar";
        avatar.textContent = student.name.split(/\s+/).map(function (part) {
            return part.charAt(0);
        }).slice(0, 2).join("").toUpperCase();
        const nameBlock = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = student.name;
        nameBlock.appendChild(name);
        studentInfo.append(avatar, nameBlock);
        studentCell.appendChild(studentInfo);

        const admissionCell = document.createElement("td");
        admissionCell.textContent = student.id;

        const classCell = document.createElement("td");
        const classBadge = document.createElement("span");
        classBadge.className = "attendance-class";
        classBadge.textContent = student.className + " · " + student.stream;
        classCell.appendChild(classBadge);

        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");
        statusSelect.className = "attendance-select";
        statusSelect.setAttribute("aria-label", "Attendance status for " + student.name);
        statusSelect.dataset.field = "status";
        statusSelect.add(new Option("Not marked", ""));
        statusOptions.forEach(function (status) {
            statusSelect.add(new Option(status, status));
        });

        const noteCell = document.createElement("td");
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.className = "attendance-note";
        noteInput.placeholder = "Add a note";
        noteInput.maxLength = 120;
        noteInput.setAttribute("aria-label", "Optional attendance note for " + student.name);
        noteInput.dataset.field = "note";

        const record = attendanceRecords[recordKey(student.id)];
        if (record && statusOptions.includes(record.status)) {
            statusSelect.value = record.status;
            noteInput.value = typeof record.note === "string" ? record.note : "";
        }

        statusSelect.addEventListener("change", updateSummary);
        row.append(studentCell, admissionCell, classCell, statusCell, noteCell);
        statusCell.appendChild(statusSelect);
        noteCell.appendChild(noteInput);
        return row;
    }

    function renderAttendance() {
        rows.replaceChildren();
        const currentStudents = visibleStudents();

        if (currentStudents.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = 5;
            emptyCell.className = "attendance-empty";
            emptyCell.textContent = "No students match the selected level, class, stream or search.";
            emptyRow.appendChild(emptyCell);
            rows.appendChild(emptyRow);
        } else {
            currentStudents.forEach(function (student) {
                rows.appendChild(createStudentRow(student));
            });
        }

        document.getElementById("registerDescription").textContent =
            (levelFilter.value === "ordinary" ? "Ordinary Level" : "Advanced Level") +
            " · " + (classFilter.value === "all" ? "All classes" : classFilter.value) +
            " · " + sessionFilter.value + " session · " + dateInput.value;
        updateSummary();
    }

    function updateSummary() {
        const visibleRows = Array.from(rows.querySelectorAll("tr[data-student-id]"));
        let present = 0;
        let absent = 0;
        let late = 0;
        let marked = 0;

        visibleRows.forEach(function (row) {
            const status = row.querySelector('[data-field="status"]').value;
            if (status) {
                marked += 1;
            }
            if (status === "Present") {
                present += 1;
            } else if (status === "Absent") {
                absent += 1;
            } else if (status === "Late") {
                late += 1;
            }
        });

        const total = visibleRows.length;
        const rate = total ? Math.round(((present + late) / total) * 100) : 0;
        document.getElementById("totalCount").textContent = total;
        document.getElementById("presentCount").textContent = present;
        document.getElementById("absentCount").textContent = absent;
        document.getElementById("attendanceRate").textContent = rate + "%";
        document.getElementById("visibleCount").textContent =
            "Showing " + total + " students · " + marked + " marked" +
            (late ? " · " + late + " late" : "");
    }

    function saveVisibleAttendance() {
        const visibleRows = rows.querySelectorAll("tr[data-student-id]");
        visibleRows.forEach(function (row) {
            const status = row.querySelector('[data-field="status"]').value;
            const note = row.querySelector('[data-field="note"]').value.trim();
            const key = recordKey(row.dataset.studentId);
            const student = students.find(function (item) {
                return item.id === row.dataset.studentId;
            });

            if (status) {
                attendanceRecords[key] = {
                    status: status,
                    note: note,
                    level: student.level,
                    className: student.className,
                    stream: student.stream,
                    updatedAt: new Date().toISOString()
                };
            } else {
                delete attendanceRecords[key];
            }
        });

        saveRecords();
        updateSummary();
    }

    dateInput.value = todayAsInputValue();
    loadRecords();
    updateClassOptions();
    renderAttendance();

    levelFilter.addEventListener("change", function () {
        updateClassOptions();
        message.textContent = "";
        renderAttendance();
    });

    [classFilter, streamFilter, searchInput].forEach(function (control) {
        control.addEventListener(control === searchInput ? "input" : "change", function () {
            message.textContent = "";
            renderAttendance();
        });
    });

    [dateInput, sessionFilter].forEach(function (control) {
        control.addEventListener("change", function () {
            message.textContent = "";
            renderAttendance();
        });
    });

    document.getElementById("markAllPresent").addEventListener("click", function () {
        rows.querySelectorAll('[data-field="status"]').forEach(function (select) {
            select.value = "Present";
        });
        message.textContent = "";
        updateSummary();
    });

    document.getElementById("saveAttendance").addEventListener("click", saveVisibleAttendance);
    document.getElementById("printAttendance").addEventListener("click", function () {
        window.print();
    });
}());
