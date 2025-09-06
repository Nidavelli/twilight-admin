export function setButtonLoading(button, isLoading, text = "Login") {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-inline"></span>
      <span>${text}...</span>
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `<i class="bx bx-log-in"></i> ${text}`;
  }
}
