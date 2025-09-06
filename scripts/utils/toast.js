// utils/toast.js
export function showToast(message = "Done", type = "success") {
  const existing = document.getElementById("toast-popup");
  if (existing) existing.remove();

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    default: "✨",
  };

  const toast = document.createElement("div");
  toast.id = "toast-popup";
  toast.className = "toast-popup";
  toast.innerHTML = `<span class="toast-icon">${
    icons[type] || icons.default
  }</span>
                     <span class="toast-message">${message}</span>`;

  document.body.appendChild(toast);

  // Force reflow to trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 2400);
}
