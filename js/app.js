/**
 * LA CAVA NOIRE // Aplicación Principal
 * Catálogo, Carrito con Pesos Chilenos ($ CLP), Pasarela Webpay Plus Transbank y Modales de Cata.
 */

// --- 1. GESTOR DE CARRITO (CART MANAGER) ---
class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("cava_noire_cart")) || [
      {
        id: "comte-36m",
        name: "Comté Extra Réserve AOP (36 Meses)",
        subtitle: "Afinado en las cavas subterráneas del Fort Saint-Antoine",
        price: 29990,
        weight: "250g (Cuña seleccionada)",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=480&auto=format&fit=crop&q=72",
        quantity: 1
      }
    ];
    this.discountPercent = 0;
    this.appliedCouponCode = null;
    this.freeShippingThreshold = 65000;
    this.shippingBasePrice = 4990;

    this.initDOM();
    this.render();
  }

  initDOM() {
    const trigger = document.getElementById("cart-trigger-btn");
    const closeBtn = document.getElementById("cart-close-btn");
    const overlay = document.getElementById("cart-overlay");
    const couponForm = document.getElementById("cart-coupon-form");

    if (trigger) trigger.addEventListener("click", () => this.openDrawer());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeDrawer());
    if (overlay) overlay.addEventListener("click", () => this.closeDrawer());

    if (couponForm) {
      couponForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("cart-coupon-input");
        this.applyCoupon(input.value.trim().toUpperCase());
      });
    }
  }

  save() {
    localStorage.setItem("cava_noire_cart", JSON.stringify(this.cart));
    this.updateBadges();
  }

  getCart() {
    return this.cart;
  }

  openDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  closeDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  exploreCatalog() {
    this.closeDrawer();
    const catalog = document.getElementById("catalogo");
    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  askSommelier() {
    this.closeDrawer();
    if (window.SommelierBot) {
      window.SommelierBot.openChat();
    }
  }

  addItem(product) {
    const existing = this.cart.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle || product.origin || "",
        price: product.price,
        weight: product.weight || "Gourmet",
        image: product.image,
        quantity: product.quantity || 1
      });
    }
    this.save();
    this.render();
    this.showToast(`Añadido al carrito: ${product.name}`);
  }

  addItemById(id) {
    const p = CHEESE_PRODUCTS.find(item => item.id === id) || DELICATESSEN_ITEMS.find(item => item.id === id);
    if (p) this.addItem(p);
  }

  removeItem(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.save();
    this.render();
  }

  updateQuantity(id, delta) {
    const item = this.cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(id);
    } else {
      this.save();
      this.render();
    }
  }

  applyCoupon(code) {
    const msgEl = document.getElementById("coupon-feedback");
    if (!msgEl) return;

    if (code === "CAVANOIRE10") {
      this.discountPercent = 0.10;
      this.appliedCouponCode = code;
      msgEl.className = "coupon-msg success";
      msgEl.textContent = "✓ Cupón CAVANOIRE10 aplicado (-10% de descuento).";
    } else if (code === "SOMMELIER15") {
      this.discountPercent = 0.15;
      this.appliedCouponCode = code;
      msgEl.className = "coupon-msg success";
      msgEl.textContent = "✓ Cupón SOMMELIER15 aplicado (-15% de cortesía).";
    } else {
      msgEl.className = "coupon-msg error";
      msgEl.textContent = "Código inválido. Prueba con CAVANOIRE10 o SOMMELIER15.";
    }
    this.render();
  }

  showToast(message) {
    const existing = document.getElementById("cava-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "cava-toast";
    toast.className = "cava-toast animate-slide-up";
    toast.innerHTML = `
      <div class="toast-dot"></div>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  updateBadges() {
    const totalCount = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? "inline-flex" : "none";
    });
  }

  render() {
    this.updateBadges();

    const listEl = document.getElementById("cart-items-list");
    const emptyEl = document.getElementById("cart-empty-state");
    const footerEl = document.getElementById("cart-footer");
    const shippingBar = document.getElementById("shipping-progress-bar");
    const shippingMsg = document.getElementById("shipping-threshold-msg");

    if (!listEl) return;

    if (this.cart.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "block";
      if (footerEl) footerEl.style.display = "none";
      if (shippingMsg) shippingMsg.textContent = `Añade afinaciones por ${formatCLP(this.freeShippingThreshold)} para envío refrigerado gratuito.`;
      if (shippingBar) shippingBar.style.width = "0%";
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    if (footerEl) footerEl.style.display = "block";

    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discountAmount = subtotal * this.discountPercent;
    const isFreeShipping = subtotal >= this.freeShippingThreshold;
    const shippingCost = isFreeShipping ? 0 : this.shippingBasePrice;
    const total = subtotal - discountAmount + shippingCost;

    // Barra de progreso envío gratis
    const progress = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));
    if (shippingBar) shippingBar.style.width = progress + "%";
    if (shippingMsg) {
      if (isFreeShipping) {
        shippingMsg.innerHTML = `<span class="gold-text">✓ ¡Felicitaciones! Has obtenido Despacho Refrigerado GRATIS a todo Chile.</span>`;
      } else {
        const remaining = this.freeShippingThreshold - subtotal;
        shippingMsg.innerHTML = `Te faltan <strong>${formatCLP(remaining)}</strong> para desbloquear <strong>Despacho Refrigerado GRATIS</strong>.`;
      }
    }

    // Lista de productos
    listEl.innerHTML = this.cart.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-sub">${item.weight || "Pieza especial"}</span>
          <div class="cart-item-price">${formatCLP(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-pill">
            <button onclick="window.CartManager.updateQuantity('${item.id}', -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="window.CartManager.updateQuantity('${item.id}', 1)">+</button>
          </div>
          <button class="cart-btn-del" onclick="window.CartManager.removeItem('${item.id}')" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `).join("");

    // Totales
    document.getElementById("cart-subtotal").textContent = formatCLP(subtotal);
    const discountRow = document.getElementById("cart-discount-row");
    if (discountRow) {
      if (this.discountPercent > 0) {
        discountRow.style.display = "flex";
        document.getElementById("cart-discount-val").textContent = `-${formatCLP(discountAmount)}`;
      } else {
        discountRow.style.display = "none";
      }
    }

    const shippingEl = document.getElementById("cart-shipping-val");
    if (shippingEl) {
      shippingEl.innerHTML = isFreeShipping ? `<span class="gold-text">GRATIS</span>` : formatCLP(shippingCost);
    }

    document.getElementById("cart-total-val").textContent = formatCLP(total);

    // Botón de Webpay en el carrito
    const webpayCartBtn = document.getElementById("btn-webpay-cart");
    if (webpayCartBtn) {
      webpayCartBtn.onclick = () => {
        this.closeDrawer();
        window.PaymentGateway.openWebpayModal(total);
      };
      webpayCartBtn.innerHTML = `
        <div class="tbk-btn-inner">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <span>Pagar con Webpay Plus (${formatCLP(total)})</span>
        </div>
      `;
    }
  }

  clear() {
    this.cart = [];
    this.save();
    this.render();
  }
}

// --- 2. PASARELA WEBPAY PLUS TRANSBANK ---
class PaymentGateway {
  constructor() {
    this.selectedBank = "banco-chile";
    this.selectedMethod = "debito"; // debito o credito
    this.initDOM();
  }

  initDOM() {
    // Si no existe el modal en el DOM, crearlo
    if (document.getElementById("webpay-modal")) return;

    const modalHTML = `
      <div id="webpay-modal" class="webpay-modal" aria-hidden="true">
        <div class="webpay-modal-backdrop" onclick="window.PaymentGateway.closeWebpayModal()"></div>
        <div class="webpay-card-container">
          <!-- Header Oficial Transbank Webpay Plus -->
          <div class="tbk-portal-header">
            <div class="tbk-brand">
              <span class="tbk-logo-text">Webpay Plus</span>
              <span class="tbk-corp">Transbank Chile</span>
            </div>
            <div class="cava-merchant-info">
              <span class="merchant-badge">COMERCIO CERTIFICADO</span>
              <span class="merchant-name">La Cava Noire Gourmet SpA</span>
            </div>
            <button class="tbk-close-btn" onclick="window.PaymentGateway.closeWebpayModal()">×</button>
          </div>

          <!-- Contenido del Checkout Webpay -->
          <div id="webpay-modal-body" class="webpay-modal-body">
            <!-- Paso 1: Selección de Medio de Pago -->
            <div id="webpay-step-1" class="webpay-step active">
              <div class="order-summary-strip">
                <div class="order-code">Orden: <strong>ORD-${Math.floor(100000 + Math.random() * 900000)}</strong></div>
                <div class="order-amount">Total: <strong id="tbk-display-amount">$0 CLP</strong></div>
              </div>

              <div class="tbk-tabs">
                <button class="tbk-tab active" id="tab-debito" onclick="window.PaymentGateway.setMethod('debito')">
                  <span class="tab-icon">💳</span> Redcompra / Débito
                </button>
                <button class="tbk-tab" id="tab-credito" onclick="window.PaymentGateway.setMethod('credito')">
                  <span class="tab-icon">💳</span> Tarjetas de Crédito
                </button>
              </div>

              <!-- Selector de Bancos Chilenos -->
              <div class="bank-selector-wrap">
                <label class="tbk-label">Seleccione su Institución Financiera:</label>
                <div class="banks-grid">
                  <button class="bank-card active" data-bank="Banco de Chile" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">Banco de Chile / Edwards</span>
                  </button>
                  <button class="bank-card" data-bank="Santander Chile" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">Banco Santander</span>
                  </button>
                  <button class="bank-card" data-bank="BCI" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">BCI / MACH</span>
                  </button>
                  <button class="bank-card" data-bank="BancoEstado" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">BancoEstado / CuentaRUT</span>
                  </button>
                  <button class="bank-card" data-bank="Scotiabank" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">Scotiabank Azul</span>
                  </button>
                  <button class="bank-card" data-bank="Itaú" onclick="window.PaymentGateway.selectBank(this)">
                    <span class="bank-flag">🇨🇱</span>
                    <span class="b-name">Itaú Corpbanca</span>
                  </button>
                </div>
              </div>

              <!-- Formulario de Tarjeta y RUT -->
              <div class="tbk-form">
                <div class="tbk-input-group">
                  <label for="tbk-rut">RUT del Titular (ej: 12.345.678-9):</label>
                  <input type="text" id="tbk-rut" value="18.942.315-K" placeholder="12.345.678-9">
                </div>
                <div class="tbk-input-group">
                  <label for="tbk-card-num">Número de Tarjeta:</label>
                  <input type="text" id="tbk-card-num" value="•••• •••• •••• 9821" placeholder="4521 0000 0000 0000">
                </div>
                <div class="tbk-input-row">
                  <div class="tbk-input-group">
                    <label for="tbk-exp">Vencimiento:</label>
                    <input type="text" id="tbk-exp" value="09/29" placeholder="MM/AA">
                  </div>
                  <div class="tbk-input-group">
                    <label for="tbk-cvv">CVV / Clave:</label>
                    <input type="password" id="tbk-cvv" value="921" placeholder="CVV">
                  </div>
                </div>
              </div>

              <div class="cold-chain-banner">
                <span class="snow-icon">❄️</span>
                <p>Despacho en caja isotérmica con gel a 4°C garantizado por <strong>Blue Express Frío</strong> y <strong>Chilexpress Priority</strong>.</p>
              </div>

              <button class="btn-tbk-pay" onclick="window.PaymentGateway.processPayment()">
                <span>Continuar en Webpay Plus</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <!-- Paso 2: Procesamiento y Conexión Bancaria 3D Secure -->
            <div id="webpay-step-2" class="webpay-step">
              <div class="tbk-processing-box">
                <div class="tbk-spinner"></div>
                <h4>Conectando con Servidor Seguro Bancario...</h4>
                <p>Verificando fondos y token de autenticación 3D-Secure con Transbank.</p>
                <div class="secure-token-tag">Token de Sesión: 01ab8f72c3d09a241</div>
              </div>
            </div>

            <!-- Paso 3: Voucher Oficial de Transbank Autorizado -->
            <div id="webpay-step-3" class="webpay-step">
              <div class="tbk-success-voucher">
                <div class="voucher-seal">✓ TRANSACCIÓN APROBADA</div>
                <h3 class="voucher-title">Comprobante de Pago Webpay Plus</h3>
                <p class="voucher-sub">Transbank S.A. • Redcompra</p>

                <div class="voucher-receipt-grid">
                  <div class="v-row"><span>Comercio:</span><strong>LA CAVA NOIRE GOURMET SPA</strong></div>
                  <div class="v-row"><span>Código de Autorización:</span><strong id="v-auth-code">TBK-784912</strong></div>
                  <div class="v-row"><span>Orden de Compra:</span><strong id="v-order-num">ORD-941824</strong></div>
                  <div class="v-row"><span>Medio de Pago:</span><strong id="v-method">Redcompra Débito</strong></div>
                  <div class="v-row"><span>Banco Emisor:</span><strong id="v-bank">Banco de Chile</strong></div>
                  <div class="v-row"><span>Fecha / Hora:</span><strong id="v-date">28/09/2026 12:45</strong></div>
                  <div class="v-row v-total-row"><span>Monto Total Pagado:</span><strong id="v-amount" class="gold-text">$0 CLP</strong></div>
                </div>

                <div class="dispatch-cold-confirmation">
                  <h5>📦 Seguimiento de Cadena de Frío:</h5>
                  <p>Su pedido de quesos de autor ha ingresado a la cava de preparación. Será empacado a 4°C y despachado con guía prioritaria Blue Express para entrega en 24-48 horas.</p>
                </div>

                <button class="btn-tbk-done" onclick="window.PaymentGateway.finishOrder()">
                  <span>Volver a la Cava de Quesos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  setMethod(method) {
    this.selectedMethod = method;
    document.querySelectorAll(".tbk-tab").forEach(t => t.classList.remove("active"));
    const activeTab = document.getElementById(`tab-${method}`);
    if (activeTab) activeTab.classList.add("active");
  }

  selectBank(btn) {
    document.querySelectorAll(".bank-card").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    this.selectedBank = btn.getAttribute("data-bank");
  }

  openWebpayModal(amount) {
    this.currentAmount = amount;
    const modal = document.getElementById("webpay-modal");
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    document.getElementById("tbk-display-amount").textContent = formatCLP(amount);

    // Resetear a paso 1
    document.getElementById("webpay-step-1")?.classList.add("active");
    document.getElementById("webpay-step-2")?.classList.remove("active");
    document.getElementById("webpay-step-3")?.classList.remove("active");
  }

  closeWebpayModal() {
    const modal = document.getElementById("webpay-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  processPayment() {
    // Pasar a paso 2 (simulación de autorización bancaria)
    document.getElementById("webpay-step-1")?.classList.remove("active");
    document.getElementById("webpay-step-2")?.classList.add("active");

    setTimeout(() => {
      document.getElementById("webpay-step-2")?.classList.remove("active");
      document.getElementById("webpay-step-3")?.classList.add("active");

      // Rellenar datos del voucher
      const authCode = "TBK-" + Math.floor(100000 + Math.random() * 900000);
      const orderNum = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const now = new Date().toLocaleString("es-CL");

      document.getElementById("v-auth-code").textContent = authCode;
      document.getElementById("v-order-num").textContent = orderNum;
      document.getElementById("v-method").textContent = this.selectedMethod === "debito" ? "Redcompra Débito" : "Crédito Visa/Mastercard";
      document.getElementById("v-bank").textContent = this.selectedBank;
      document.getElementById("v-date").textContent = now;
      document.getElementById("v-amount").textContent = formatCLP(this.currentAmount);

      // Capturar items y registrar la venta en el Panel de Pedidos
      const cartItems = (window.CartManager && window.CartManager.getCart().length > 0)
        ? [...window.CartManager.getCart()]
        : [
            {
              name: "Cofre Degustación 'Grand Affineur' (5 Quesos)",
              weight: "1.250g con maridajes",
              price: this.currentAmount,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=480&auto=format&fit=crop&q=72"
            }
          ];

      if (window.OrdersApp) {
        window.OrdersApp.addOrder({
          id: orderNum,
          authCode: authCode,
          date: now,
          timestamp: Date.now(),
          customer: {
            name: "Cliente Tienda Webpay",
            email: "cliente.webpay@gmail.com",
            phone: "+56 9 8123 4567",
            address: "Av. Vitacura 5400",
            commune: "Vitacura, Región Metropolitana"
          },
          items: cartItems,
          subtotal: this.currentAmount,
          shipping: 0,
          total: this.currentAmount,
          paymentMethod: this.selectedMethod === "debito" ? `Webpay Plus Débito (${this.selectedBank})` : `Webpay Plus Crédito (${this.selectedBank})`,
          bank: this.selectedBank,
          status: "En Cava (Preparación Fría)",
          trackingCode: "BLX-" + Math.floor(10000000 + Math.random() * 90000000)
        });
      }

      // Vaciar carrito
      if (window.CartManager) {
        window.CartManager.clear();
      }

      // Notificar al chatbot
      if (window.SommelierBot) {
        window.SommelierBot.addBotMessage(
          `¡Excelente noticia! Transbank ha confirmado el pago de su orden **${orderNum}** por **${formatCLP(this.currentAmount)}** con código de autorización **${authCode}**. El pedido ha ingresado a nuestro panel de cava para preparación y despacho refrigerado.`
        );
      }
    }, 1800);
  }

  finishOrder() {
    this.closeWebpayModal();
    window.location.hash = "#catalogo";
  }
}

// --- 3. CATÁLOGO DE PRODUCTOS Y MODAL DE CATA ---
class ProductCatalog {
  constructor() {
    this.currentCategory = "todas";
    this.searchQuery = "";
    this.initDOM();
    this.render();
  }

  initDOM() {
    // Filtros de categoría
    const filterPills = document.querySelectorAll(".cat-filter-btn");
    filterPills.forEach(btn => {
      btn.addEventListener("click", () => {
        filterPills.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCategory = btn.getAttribute("data-category");
        this.render();
      });
    });

    // Buscador en vivo
    const searchInput = document.getElementById("cheese-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Modal de Cata
    this.createTastingModal();
  }

  createTastingModal() {
    if (document.getElementById("tasting-modal")) return;

    const modalHTML = `
      <div id="tasting-modal" class="tasting-modal" aria-hidden="true">
        <div class="tasting-modal-backdrop" onclick="window.ProductCatalog.closeProductModal()"></div>
        <div class="tasting-modal-card">
          <button class="tasting-close-btn" onclick="window.ProductCatalog.closeProductModal()">×</button>
          <div id="tasting-modal-content" class="tasting-modal-content">
            <!-- Inyectado dinámicamente -->
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  openProductModal(id) {
    const product = CHEESE_PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const contentEl = document.getElementById("tasting-modal-content");
    const modalEl = document.getElementById("tasting-modal");
    if (!contentEl || !modalEl) return;

    contentEl.innerHTML = `
      <div class="modal-two-columns">
        <div class="modal-gallery">
          <div class="modal-main-img">
            <img id="modal-img-active" src="${product.image}" alt="${product.name}">
          </div>
          <div class="modal-thumbs">
            <button class="thumb-btn active" onclick="document.getElementById('modal-img-active').src='${product.image}'">
              <img src="${product.image}" alt="Vista 1">
            </button>
            <button class="thumb-btn" onclick="document.getElementById('modal-img-active').src='${product.imageHover}'">
              <img src="${product.imageHover}" alt="Vista 2">
            </button>
          </div>
          <div class="modal-cold-guarantee">
            <span>❄️ Despacho a 4°C garantizado en caja térmica con Blue Express</span>
          </div>
        </div>

        <div class="modal-details">
          <div class="modal-badge-row">
            <span class="modal-badge-gold">${product.badge || "D.O.P. Reserva"}</span>
            <span class="modal-appellation">${product.origin} • ${product.categoryLabel}</span>
          </div>

          <h2 class="modal-title">${product.name}</h2>
          <p class="modal-sub">${product.subtitle}</p>

          <div class="modal-price-box">
            <span class="price-val">${formatCLP(product.price)}</span>
            <span class="price-weight">${product.weight}</span>
          </div>

          <!-- Cuadro de Explicación Práctica para Todo Público -->
          <div class="cheese-easy-box">
            <div class="easy-box-header">
              <span class="easy-icon">🧀</span>
              <strong>En Palabras Simples (Guía Rápida):</strong>
            </div>
            <p class="easy-text">${product.easyGuide || product.description}</p>
          </div>

          <!-- Gráfico Dinámico Animado de Acidez y Sensorial -->
          <div class="cheese-visual-chart">
            <div class="chart-header">
              <span class="chart-title">📊 Perfil Sensorial & Acidez (Punto Real de Afinación):</span>
            </div>
            <div class="chart-bars-list">
              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">🍋 Nivel Real de Acidez:</span>
                  <strong class="bar-score text-gold">${product.acidityLabel || (product.acidity + '%')}</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-acidity chart-anim" data-target="${product.acidity}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">⭐ Intensidad de Sabor:</span>
                  <strong class="bar-score">${product.intensityScoreLabel || (product.intensityScore + '%')}</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-intensity chart-anim" data-target="${product.intensityScore}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">🧈 Nivel de Cremosidad:</span>
                  <strong class="bar-score">${product.creaminessLabel || (product.creaminess + '%')}</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-creaminess chart-anim" data-target="${product.creaminess}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">🧂 Punto Salino:</span>
                  <strong class="bar-score">${product.salinityLabel || (product.salinity + '%')}</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-salinity chart-anim" data-target="${product.salinity}" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Datos Básicos y Maridaje -->
          <div class="specs-grid">
            <div class="spec-cell">
              <span class="s-label">Maduración</span>
              <strong class="s-val">${product.aging}</strong>
            </div>
            <div class="spec-cell">
              <span class="s-label">Tipo de Leche</span>
              <strong class="s-val">${product.milkType}</strong>
            </div>
            <div class="spec-cell">
              <span class="s-label">Temperatura Óptima</span>
              <strong class="s-val">${product.serviceTemp}</strong>
            </div>
          </div>

          <div class="modal-pairing-card">
            <strong>🍷 Con qué disfrutarlo:</strong>
            <p>${product.pairing}</p>
          </div>

          <!-- Botones de Acción Accesibles y Claros -->
          <div class="modal-actions-row">
            <button class="btn-modal-add" onclick="window.CartManager.addItemById('${product.id}'); window.ProductCatalog.closeProductModal(); window.CartManager.openDrawer();" title="Agregar al carrito de compras">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>🛒 Agregar al Carrito (${formatCLP(product.price)})</span>
            </button>
            <button class="btn-modal-ask-bot" onclick="window.ProductCatalog.closeProductModal(); window.SommelierBot.openChat(); window.SommelierBot.handleUserMessage('Hola Jean-Pierre, cuéntame sobre el queso ${product.name} y cómo disfrutarlo.');" title="Hablar con el Asistente Virtual">
              <span>💬 Hablar con Asistente Virtual</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Animación suave de llenado hacia el punto exacto de acidez y notas
    requestAnimationFrame(() => {
      setTimeout(() => {
        contentEl.querySelectorAll(".chart-anim").forEach(bar => {
          const target = bar.getAttribute("data-target");
          if (target) {
            bar.style.width = `${target}%`;
          }
        });
      }, 70);
    });
  }

  closeProductModal() {
    const modalEl = document.getElementById("tasting-modal");
    if (modalEl) {
      modalEl.classList.remove("open");
      modalEl.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  render() {
    const grid = document.getElementById("cheese-catalog-grid");
    if (!grid) return;

    let filtered = CHEESE_PRODUCTS.filter(p => {
      const matchesCat = this.currentCategory === "todas" || p.category === this.currentCategory;
      const matchesQuery = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.origin.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.categoryLabel.toLowerCase().includes(this.searchQuery);
      return matchesCat && matchesQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-results-msg">
          <p>No se encontraron quesos con el criterio "${this.searchQuery}".</p>
          <button class="btn-clear-search" onclick="document.getElementById('cheese-search-input').value=''; window.ProductCatalog.searchQuery=''; window.ProductCatalog.render();">Ver Todo el Catálogo</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <article class="cheese-card luxury-card-3d" data-id="${item.id}" onclick="window.ProductCatalog.openProductModal('${item.id}')">
        <div class="card-media">
          <img class="img-primary" src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" width="480" height="330">
          <img class="img-hover" src="${item.imageHover}" alt="${item.name} detalle" loading="lazy" decoding="async" width="480" height="330">
          <div class="card-overlay-badges">
            <span class="badge-status">${item.badge || "D.O.P."}</span>
            <span class="badge-aging">${item.aging}</span>
          </div>
          <button 
            class="btn-quick-add" 
            onclick="event.stopPropagation(); window.CartManager.addItemById('${item.id}');"
            title="Añadir directo a la bolsa"
          >
            + Añadir al Carrito
          </button>
        </div>

        <div class="card-content">
          <div class="card-header-row">
            <span class="card-category">${item.categoryLabel}</span>
            <span class="card-origin">${item.origin}</span>
          </div>

          <h3 class="card-title">${item.name}</h3>
          
          <!-- Mini Indicadores Clave Prácticos -->
          <div class="card-quick-metrics">
            <span class="quick-metric" title="Acidez del queso">🍋 Acidez: <strong>${item.acidity}%</strong></span>
            <span class="quick-metric" title="Intensidad">⭐ Sabor: <strong>${item.intensityScore}%</strong></span>
            <span class="quick-metric" title="Cremosidad">🧈 Crema: <strong>${item.creaminess}%</strong></span>
          </div>

          <p class="card-desc">${item.easyGuide ? item.easyGuide.substring(0, 115) + '...' : item.description.substring(0, 110) + '...'}</p>

          <div class="card-footer">
            <div class="price-group">
              <span class="price-val">${formatCLP(item.price)}</span>
              <span class="price-weight">${item.weight}</span>
            </div>
            <button class="btn-view-details" onclick="event.stopPropagation(); window.ProductCatalog.openProductModal('${item.id}');">
              <span>Ver Ficha</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `).join("");

    this.attachTiltEffects();
  }

  attachTiltEffects() {
    // Delegado al compositor GPU en CSS con will-change: transform para 60-120fps puros sin reflows
  }
}

// --- 4. INICIALIZACIÓN GLOBAL ---
document.addEventListener("DOMContentLoaded", () => {
  window.CartManager = new CartManager();
  window.PaymentGateway = new PaymentGateway();
  window.ProductCatalog = new ProductCatalog();

  // Menú hamburguesa móvil
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-nav-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          mobileMenu?.classList.remove("open");
        }
      }
    });
  });
});
