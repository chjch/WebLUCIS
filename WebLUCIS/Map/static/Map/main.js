const sidebarToggler = document.querySelector("[data-sidebar-toggler]");
const sidebarIcon = document.querySelector("[data-sidebar-icon]");
const rightsidebarToggler = document.getElementById("right-sidebar-toggler");
const rightsidebarIcon = document.getElementById('right-sidebar-toggler-icon');
// Toggle button positioning
sidebarToggler.addEventListener("click", () => {
    sidebarToggler.classList.toggle("no-sidebar");
    sidebarIcon.classList.toggle("bi-chevron-right");
});
// rightsidebarToggler.addEventListener("click", () => {
//     rightsidebarToggler.classList.toggle("no-rightsidebar");
//     rightsidebarIcon.classList.toggle("bi-chevron-right");
// });
