// orders.js

import { makeAuthenticatedRequest } from "./api.js";

const ordersList = document.getElementById("ordersList");
const loadingIndicator = document.getElementById("loadingIndicator");
const API_BASE_URL = "https://neszi-backend.onrender.com/api/admin";

export async function fetchOrders() {
  if (!ordersList) return;

  showLoading(true);
  const orders = await makeAuthenticatedRequest(`${API_BASE_URL}/orders`);
  showLoading(false);
  if (!orders) return;

  ordersList.innerHTML = "";
  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";
    orderCard.innerHTML = `
      <div class="col"><i class="fas fa-box-open fa-2x"></i></div>
      <div class="col">
        <strong>Order ID:</strong> #${order.id}<br>
        <strong>Customer:</strong> ${order.user_name}<br>
        <strong>Address:</strong> ${order.delivery_address.street}, ${
      order.delivery_address.city
    }<br>
        <strong>Items:</strong>
        <ul>${order.items
          .map((item) => `<li>${item.name} x${item.quantity}</li>`)
          .join("")}</ul>
      </div>
      <div class="col">
        <strong>Total Items:</strong> ${order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}<br>
        <strong>Method:</strong> ${order.payment_method}<br>
        <strong>Receipt #:</strong> ${order.mpesa_receipt_number || "N/A"}<br>
        <strong>Time:</strong> ${new Date(order.order_time).toLocaleString()}
      </div>
      <div class="col">
        <strong>KES ${(order.total_cost_cents / 100).toFixed(2)}</strong>
      </div>
      <div class="col">
        <select class="status-dropdown" data-order-id="${order.id}">
          ${["Pending", "Packing", "Shipped", "Out for Delivery", "Delivered"]
            .map(
              (status) =>
                `<option value="${status}" ${
                  order.status === status ? "selected" : ""
                }>${status}</option>`
            )
            .join("")}
        </select>
      </div>
    `;
    ordersList.appendChild(orderCard);
  });

  // Event listeners for dropdowns
  document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("change", async (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;

      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/orders/${orderId}/status`,
        "PUT",
        {
          status: newStatus,
        }
      );

      if (response) {
        alert(`Order #${orderId} status updated to ${newStatus}`);
      }
    });
  });
}

function showLoading(show = true) {
  if (!loadingIndicator) return;
  loadingIndicator.style.display = show ? "flex" : "none";
}

// Theme Toggle
document.getElementById("toggleThemeBtn")?.addEventListener("click", () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "light" ? "dark" : "light");
});

document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
});
