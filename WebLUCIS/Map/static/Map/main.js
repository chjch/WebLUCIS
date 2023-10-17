const sidebarToggler = document.querySelector("[data-sidebar-toggler]");
const sidebarIcon = document.querySelector("[data-sidebar-icon]");
// Toggle button positioning
sidebarToggler.addEventListener("click", () => {
    sidebarToggler.classList.toggle("no-sidebar");
    sidebarIcon.classList.toggle("bi-chevron-right");
});