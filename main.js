// main.js

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const root = document.documentElement;

  // Get stored theme from localStorage or default to dark
  const savedTheme = localStorage.getItem("theme") || "dark";
  root.setAttribute("data-theme", savedTheme);

  // Update icon (optional)
  updateToggleIcon(savedTheme);

  themeToggleBtn?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateToggleIcon(newTheme);
  });

  function updateToggleIcon(theme) {
    const icon = themeToggleBtn.querySelector("i");
    if (!icon) return;
    icon.className = theme === "dark" ? "bx bx-moon" : "bx bx-sun";
  }
});
