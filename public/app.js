const state = {
  token: localStorage.getItem("ecom-token") || "",
  user: readStoredJson("ecom-user"),
  products: [],
  cartItems: [],
  orders: [],
  likeCounts: {},
  selectedProductId: localStorage.getItem("selected-product-id") || "",
  editingProductId: "",
};

const elements = {
  pages: [...document.querySelectorAll(".page")],
  authModal: document.querySelector("#authModal"),
  loginForm: document.querySelector("#loginForm"),
  signupForm: document.querySelector("#signupForm"),
  filterForm: document.querySelector("#filterForm"),
  adminProductForm: document.querySelector("#adminProductForm"),
  productTemplate: document.querySelector("#productCardTemplate"),
  productsGrid: document.querySelector("#productsGrid"),
  orderCartSummary: document.querySelector("#orderCartSummary"),
  orderCartList: document.querySelector("#orderCartList"),
  selectedProductPanel: document.querySelector("#selectedProductPanel"),
  profileSummary: document.querySelector("#profileSummary"),
  profileCartList: document.querySelector("#profileCartList"),
  orderHistoryList: document.querySelector("#orderHistoryList"),
  adminProductList: document.querySelector("#adminProductList"),
  adminFormTitle: document.querySelector("#adminFormTitle"),
  toastStack: document.querySelector("#toastStack"),
  openLoginBtn: document.querySelector("#openLoginBtn"),
  openRegisterBtn: document.querySelector("#openRegisterBtn"),
  heroLoginBtn: document.querySelector("#heroLoginBtn"),
  heroRegisterBtn: document.querySelector("#heroRegisterBtn"),
  heroLoggedInActions: document.querySelector("#heroLoggedInActions"),
  logoutBtn: document.querySelector("#logoutBtn"),
  showLoginTabBtn: document.querySelector("#showLoginTabBtn"),
  showRegisterTabBtn: document.querySelector("#showRegisterTabBtn"),
  productCount: document.querySelector("#productCount"),
  cartCount: document.querySelector("#cartCount"),
  orderCount: document.querySelector("#orderCount"),
  sessionTitle: document.querySelector("#sessionTitle"),
  sessionSubtitle: document.querySelector("#sessionSubtitle"),
  refreshShopBtn: document.querySelector("#refreshShopBtn"),
  refreshOrderBtn: document.querySelector("#refreshOrderBtn"),
  refreshProfileBtn: document.querySelector("#refreshProfileBtn"),
  resetAdminFormBtn: document.querySelector("#resetAdminFormBtn"),
  clearFiltersBtn: document.querySelector("#clearFiltersBtn"),
  placeOrderBtn: document.querySelector("#placeOrderBtn"),
};

bindEvents();
syncUiFromSession();
handleRouteChange();

if (state.token) {
  bootstrapApp();
}

window.addEventListener("hashchange", handleRouteChange);

function bindEvents() {
  elements.openLoginBtn.addEventListener("click", () => openAuthModal("login"));
  elements.openRegisterBtn.addEventListener("click", () =>
    openAuthModal("register"),
  );
  elements.heroLoginBtn.addEventListener("click", () => openAuthModal("login"));
  elements.heroRegisterBtn.addEventListener("click", () =>
    openAuthModal("register"),
  );
  elements.logoutBtn.addEventListener("click", logout);
  elements.showLoginTabBtn.addEventListener("click", () => setAuthTab("login"));
  elements.showRegisterTabBtn.addEventListener("click", () =>
    setAuthTab("register"),
  );
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.signupForm.addEventListener("submit", handleSignup);
  elements.filterForm.addEventListener("submit", handleFilter);
  elements.clearFiltersBtn.addEventListener("click", clearFilters);
  elements.refreshShopBtn.addEventListener("click", () => loadProducts());
  elements.refreshOrderBtn.addEventListener("click", () => loadCart());
  elements.refreshProfileBtn.addEventListener("click", bootstrapApp);
  elements.resetAdminFormBtn.addEventListener("click", resetAdminForm);
  elements.adminProductForm.addEventListener("submit", handleAdminSubmit);
  elements.placeOrderBtn.addEventListener("click", placeOrder);

  document.querySelectorAll("[data-close-modal]").forEach((node) => {
    node.addEventListener("click", closeAuthModal);
  });
}

async function bootstrapApp() {
  if (!state.token) {
    return;
  }

  const results = await Promise.allSettled([
    fetchCurrentUser(),
    loadProducts(),
    loadCart(),
    loadOrders(),
  ]);

  results.forEach((result) => {
    if (result.status === "rejected") {
      pushToast(result.reason.message, "error");
    }
  });
}

function handleRouteChange() {
  const route = getRoute();
  if (!canAccessRoute(route)) {
    location.hash = state.token ? "#shop" : "#home";
    return;
  }

  elements.pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.route === route);
  });
  renderOrderPage();
  renderProfile();
  renderAdminProducts();
}

function canAccessRoute(route) {
  if (route === "home") {
    return true;
  }
  if (!state.token) {
    pushToast("Login first to open that page.", "error");
    return false;
  }
  if (route === "admin" && !isAdmin()) {
    pushToast("Admin access required.", "error");
    return false;
  }
  return true;
}

function getRoute() {
  const route = location.hash.replace("#", "") || "home";
  return ["home", "shop", "order", "profile", "admin"].includes(route)
    ? route
    : "home";
}

function openAuthModal(tab) {
  setAuthTab(tab);
  elements.authModal.classList.remove("is-hidden");
  elements.authModal.setAttribute("aria-hidden", "false");
}

function closeAuthModal() {
  elements.authModal.classList.add("is-hidden");
  elements.authModal.setAttribute("aria-hidden", "true");
}

function setAuthTab(tab) {
  const isLogin = tab === "login";
  elements.showLoginTabBtn.classList.toggle("active", isLogin);
  elements.showRegisterTabBtn.classList.toggle("active", !isLogin);
  elements.loginForm.classList.toggle("is-hidden", !isLogin);
  elements.signupForm.classList.toggle("is-hidden", isLogin);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());

  try {
    const response = await apiRequest("/api/users/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.token = response.token || "";
    state.user = response.user || decodeJwt(response.token);
    persistSession();
    closeAuthModal();
    event.currentTarget.reset();
    syncUiFromSession();
    await bootstrapApp();
    location.hash = isAdmin() ? "#admin" : "#shop";
    pushToast(`Welcome back, ${state.user?.name || state.user?.email || "user"}.`, "success");
  } catch (error) {
    pushToast(error.message, "error");
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());

  try {
    const user = await apiRequest("/api/users/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    pushToast(`Account created for ${user.email}. Please log in.`, "success");
    event.currentTarget.reset();
    setAuthTab("login");
  } catch (error) {
    pushToast(error.message, "error");
  }
}

function logout() {
  state.token = "";
  state.user = null;
  state.products = [];
  state.cartItems = [];
  state.orders = [];
  state.likeCounts = {};
  state.selectedProductId = "";
  state.editingProductId = "";
  localStorage.removeItem("ecom-token");
  localStorage.removeItem("ecom-user");
  localStorage.removeItem("selected-product-id");
  elements.filterForm.reset();
  resetAdminForm();
  syncUiFromSession();
  renderProducts();
  renderOrderPage();
  renderProfile();
  renderAdminProducts();
  location.hash = "#home";
  pushToast("Logged out.", "success");
}

async function fetchCurrentUser() {
  const user = await apiRequest("/api/users/me");
  state.user = user;
  persistSession();
  syncUiFromSession();
}

async function loadProducts(endpoint = "/api/products") {
  const products = await apiRequest(endpoint);
  state.products = Array.isArray(products) ? products : [];
  await loadLikeCounts();
  renderProducts();
  renderOrderPage();
  renderAdminProducts();
  refreshSummaryStats();
}

async function loadCart() {
  try {
    const response = await apiRequest("/api/cart");
    state.cartItems = Array.isArray(response.items) ? response.items : [];
  } catch (error) {
    state.cartItems = [];
    if (!error.message.includes("No items in cart")) {
      throw error;
    }
  }

  renderOrderPage();
  renderProfile();
  refreshSummaryStats();
}

async function loadOrders() {
  const orders = await apiRequest("/api/orders");
  state.orders = Array.isArray(orders) ? orders : [];
  renderProfile();
  refreshSummaryStats();
}

async function loadLikeCounts() {
  const entries = await Promise.allSettled(
    state.products.map(async (product) => {
      const likes = await apiRequest(`/api/likes?id=${product._id}&type=Product`);
      return [product._id, Array.isArray(likes) ? likes.length : 0];
    }),
  );

  state.likeCounts = entries.reduce((accumulator, entry) => {
    if (entry.status === "fulfilled") {
      const [productId, count] = entry.value;
      accumulator[productId] = count;
    }
    return accumulator;
  }, {});
}

async function handleFilter(event) {
  event.preventDefault();
  const params = new URLSearchParams();
  const form = new FormData(event.currentTarget);

  form.forEach((value, key) => {
    if (`${value}`.trim()) {
      params.set(key, `${value}`.trim());
    }
  });

  const endpoint = params.toString()
    ? `/api/products/filter?${params.toString()}`
    : "/api/products";

  try {
    await loadProducts(endpoint);
    pushToast("Product list updated.", "success");
  } catch (error) {
    pushToast(error.message, "error");
  }
}

function clearFilters() {
  elements.filterForm.reset();
  loadProducts().catch((error) => pushToast(error.message, "error"));
}

function renderProducts() {
  if (!state.token) {
    elements.productsGrid.innerHTML =
      '<div class="surface empty-state">Login to browse the protected catalog.</div>';
    return;
  }

  if (!state.products.length) {
    elements.productsGrid.innerHTML =
      '<div class="surface empty-state">No products available yet.</div>';
    return;
  }

  elements.productsGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.products.forEach((product) => {
    const card = elements.productTemplate.content.cloneNode(true);
    const image = card.querySelector(".product-image");
    const category = card.querySelector(".product-category");
    const name = card.querySelector(".product-name");
    const price = card.querySelector(".product-price");
    const desc = card.querySelector(".product-desc");
    const sizes = card.querySelector(".product-sizes");
    const stock = card.querySelector(".product-stock");
    const likes = card.querySelector(".product-likes");
    const qtyInput = card.querySelector(".qty-input");
    const addCartBtn = card.querySelector(".add-cart-btn");
    const orderNowBtn = card.querySelector(".order-now-btn");
    const likeBtn = card.querySelector(".like-btn");
    const rateBtn = card.querySelector(".rate-btn");
    const ratingInput = card.querySelector(".rating-input");

    image.src = resolveProductImage(product.imageUrl);
    image.alt = product.name || "Product";
    category.textContent = product.category || "General";
    name.textContent = product.name || "Untitled product";
    price.textContent = formatCurrency(product.price);
    desc.textContent = product.desc || "No description available.";
    stock.textContent = `Stock: ${Number(product.inStock ?? 0)}`;
    likes.textContent = `Likes: ${state.likeCounts[product._id] ?? 0}`;

    const sizeValues = Array.isArray(product.sizes) ? product.sizes : [];
    if (sizeValues.length) {
      sizeValues.forEach((size) => {
        const chip = document.createElement("span");
        chip.textContent = size;
        sizes.appendChild(chip);
      });
    } else {
      const chip = document.createElement("span");
      chip.textContent = "Standard";
      sizes.appendChild(chip);
    }

    addCartBtn.addEventListener("click", async () => {
      try {
        await addProductToCart(product._id, Number(qtyInput.value || 1));
        pushToast(`${product.name} added to cart.`, "success");
      } catch (error) {
        pushToast(error.message, "error");
      }
    });

    orderNowBtn.addEventListener("click", async () => {
      try {
        await addProductToCart(product._id, Number(qtyInput.value || 1));
        setSelectedProduct(product._id);
        location.hash = "#order";
        pushToast(`${product.name} is ready on the order page.`, "success");
      } catch (error) {
        pushToast(error.message, "error");
      }
    });

    likeBtn.addEventListener("click", async () => {
      try {
        await apiRequest("/api/likes", {
          method: "POST",
          body: JSON.stringify({ type: "Product", id: product._id }),
        });
        await refreshLikeCount(product._id);
        pushToast(`${product.name} liked.`, "success");
      } catch (error) {
        pushToast(error.message, "error");
      }
    });

    rateBtn.addEventListener("click", async () => {
      try {
        await apiRequest("/api/products/rate", {
          method: "POST",
          body: JSON.stringify({
            productID: product._id,
            rating: Number(ratingInput.value),
          }),
        });
        pushToast(`Rated ${product.name}.`, "success");
      } catch (error) {
        pushToast(error.message, "error");
      }
    });

    fragment.appendChild(card);
  });

  elements.productsGrid.appendChild(fragment);
}

function renderOrderPage() {
  const selectedProduct = state.products.find(
    (product) => product._id === state.selectedProductId,
  );

  if (selectedProduct) {
    elements.selectedProductPanel.innerHTML = `
      <div class="list-card">
        <div class="list-card__head">
          <strong>${selectedProduct.name}</strong>
          <span>${formatCurrency(selectedProduct.price)}</span>
        </div>
        <p class="list-meta">${selectedProduct.desc || "No description available."}</p>
        <p class="list-meta">Category: ${selectedProduct.category || "General"} | Stock: ${Number(selectedProduct.inStock ?? 0)}</p>
      </div>
    `;
  } else {
    elements.selectedProductPanel.innerHTML =
      '<div class="empty-state">Click an order button on any product to jump here with that item.</div>';
  }

  if (!state.cartItems.length) {
    elements.orderCartSummary.textContent = "Your cart is empty.";
    elements.orderCartList.innerHTML = "";
    return;
  }

  const { itemCount, totalQuantity, totalPrice } = getCartSummary();
  elements.orderCartSummary.textContent = `Items: ${itemCount} | Quantity: ${totalQuantity} | Total: ${formatCurrency(totalPrice)}`;
  elements.orderCartList.innerHTML = "";

  state.cartItems.forEach((item) => {
    elements.orderCartList.appendChild(createCartCard(item));
  });
}

function renderProfile() {
  if (!state.token) {
    elements.profileSummary.innerHTML =
      '<div class="empty-state">Login to view profile details.</div>';
    elements.profileCartList.innerHTML = "";
    elements.orderHistoryList.innerHTML = "";
    return;
  }

  const user = state.user || {};
  elements.profileSummary.innerHTML = `
    <p><strong>Name:</strong> ${user.name || "-"}</p>
    <p><strong>Email:</strong> ${user.email || "-"}</p>
    <p><strong>Role:</strong> ${user.type || "-"}</p>
    <p><strong>Address:</strong> ${user.address || "-"}</p>
    <p><strong>Contact:</strong> ${user.contact || "-"}</p>
  `;

  elements.profileCartList.innerHTML = "";
  if (!state.cartItems.length) {
    elements.profileCartList.innerHTML =
      '<div class="empty-state">No cart items right now.</div>';
  } else {
    state.cartItems.forEach((item) => {
      elements.profileCartList.appendChild(createCartCard(item));
    });
  }

  elements.orderHistoryList.innerHTML = "";
  if (!state.orders.length) {
    elements.orderHistoryList.innerHTML =
      '<div class="empty-state">No orders placed yet.</div>';
    return;
  }

  state.orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "list-card";
    const items = Array.isArray(order.items)
      ? order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")
      : "No items";
    const canCancel = order.status !== "cancelled";

    card.innerHTML = `
      <div class="list-card__head">
        <strong>${formatCurrency(order.totalPrice)}</strong>
        <span>${formatDate(order.orderDate)}</span>
      </div>
      <p class="list-meta">Status: ${order.status || "placed"}</p>
      <p class="list-meta">Items: ${items}</p>
    `;

    if (canCancel) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost-button";
      button.textContent = "Cancel Order";
      button.addEventListener("click", async () => {
        try {
          await apiRequest(`/api/orders/${order._id}`, { method: "DELETE" });
          await Promise.all([loadOrders(), loadProducts()]);
          pushToast("Order cancelled.", "success");
        } catch (error) {
          pushToast(error.message, "error");
        }
      });
      card.appendChild(button);
    }

    elements.orderHistoryList.appendChild(card);
  });
}

function renderAdminProducts() {
  elements.adminProductList.innerHTML = "";

  if (!isAdmin()) {
    elements.adminProductList.innerHTML =
      '<div class="empty-state">Admin access only.</div>';
    return;
  }

  if (!state.products.length) {
    elements.adminProductList.innerHTML =
      '<div class="empty-state">No products available to manage.</div>';
    return;
  }

  state.products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "list-card";
    card.innerHTML = `
      <div class="list-card__head">
        <strong>${product.name}</strong>
        <span>${formatCurrency(product.price)}</span>
      </div>
      <p class="list-meta">Category: ${product.category || "General"} | Stock: ${Number(product.inStock ?? 0)}</p>
      <p class="list-meta">${product.desc || "No description available."}</p>
    `;

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "ghost-button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEditingProduct(product));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "ghost-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      try {
        await apiRequest(`/api/products/${product._id}`, { method: "DELETE" });
        await loadProducts();
        resetAdminForm();
        pushToast(`${product.name} deleted.`, "success");
      } catch (error) {
        pushToast(error.message, "error");
      }
    });

    actions.append(editBtn, deleteBtn);
    card.appendChild(actions);
    elements.adminProductList.appendChild(card);
  });
}

async function handleAdminSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());

  try {
    if (state.editingProductId) {
      await apiRequest(`/api/products/${state.editingProductId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      pushToast("Product updated.", "success");
    } else {
      await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      pushToast("Product created.", "success");
    }

    await loadProducts();
    resetAdminForm();
  } catch (error) {
    pushToast(error.message, "error");
  }
}

function startEditingProduct(product) {
  state.editingProductId = product._id;
  elements.adminFormTitle.textContent = "Update product";
  const fields = elements.adminProductForm.elements;
  fields.namedItem("name").value = product.name || "";
  fields.namedItem("desc").value = product.desc || "";
  fields.namedItem("imageUrl").value = product.imageUrl || "";
  fields.namedItem("price").value = product.price || 0;
  fields.namedItem("category").value = product.category || "";
  fields.namedItem("sizes").value = Array.isArray(product.sizes)
    ? product.sizes.join(",")
    : "";
  fields.namedItem("inStock").value = Number(product.inStock ?? 0);
  location.hash = "#admin";
}

function resetAdminForm() {
  state.editingProductId = "";
  elements.adminFormTitle.textContent = "Create product";
  elements.adminProductForm.reset();
}

async function addProductToCart(productId, quantity) {
  await apiRequest("/api/cart/addProduct", {
    method: "POST",
    body: JSON.stringify({ productID: productId, quantity }),
  });
  await loadCart();
}

async function removeCartItem(itemId) {
  await apiRequest(`/api/cart/${itemId}`, { method: "DELETE" });
  await loadCart();
}

async function placeOrder() {
  if (!state.cartItems.length) {
    pushToast("Add something to cart first.", "error");
    return;
  }

  try {
    await apiRequest("/api/orders", { method: "POST" });
    state.selectedProductId = "";
    localStorage.removeItem("selected-product-id");
    await Promise.all([loadCart(), loadOrders(), loadProducts()]);
    location.hash = "#profile";
    pushToast("Order placed successfully.", "success");
  } catch (error) {
    pushToast(error.message, "error");
  }
}

async function refreshLikeCount(productId) {
  const likes = await apiRequest(`/api/likes?id=${productId}&type=Product`);
  state.likeCounts[productId] = Array.isArray(likes) ? likes.length : 0;
  renderProducts();
}

function createCartCard(item) {
  const product = state.products.find((entry) => entry._id === item.productID);
  const card = document.createElement("article");
  card.className = "list-card";
  card.innerHTML = `
    <div class="list-card__head">
      <strong>${product?.name || "Product"}</strong>
      <span>Qty ${item.quantity}</span>
    </div>
    <p class="list-meta">Product ID: ${item.productID}</p>
    <p class="list-meta">Estimated: ${formatCurrency(Number(product?.price || 0) * Number(item.quantity || 0))}</p>
  `;

  const actions = document.createElement("div");
  actions.className = "inline-actions";

  const focusBtn = document.createElement("button");
  focusBtn.type = "button";
  focusBtn.className = "ghost-button";
  focusBtn.textContent = "Order Page";
  focusBtn.addEventListener("click", () => {
    setSelectedProduct(item.productID);
    location.hash = "#order";
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "ghost-button";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", async () => {
    try {
      await removeCartItem(item._id);
      pushToast("Cart item removed.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  });

  actions.append(focusBtn, removeBtn);
  card.appendChild(actions);
  return card;
}

function syncUiFromSession() {
  const loggedIn = Boolean(state.token);
  const guestNodes = [
    elements.openLoginBtn,
    elements.openRegisterBtn,
    elements.heroLoginBtn,
    elements.heroRegisterBtn,
  ];

  guestNodes.forEach((node) => node.classList.toggle("is-hidden", loggedIn));
  elements.logoutBtn.classList.toggle("is-hidden", !loggedIn);
  elements.heroLoggedInActions.classList.toggle("is-hidden", !loggedIn);

  document.querySelectorAll("[data-auth-only]").forEach((node) => {
    node.classList.toggle("is-hidden", !loggedIn);
  });
  document.querySelectorAll("[data-admin-only]").forEach((node) => {
    node.classList.toggle("is-hidden", !isAdmin());
  });

  if (!loggedIn) {
    elements.sessionTitle.textContent = "Guest mode";
    elements.sessionSubtitle.textContent =
      "Login or register to unlock products, orders, likes, and profile tools.";
    refreshSummaryStats();
    return;
  }

  elements.sessionTitle.textContent = state.user?.name || state.user?.email || "Logged in";
  elements.sessionSubtitle.textContent = isAdmin()
    ? "Admin tools are enabled for product CRUD."
    : "Buyer tools are enabled for cart, likes, orders, and profile history.";
  refreshSummaryStats();
}

function refreshSummaryStats() {
  elements.productCount.textContent = `${state.products.length}`;
  elements.cartCount.textContent = `${state.cartItems.length}`;
  elements.orderCount.textContent = `${state.orders.length}`;
}

function setSelectedProduct(productId) {
  state.selectedProductId = productId;
  localStorage.setItem("selected-product-id", productId);
  renderOrderPage();
}

function isAdmin() {
  return state.user?.type === "admin";
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (state.token) {
    headers.set("Authorization", `Bearer ${state.token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const payload = await readResponse(response);

  if (!response.ok) {
    const message = resolveErrorMessage(payload, response.status);
    if (response.status === 401 && state.token) {
      logout();
    }
    throw new Error(message);
  }

  return payload;
}

async function readResponse(response) {
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function resolveErrorMessage(payload, statusCode) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }
  if (payload?.message) {
    return payload.message;
  }
  if (payload?.error) {
    return payload.error;
  }
  return `Request failed with status ${statusCode}.`;
}

function pushToast(message, tone = "info") {
  const toast = document.createElement("article");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.innerHTML = `
    <strong>${tone === "error" ? "Error" : tone === "success" ? "Success" : "Info"}</strong>
    <span>${message}</span>
  `;
  elements.toastStack.prepend(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function getCartSummary() {
  return state.cartItems.reduce(
    (summary, item) => {
      const product = state.products.find((entry) => entry._id === item.productID);
      summary.itemCount += 1;
      summary.totalQuantity += Number(item.quantity || 0);
      summary.totalPrice +=
        Number(product?.price || 0) * Number(item.quantity || 0);
      return summary;
    },
    { itemCount: 0, totalQuantity: 0, totalPrice: 0 },
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("en-IN");
}

function resolveProductImage(imageUrl) {
  if (imageUrl?.startsWith("http://") || imageUrl?.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl?.startsWith("/")) {
    return imageUrl;
  }
  if (imageUrl) {
    return `/uploads/${imageUrl}`;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f6d8c3"/>
          <stop offset="100%" stop-color="#eadfcf"/>
        </linearGradient>
      </defs>
      <rect width="800" height="640" fill="url(#g)"/>
      <circle cx="620" cy="120" r="90" fill="#d99b7d" opacity="0.5"/>
      <circle cx="180" cy="520" r="110" fill="#b7ccbe" opacity="0.6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="54" fill="#7a5f53">Northstar Goods</text>
    </svg>
  `)}`;
}

function persistSession() {
  localStorage.setItem("ecom-token", state.token);
  localStorage.setItem("ecom-user", JSON.stringify(state.user || {}));
}

function readStoredJson(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function decodeJwt(token) {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
