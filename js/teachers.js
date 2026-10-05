const storageKey = "schoolManagementTeachers";

const seedTeachers = [
  {
    id: "t-001",
    firstName: "Amina",
    lastName: "Mashauri",
    gender: "Female",
    staffId: "TCH-001",
    email: "amina.mashauri@school.edu",
    phone: "+255 712 345 678",
    department: "Science",
    subject: "Biology",
    qualification: "B.Ed. Science",
    address: "Dar es Salaam",
    status: "Active"
  },
  {
    id: "t-002",
    firstName: "Joseph",
    lastName: "Mrema",
    gender: "Male",
    staffId: "TCH-002",
    email: "joseph.mrema@school.edu",
    phone: "+255 713 456 789",
    department: "Mathematics",
    subject: "Mathematics",
    qualification: "B.Sc. Mathematics",
    address: "Dar es Salaam",
    status: "Active"
  }
];

const $ = (id) => document.getElementById(id);

let teachers = loadTeachers();
let toastTimer;

function loadTeachers() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved : seedTeachers;
  } catch {
    return seedTeachers;
  }
}

function saveTeachers() {
  localStorage.setItem(storageKey, JSON.stringify(teachers));
}

function escapeHtml(value = "") {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function openModal(id) {
  $(id).classList.add("show");
}

function closeModal(id) {
  $(id).classList.remove("show");
}

function showSuccess(message) {
  const toast = $("successToast");

  clearTimeout(toastTimer);

  toast.textContent = "✓ " + message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function renderTeachers() {
  const search = $("searchTeacher").value.trim().toLowerCase();
  const selectedDepartment = $("departmentFilter").value;
  const selectedStatus = $("statusFilter").value;

  const departments = [...new Set(teachers.map(t => t.department))].sort();

  $("departmentFilter").innerHTML =
    `<option value="">All departments</option>` +
    departments.map(department =>
      `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`
    ).join("");

  $("departmentFilter").value = selectedDepartment;

  const filteredTeachers = teachers.filter(teacher => {
    const text =
      `${teacher.firstName} ${teacher.lastName} ${teacher.staffId} ${teacher.subject} ${teacher.phone}`.toLowerCase();

    return (
      (!search || text.includes(search)) &&
      (!selectedDepartment || teacher.department === selectedDepartment) &&
      (!selectedStatus || teacher.status === selectedStatus)
    );
  });

  $("totalTeachers").textContent = teachers.length;
  $("maleTeachers").textContent = teachers.filter(t => t.gender === "Male").length;
  $("femaleTeachers").textContent = teachers.filter(t => t.gender === "Female").length;
  $("activeTeachers").textContent = teachers.filter(t => t.status === "Active").length;

  $("teacherCount").textContent =
    `${filteredTeachers.length} teacher${filteredTeachers.length === 1 ? "" : "s"}`;

  $("teachersTableBody").innerHTML = filteredTeachers.map(teacher => `
    <tr>
      <td>
        <span class="teacher-name">${escapeHtml(teacher.firstName)} ${escapeHtml(teacher.lastName)}</span>
        <span class="teacher-email">${escapeHtml(teacher.email)}</span>
      </td>
      <td>${escapeHtml(teacher.staffId)}</td>
      <td>${escapeHtml(teacher.department)}</td>
      <td>${escapeHtml(teacher.subject)}</td>
      <td>${escapeHtml(teacher.phone)}</td>
      <td><span class="badge ${teacher.status.toLowerCase()}">${escapeHtml(teacher.status)}</span></td>
      <td class="action-buttons">
        <button data-action="view" data-id="${teacher.id}">View</button>
        <button data-action="edit" data-id="${teacher.id}">Edit</button>
        <button class="delete" data-action="delete" data-id="${teacher.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  $("emptyState").hidden = filteredTeachers.length !== 0;
}

function openTeacherForm(teacher = null) {
  $("teacherForm").reset();
  $("formError").textContent = "";
  $("teacherRecordId").value = teacher ? teacher.id : "";

  $("teacherModalTitle").textContent = teacher ? "Edit Teacher" : "Add Teacher";
  $("teacherModalText").textContent = teacher
    ? "Update this teacher's information."
    : "Enter the teacher's information below.";

  $("saveTeacherButton").textContent = teacher ? "Save Changes" : "Save Teacher";

  if (teacher) {
    ["firstName", "lastName", "gender", "staffId", "email", "phone", "department", "subject", "qualification", "address", "status"]
      .forEach(key => {
        $(key).value = teacher[key] || "";
      });
  }

  openModal("teacherModal");
}

function showProfile(teacher) {
  $("profileContent").innerHTML = `
    <div class="profile-body">
      <div class="profile-identity">
        <div class="profile-initials">${teacher.firstName[0]}${teacher.lastName[0]}</div>
        <div>
          <h3>${escapeHtml(teacher.firstName)} ${escapeHtml(teacher.lastName)}</h3>
          <p>${escapeHtml(teacher.staffId)} · ${escapeHtml(teacher.subject)}</p>
        </div>
      </div>

      <div class="profile-details">
        <div><p>Email</p><strong>${escapeHtml(teacher.email)}</strong></div>
        <div><p>Phone</p><strong>${escapeHtml(teacher.phone)}</strong></div>
        <div><p>Gender</p><strong>${escapeHtml(teacher.gender)}</strong></div>
        <div><p>Status</p><strong>${escapeHtml(teacher.status)}</strong></div>
        <div><p>Department</p><strong>${escapeHtml(teacher.department)}</strong></div>
        <div><p>Qualification</p><strong>${escapeHtml(teacher.qualification)}</strong></div>
        <div><p>Address</p><strong>${escapeHtml(teacher.address || "—")}</strong></div>
      </div>
    </div>
  `;

  openModal("profileModal");
}

$("addTeacherButton").addEventListener("click", () => {
  openTeacherForm();
});

$("teacherForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const recordId = $("teacherRecordId").value;

  const teacher = {
    id: recordId || `t-${Date.now()}`,
    firstName: $("firstName").value.trim(),
    lastName: $("lastName").value.trim(),
    gender: $("gender").value,
    staffId: $("staffId").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    department: $("department").value.trim(),
    subject: $("subject").value.trim(),
    qualification: $("qualification").value.trim(),
    address: $("address").value.trim(),
    status: $("status").value
  };

  const duplicate = teachers.some(item =>
    item.staffId.toLowerCase() === teacher.staffId.toLowerCase() &&
    item.id !== recordId
  );

  if (duplicate) {
    $("formError").textContent = "This Staff ID is already in use.";
    return;
  }

  if (recordId) {
    teachers = teachers.map(item => item.id === recordId ? teacher : item);
  } else {
    teachers.unshift(teacher);
  }

  saveTeachers();
  closeModal("teacherModal");
  renderTeachers();

  showSuccess(
    recordId
      ? "Teacher details updated successfully."
      : "Teacher saved successfully."
  );
});

$("teachersTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const teacher = teachers.find(item => item.id === button.dataset.id);
  if (!teacher) return;

  if (button.dataset.action === "view") showProfile(teacher);
  if (button.dataset.action === "edit") openTeacherForm(teacher);

  if (button.dataset.action === "delete") {
    if (confirm(`Delete ${teacher.firstName} ${teacher.lastName}?`)) {
      teachers = teachers.filter(item => item.id !== teacher.id);
      saveTeachers();
      renderTeachers();
      showSuccess(
            "Teacher deleted successfully."
        );
  
    }
  }
});

$("searchTeacher").addEventListener("input", renderTeachers);
$("departmentFilter").addEventListener("change", renderTeachers);
$("statusFilter").addEventListener("change", renderTeachers);

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close]");

  if (closeButton) {
    closeModal(closeButton.dataset.close);
  }

  if (event.target.classList.contains("modal")) {
    closeModal(event.target.id);
  }
});

$("sidebarOverlay").addEventListener("click", () => {
  $("sidebar").classList.remove("show");
  $("sidebarOverlay").classList.remove("show");
});

document.querySelector(".menu-toggle").addEventListener("click", () => {
  $("sidebar").classList.toggle("show");
  $("sidebarOverlay").classList.toggle("show");
});

renderTeachers();