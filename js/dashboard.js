function toggleSidebar() {

    const sidebar = document.querySelector(".sidebar");

    sidebar.classList.toggle("show");
}
// ACTIVE MENU
document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname
    .split("/")
    .pop();
    const menuItems = document.querySelectorAll(" .menu-item");

    menuItems.forEach(function(item) {
        const linkage = item.getAttribute("href");
        item.classList.remove("active");

        if(linkage === currentPage) {
            item.classList.add("active");
        }
    });
});
