"use strict";

const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const currentNavItem = {
    "": "home",
    "index.html": "home",
    "about.html": "about",
    "contact.html": "contact",
    "login.html": "login",
    "dashboard.html": "dashboard"
}[currentPage];

if (currentNavItem) {
    document.querySelectorAll("[data-nav]").forEach((link) => {
        const isCurrentPage = link.dataset.nav === currentNavItem;
        link.classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}
