// scripts/login.js
import { API_BASE_URL } from "./config.js";

import { setButtonLoading } from "./utils/buttonLoader.js";
import { showToast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const loginBtn = document.querySelector("#login-form button[type='submit']");
  const API_BASE_URL_LOCAL = `${API_BASE_URL}/api/admin`;

  const showLoading = (isLoading) => {
    setButtonLoading(loginBtn, isLoading, "Login");
  };

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      // Basic validation
      if (!email || !password) {
        showToast("Please enter both email and password", "warning");
        return;
      }

      showLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL_LOCAL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("adminToken", data.token);
          showToast("Login successful!", "success");
          setTimeout(() => {
            window.location.href = "pages/list-items.html";
          }, 1000);
        } else {
          showToast(data?.error || "Login failed", "error");
        }
      } catch (error) {
        console.error("Login Error:", error);
        showToast("Network error. Please try again.", "error");
      } finally {
        showLoading(false);
      }
    });
  }
});
