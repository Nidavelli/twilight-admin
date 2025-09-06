import { makeAuthenticatedRequest } from "./api.js";
import { showToast } from "./utils/toast.js";
import { API_BASE_URL } from "./config.js";

const ENDPOINT_BASE = `${API_BASE_URL}/api/admin/products`;

// Global DOM references and scanner instance
let DOM = {};
let scanner = null;

document.addEventListener("DOMContentLoaded", () => {
  initDOM();
  fetchProducts();
  setupGlobalListeners();
});

function initDOM() {
  DOM = {
    productList: document.getElementById("productListContainer"),
    editModal: document.getElementById("editModal"),
    editForm: document.getElementById("editProductForm"),
    inventoryModal: document.getElementById("addInventoryModal"),
    inventoryForm: document.getElementById("addInventoryForm"),
    inventoryQty: document.getElementById("inventoryQuantity"),
    sameBarcodeCheckbox: document.getElementById("sameBarcodeCheckbox"),
    dynamicInputs: document.getElementById("dynamic-inputs-container"),
    scannerContainer: document.getElementById("scanner-container"),
    adminPopup: document.querySelector("custom-pop-up"),
    closeInventoryBtn: document.getElementById("closeInventoryModal"),
    closeEditBtn: document.getElementById("closeEditModal"),
  };
}

async function fetchProducts() {
  if (!DOM.productList) return;

  renderSkeletons();

  try {
    const data = await makeAuthenticatedRequest(ENDPOINT_BASE, "GET");
    renderProducts(data || []);
  } catch (error) {
    console.error("Fetch products error:", error);
    showToast("Failed to load products.", "error");
    DOM.productList.innerHTML = "<p>Could not load products.</p>";
  }
}

function renderSkeletons() {
  DOM.productList.innerHTML = Array(3)
    .fill(
      `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-details">
        <div class="skeleton-line skeleton-name"></div>
        <div class="skeleton-line skeleton-price"></div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderProducts(products) {
  DOM.productList.innerHTML = "";

  if (!products.length) {
    DOM.productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach((product) => {
    const priceFormatted = (product.price_cents / 100).toFixed(2);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">KES ${priceFormatted}</p>
      </div>
      <div class="card-actions">
        <button class="add-inventory-btn btn-icon" data-id="${product.id}">
          <i class="bx bx-plus"></i>
        </button>
        <button class="edit-btn btn-icon"
                data-id="${product.id}"
                data-name="${product.name}"
                data-desc="${product.description}"
                data-rich_description="${product.rich_description || ""}"
                data-brand="${product.brand || ""}"
                data-price="${priceFormatted}"
                data-is_featured="${product.is_featured}"
                data-keywords='${JSON.stringify(product.keywords || [])}'>
          <i class="bx bx-edit"></i>
        </button>
        <button class="delete-btn btn-icon" data-id="${product.id}">
          <i class="bx bx-trash"></i>
        </button>
      </div>
    `;
    DOM.productList.appendChild(card);
  });

  setupProductActionListeners();
}

// Setup listeners related to product cards
function setupProductActionListeners() {
  DOM.productList
    .querySelectorAll(".edit-btn")
    .forEach((btn) => btn.addEventListener("click", onEditClick));
  DOM.productList
    .querySelectorAll(".delete-btn")
    .forEach((btn) => btn.addEventListener("click", onDeleteClick));
  DOM.productList
    .querySelectorAll(".add-inventory-btn")
    .forEach((btn) => btn.addEventListener("click", onAddInventoryClick));
}

// Setup global listeners once on page load
function setupGlobalListeners() {
  DOM.editForm?.addEventListener("submit", onEditSubmit);
  DOM.inventoryForm?.addEventListener("submit", onInventorySubmit);

  DOM.inventoryQty?.addEventListener("input", (e) =>
    renderBarcodeInputs(Number(e.target.value))
  );

  DOM.sameBarcodeCheckbox?.addEventListener("change", onSameBarcodeToggle);

  DOM.closeInventoryBtn?.addEventListener("click", closeInventoryModal);
  DOM.closeEditBtn?.addEventListener("click", () => {
    DOM.editModal.style.display = "none";
  });

  // Close modals when clicking outside them
  window.addEventListener("click", (e) => {
    if (e.target === DOM.inventoryModal) closeInventoryModal();
    if (e.target === DOM.editModal) DOM.editModal.style.display = "none";
  });
}

function onEditClick(e) {
  const btn = e.currentTarget;
  const {
    id,
    name,
    desc,
    rich_description,
    brand,
    price,
    is_featured,
    keywords,
  } = btn.dataset;

  DOM.editForm.querySelector("#editProductId").value = id;
  DOM.editForm.querySelector("#editProductName").value = name || "";
  DOM.editForm.querySelector("#editProductDescription").value = desc || "";
  DOM.editForm.querySelector("#editProductRichDescription").value =
    rich_description || "";
  DOM.editForm.querySelector("#editProductBrand").value = brand || "";
  DOM.editForm.querySelector("#editProductPrice").value = price || "";
  DOM.editForm.querySelector("#editProductIsFeatured").checked =
    is_featured === "true";

  DOM.editForm.querySelector("#editProductKeywords").value = keywords
    ? keywords.replace(/\[|\]|"/g, "")
    : "";

  DOM.editModal.style.display = "flex";
}

async function onEditSubmit(e) {
  e.preventDefault();
  const id = DOM.editForm.querySelector("#editProductId").value;

  const updated = {
    name: DOM.editForm.querySelector("#editProductName").value.trim(),
    description: DOM.editForm
      .querySelector("#editProductDescription")
      .value.trim(),
    rich_description: DOM.editForm
      .querySelector("#editProductRichDescription")
      .value.trim(),
    brand: DOM.editForm.querySelector("#editProductBrand").value.trim(),
    price_cents: Math.round(
      parseFloat(DOM.editForm.querySelector("#editProductPrice").value) * 100
    ),
    is_featured: DOM.editForm.querySelector("#editProductIsFeatured").checked,
    keywords: DOM.editForm
      .querySelector("#editProductKeywords")
      .value.split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0),
  };

  try {
    const res = await makeAuthenticatedRequest(
      `${ENDPOINT_BASE}/${id}`,
      "PUT",
      updated
    );
    showToast(res.message || "Product updated successfully.", "success");
    DOM.editModal.style.display = "none";
    fetchProducts();
  } catch (error) {
    console.error("Update product error:", error);
    showToast(
      error.message || "Failed updating product. Please try again.",
      "error"
    );
  }
}

async function onDeleteClick(e) {
  const id = e.currentTarget.dataset.id;
  try {
    const confirmed = await DOM.adminPopup.confirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
    });

    if (!confirmed) return;

    const res = await makeAuthenticatedRequest(
      `${ENDPOINT_BASE}/${id}`,
      "DELETE"
    );
    showToast(res.message || "Product deleted successfully.", "success");
    fetchProducts();
  } catch (error) {
    console.error("Delete product error:", error);
    showToast(
      error.message || "Failed to delete product. Please try again.",
      "error"
    );
  }
}

function onAddInventoryClick(e) {
  const id = e.currentTarget.dataset.id;
  DOM.inventoryForm.querySelector("#inventoryProductId").value = id;
  DOM.inventoryQty.value = "1"; // reset qty to 1
  DOM.sameBarcodeCheckbox.checked = false; // reset checkbox
  renderBarcodeInputs(1);
  DOM.inventoryModal.style.display = "flex";
  startScanbotScanner();
}

async function onInventorySubmit(e) {
  e.preventDefault();
  stopScanbotScanner();

  const productId = DOM.inventoryForm.querySelector(
    "#inventoryProductId"
  ).value;
  const barcodeInputs = DOM.dynamicInputs.querySelectorAll(".barcode-input");
  const serialInputs = DOM.dynamicInputs.querySelectorAll(".serial-input");
  const baseTimestamp = Date.now();

  try {
    const items = Array.from(barcodeInputs).map((input, i) => {
      const barcode = input.value.trim();
      if (!barcode) throw new Error(`Barcode #${i + 1} is empty`);

      let serial = serialInputs[i].value.trim();
      if (!serial) {
        serial = `Neszi-${baseTimestamp}-${i + 1}`;
      }

      return {
        barcode,
        serial,
      };
    });

    if (!items.length) throw new Error("No items to add.");

    const res = await makeAuthenticatedRequest(
      `${ENDPOINT_BASE}/${productId}/items`,
      "POST",
      items
    );

    showToast(res.message || "Inventory added successfully.", "success");
    closeInventoryModal();
  } catch (error) {
    console.error("Add inventory error:", error);
    showToast(
      error.message || "Failed to add inventory. Please check input.",
      "error"
    );
  }
}

function renderBarcodeInputs(quantity) {
  DOM.dynamicInputs.innerHTML = "";

  if (!quantity || quantity <= 0) {
    DOM.dynamicInputs.innerHTML = "<p>Please enter a valid quantity.</p>";
    return;
  }

  for (let i = 0; i < quantity; i++) {
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "barcode-item";

    inputWrapper.innerHTML = `
      <input
        type="text"
        class="barcode-input"
        placeholder="Enter barcode"
        autocomplete="off"
        aria-label="Barcode #${i + 1}"
      />
      <input
        type="text"
        class="serial-input"
        placeholder="Enter serial or leave blank"
        autocomplete="off"
        aria-label="Serial #${i + 1}"
      />
    `;

    DOM.dynamicInputs.appendChild(inputWrapper);
  }
}

function onSameBarcodeToggle() {
  const inputs = DOM.dynamicInputs.querySelectorAll(".barcode-input");
  if (DOM.sameBarcodeCheckbox.checked && inputs.length > 0) {
    // Copy first barcode to all others
    const firstValue = inputs[0].value.trim();
    inputs.forEach((input) => (input.value = firstValue));
  }
}

function closeInventoryModal() {
  stopScanbotScanner();
  DOM.inventoryModal.style.display = "none";
  DOM.dynamicInputs.innerHTML = "";
  DOM.inventoryQty.value = "1";
  DOM.sameBarcodeCheckbox.checked = false;
}

// --- Scanbot SDK Integration ---

// Load and initialize the Scanbot Web SDK, create scanner instance
async function startScanbotScanner() {
  if (scanner) return; // Already started

  try {
    // Initialize the SDK
    const sdkModule = await import("scanbot-web-sdk");
    const ScanbotSDK = sdkModule.default;

    const sdk = await ScanbotSDK.initialize({
      licenseKey:
        "C3/wX/j8AawV9GXqwWYiuMWheiuZ5w" +
        "9+QQfYZsIGyGAeOTNfYmGpg2xTlnu/" +
        "1AIfCtVoqUtvEt/HBHIxyfn+HI2b3R" +
        "PGXjSfnWtbnDlaXs/jvt39VzvO/F3K" +
        "YY1I4W3feh3rBFMvrCg+oJ111UlPjI" +
        "D0AAr1NKpxj35OtRWDkKjk603rKAmg" +
        "JKQULeu6hvqBJAGCFAVY6mybWFG5wP" +
        "hC618cdwNoprM+iSzbH4q9rcLM/kjC" +
        "IS/rfcaLXBPdyukwlwDWAZDjSJFcj/" +
        "D9gQIJO7wl901kC5ooYaXFsgOa5p1A" +
        "J9eKVBDR6B4LKEc+31SIBA+mGEtWm1" +
        "1+wasCNCiHyw==\nU2NhbmJvdFNESw" +
        "psb2NhbGhvc3R8bmVzemkKMTc1Nzgw" +
        "Nzk5OQo4Mzg4NjA3Cjg=\n", // Replace with your actual license key
      enginePath:
        "https://cdn.jsdelivr.net/npm/scanbot-web-sdk@latest/bundle/bin/complete/",
      logging: false,
    });

    if (!DOM.scannerContainer) {
      throw new Error("Scanner container element not found.");
    }

    const scanner = await sdk.createBarcodeScanner({
      container: DOM.scannerContainer,
      onBarcodesDetected,
      playSoundOnScan: true, // 🔊 Beep on scan
      showFinder: true, // 🎯 Viewfinder
      showDetectedBarcodes: true, // 🌀 AR overlay
      barcodeFormats: ["ALL"], // 🔍 Scan all formats
    });

    await scanner.start();
  } catch (error) {
    console.error("Scanbot SDK init error:", error);
    showToast(
      "Failed to initialize barcode scanner. Please check camera permissions.",
      "error"
    );
  }
}

// Cleanly stop and dispose scanner
async function stopScanbotScanner() {
  try {
    if (scanner) {
      await scanner.stop();
      scanner.dispose();
      scanner = null;
      DOM.scannerContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Scanbot SDK stop error:", error);
  }
}

// Handle detected barcodes from Scanbot scanner
function onBarcodesDetected(results) {
  if (!results || results.length === 0) return;

  const code = results[0]?.text?.trim();
  if (!code) return;

  const inputs = DOM.dynamicInputs.querySelectorAll(".barcode-input");
  if (DOM.sameBarcodeCheckbox.checked) {
    inputs.forEach((input) => {
      input.value = code;
    });
    showToast(`Scanned barcode: ${code} (all inputs filled)`, "success");
  } else {
    const emptyInput = Array.from(inputs).find((input) => !input.value.trim());
    if (emptyInput) {
      emptyInput.value = code;
      showToast(`Scanned barcode: ${code}`, "success");
    } else {
      showToast("All barcode fields are already filled", "info");
    }
  }
}
