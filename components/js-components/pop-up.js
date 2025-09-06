class PopUp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="popup-modal" class="popup-container draggable" style="display:none;">
        <div class="popup-header">
          <h3 class="popup-title"></h3>
          <button class="close-popup-btn">&times;</button>
        </div>
        <div class="popup-content">
          <i class="popup-icon"></i>
          <p class="popup-message"></p>
          <div class="popup-actions">
            <a href="/pages/shop.html" class="popup-action-btn secondary-btn" style="display:none;">Continue Shopping</a>
            <a href="#" class="popup-action-btn primary-btn" style="display:none;"></a>
          </div>
        </div>
      </div>
    `;

    this.addDragFunctionality();
    this.querySelector(".close-popup-btn").addEventListener("click", () =>
      this.hide()
    );
  }

  addDragFunctionality() {
    const popup = this.querySelector(".popup-container");
    const header = this.querySelector(".popup-header");
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = popup.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.top}px`;
      popup.style.transform = "none";
      popup.style.position = "fixed";
      popup.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      popup.style.cursor = "grab";
    });
  }

  show({ title, message, iconClass, buttonText, buttonUrl }) {
    this.querySelector(".popup-title").textContent = title || "Notice";
    this.querySelector(".popup-message").innerHTML = message;
    this.querySelector(".popup-icon").className = `popup-icon ${
      iconClass || ""
    }`;

    const primaryBtn = this.querySelector(".primary-btn");
    const secondaryBtn = this.querySelector(".secondary-btn");

    if (buttonText && buttonUrl) {
      primaryBtn.textContent = buttonText;
      primaryBtn.href = buttonUrl;
      primaryBtn.style.display = "inline-block";
    } else {
      primaryBtn.style.display = "none";
    }

    secondaryBtn.style.display = "inline-block";
    this.querySelector("#popup-modal").style.display = "block";
  }

  hide() {
    this.querySelector("#popup-modal").style.display = "none";
  }
}

customElements.define("custom-pop-up", PopUp);
