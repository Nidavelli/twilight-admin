import { showToast } from "../../scripts/utils/toast";

class MainHeader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.attachEvents();
    this.setThemeFromStorage();
    this.setActiveNav();
    this.requireAuth();
  }

  render() {
    this.innerHTML = `
      <header class="main-header glassmorphic">
        <div class="container header-content">
          <div class="logo">Neszi Admin</div>

          <button class="menu-toggle" aria-label="Toggle Menu" id="menuToggle">
            <i class="bx bx-menu"></i>
          </button>
          <nav class="nav" id="mainNav">
            <a href="add-items.html">Add Items</a>
            <a href="list-items.html">List Items</a>
            <a href="orders.html">Orders</a>
          </nav>
          <div class="actions">
            <button id="theme-toggle" class="btn btn--icon" title="Toggle theme">
              <i class="bx bx-moon"></i>
            </button>
            <button id="logoutBtn" class="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

    `;
  }

  attachEvents() {
    this.querySelector("#theme-toggle")?.addEventListener(
      "click",
      this.toggleTheme.bind(this)
    );
    this.querySelector("#logoutBtn")?.addEventListener(
      "click",
      this.logout.bind(this)
    );

    const menuToggleBtn = this.querySelector("#menuToggle");
    const nav = this.querySelector("#mainNav");

    menuToggleBtn?.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    const icon = this.querySelector("#theme-toggle i");
    icon.className = newTheme === "dark" ? "bx bx-sun" : "bx bx-moon";
  }

  setThemeFromStorage() {
    const stored = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", stored);
    const icon = this.querySelector("#theme-toggle i");
    icon.className = stored === "dark" ? "bx bx-sun" : "bx bx-moon";
  }

  logout() {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("adminToken");
      showToast("Logged out!", "success");
      setTimeout(() => (window.location.href = "index.html"), 1000);
    }
  }

  setActiveNav() {
    const current = location.pathname.split("/").pop();
    this.querySelectorAll("nav a").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }
    });
  }

  requireAuth() {
    const token = localStorage.getItem("adminToken");
    if (!token) window.location.href = "index.html";
  }
}

customElements.define("main-header", MainHeader);
