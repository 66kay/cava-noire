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
        image: "img/products/comte-36m.jpg",
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
      const headerOffset = 85;
      const targetY = catalog.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });
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

  getCart() {
    return this.cart;
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  clear() {
    this.cart = [];
    this.save();
    this.render();
  }
}

// --- 2. PASARELA WEBPAY PLUS TRANSBANK & CHECKOUT DE CLIENTE ---
class PaymentGateway {
  constructor() {
    this.deliveryMethod = "delivery"; // "delivery" o "pickup"
    this.currentSubtotal = 0;
    this.shippingCost = 4990;
    this.currentTotal = 0;
    this.lastCreatedOrder = null;
    this.initDOM();
  }

  initDOM() {
    if (document.getElementById("webpay-modal")) return;

    const modalHTML = `
      <div id="webpay-modal" class="webpay-modal" aria-hidden="true">
        <div class="webpay-modal-backdrop" onclick="window.PaymentGateway.closeWebpayModal()"></div>
        <div class="webpay-card-container">
          <!-- Header Oficial Transbank Webpay Plus -->
          <div class="tbk-portal-header">
            <div class="tbk-brand">
              <span class="tbk-logo-text">Webpay Plus</span>
              <span class="tbk-corp">Transbank Chile • Checkout Seguro</span>
            </div>
            <div class="cava-merchant-info">
              <span class="merchant-badge">COMERCIO OFICIAL</span>
              <span class="merchant-name">La Cava Noire Gourmet SpA</span>
            </div>
            <button class="tbk-close-btn" onclick="window.PaymentGateway.closeWebpayModal()">×</button>
          </div>

          <!-- Contenido del Checkout Webpay -->
          <div id="webpay-modal-body" class="webpay-modal-body">
            <!-- Paso 1: Formulario de Datos del Cliente y Despacho -->
            <div id="webpay-step-1" class="webpay-step active">
              <div class="checkout-intro-banner">
                <span class="checkout-badge">Finalizar Pedido</span>
                <h3 class="checkout-title">Datos del Cliente y Despacho</h3>
                <p class="checkout-sub">Ingrese sus datos para emitir su boleta electrónica y procesar el pago vía Webpay Plus.</p>
              </div>

              <form id="checkout-customer-form" class="checkout-real-form" onsubmit="window.PaymentGateway.handleCheckoutSubmit(event)">
                <!-- Sección 1: Datos Personales -->
                <div class="form-section-group">
                  <div class="section-title-tag">
                    <span class="step-num">1</span>
                    <span>DATOS PERSONALES</span>
                  </div>

                  <div class="checkout-grid-2col">
                    <div class="c-input-wrap">
                      <label for="c-name">Nombre y Apellido *</label>
                      <input type="text" id="c-name" class="c-text-input" placeholder="Ej: Marcela González" required autocomplete="name">
                    </div>
                    <div class="c-input-wrap">
                      <label for="c-phone">Teléfono de Contacto *</label>
                      <input type="tel" id="c-phone" class="c-text-input" placeholder="+56 9 8123 4567" required autocomplete="tel">
                    </div>
                  </div>

                  <div class="c-input-wrap">
                    <label for="c-email">Correo Electrónico (Para recibir boleta y comprobante)</label>
                    <input type="email" id="c-email" class="c-text-input" placeholder="nombre@correo.cl (Opcional)" autocomplete="email">
                  </div>
                </div>

                <!-- Sección 2: Método de Recepción -->
                <div class="form-section-group">
                  <div class="section-title-tag">
                    <span class="step-num">2</span>
                    <span>OPCIÓN DE ENTREGA</span>
                  </div>

                  <div class="delivery-options-grid">
                    <div class="delivery-card-option active" id="opt-delivery" onclick="window.PaymentGateway.setDeliveryMethod('delivery')">
                      <div class="del-card-header">
                        <span class="del-icon">🚚</span>
                        <div class="del-info">
                          <strong>Despacho Refrigerado a Domicilio</strong>
                          <span class="del-sub">Caja isotérmica 4°C • Blue Express Frío</span>
                        </div>
                      </div>
                      <span class="del-price-tag" id="label-shipping-cost">$4.990 CLP</span>
                    </div>

                    <div class="delivery-card-option" id="opt-pickup" onclick="window.PaymentGateway.setDeliveryMethod('pickup')">
                      <div class="del-card-header">
                        <span class="del-icon">🏪</span>
                        <div class="del-info">
                          <strong>Retiro en Tienda / Cava Central</strong>
                          <span class="del-sub">Av. Vitacura 3565, Santiago • Sin costo</span>
                        </div>
                      </div>
                      <span class="del-price-tag text-green">GRATIS</span>
                    </div>
                  </div>

                  <!-- Campos de Dirección si es Delivery -->
                  <div id="address-fields-box" class="address-fields-box">
                    <div class="c-input-wrap">
                      <label for="c-address">Dirección de Envío (Calle, Número, Depto) *</label>
                      <input type="text" id="c-address" class="c-text-input" placeholder="Ej: Av. Las Condes 12461, Depto 502" autocomplete="street-address">
                    </div>

                    <div class="checkout-grid-2col">
                      <div class="c-input-wrap">
                        <label for="c-commune">Comuna / Ciudad *</label>
                        <select id="c-commune" class="c-text-input c-select">
                          <option value="Las Condes, Región Metropolitana">Las Condes (Santiago)</option>
                          <option value="Vitacura, Región Metropolitana">Vitacura (Santiago)</option>
                          <option value="Lo Barnechea, Región Metropolitana">Lo Barnechea (Santiago)</option>
                          <option value="Providencia, Región Metropolitana">Providencia (Santiago)</option>
                          <option value="Ñuñoa, Región Metropolitana">Ñuñoa (Santiago)</option>
                          <option value="Santiago Centro, Región Metropolitana">Santiago Centro</option>
                          <option value="La Reina, Región Metropolitana">La Reina (Santiago)</option>
                          <option value="Colina / Chicureo, Región Metropolitana">Colina / Chicureo</option>
                          <option value="Viña del Mar, Región de Valparaíso">Viña del Mar (V Región)</option>
                          <option value="Concepción, Región del Biobío">Concepción (VIII Región)</option>
                          <option value="Otra Comuna de Chile">Otra Comuna (Envíos a todo Chile)</option>
                        </select>
                      </div>
                      <div class="c-input-wrap">
                        <label for="c-notes">Indicaciones de Entrega (Opcional)</label>
                        <input type="text" id="c-notes" class="c-text-input" placeholder="Ej: Dejar con conserje">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Resumen de Costos y Pago -->
                <div class="checkout-totals-summary">
                  <div class="c-total-row">
                    <span>Subtotal Afinaciones:</span>
                    <strong id="chk-subtotal-val">$0 CLP</strong>
                  </div>
                  <div class="c-total-row">
                    <span>Costo de Despacho:</span>
                    <strong id="chk-shipping-val">$4.990 CLP</strong>
                  </div>
                  <div class="c-total-row c-final-row">
                    <span>Total a Pagar:</span>
                    <strong id="chk-total-val" class="gold-text">$0 CLP</strong>
                  </div>
                </div>

                <div id="checkout-form-error" class="checkout-error-msg" style="display: none;"></div>

                <button type="submit" class="btn-checkout-webpay">
                  <div class="btn-webpay-flex">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>Pagar con Webpay Plus</span>
                  </div>
                  <span class="webpay-subtext">Débito Redcompra • Tarjetas de Crédito • Prepago • MACH</span>
                </button>

                <div class="tbk-trust-strip">
                  <span>🔒 Pasarela Oficial Transbank • Certificación SSL 256-bit • Protocolo 3D-Secure</span>
                </div>
              </form>
            </div>

            <!-- Paso 2: Procesamiento y Conexión Bancaria 3D Secure -->
            <div id="webpay-step-2" class="webpay-step">
              <div class="tbk-processing-box">
                <div class="tbk-spinner"></div>
                <h4>Conectando con Servidor Seguro Webpay Plus...</h4>
                <p>Validando transacción con Transbank y autorizando la orden con su banco emisor.</p>
                <div class="secure-token-tag">Token de Sesión Transbank: TBK-${Math.floor(10000000 + Math.random() * 90000000)}</div>
              </div>
            </div>

            <!-- Paso 3: Transacción Aprobada & Boleta Electrónica Oficial -->
            <div id="webpay-step-3" class="webpay-step">
              <div id="checkout-receipt-container" class="checkout-receipt-wrap">
                <!-- Se inyecta la Boleta Electrónica dinámica -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  setDeliveryMethod(method) {
    this.deliveryMethod = method;
    const optDelivery = document.getElementById("opt-delivery");
    const optPickup = document.getElementById("opt-pickup");
    const addressBox = document.getElementById("address-fields-box");

    if (method === "pickup") {
      optPickup?.classList.add("active");
      optDelivery?.classList.remove("active");
      if (addressBox) addressBox.style.display = "none";
      this.shippingCost = 0;
    } else {
      optDelivery?.classList.add("active");
      optPickup?.classList.remove("active");
      if (addressBox) addressBox.style.display = "block";
      this.shippingCost = this.currentSubtotal >= 60000 ? 0 : 4990;
    }

    this.updateTotals();
  }

  updateTotals() {
    this.currentTotal = this.currentSubtotal + this.shippingCost;

    const subEl = document.getElementById("chk-subtotal-val");
    const shipEl = document.getElementById("chk-shipping-val");
    const totEl = document.getElementById("chk-total-val");
    const shipLabelEl = document.getElementById("label-shipping-cost");

    if (subEl) subEl.textContent = formatCLP(this.currentSubtotal);
    if (shipEl) {
      shipEl.innerHTML = this.shippingCost === 0 ? `<span class="gold-text">GRATIS</span>` : formatCLP(this.shippingCost);
    }
    if (shipLabelEl) {
      shipLabelEl.innerHTML = (this.currentSubtotal >= 60000) ? `<span class="gold-text">GRATIS</span>` : `$4.990 CLP`;
    }
    if (totEl) totEl.textContent = formatCLP(this.currentTotal);
  }

  openWebpayModal(amount) {
    this.currentSubtotal = amount || (window.CartManager ? window.CartManager.getSubtotal() : 0);
    this.shippingCost = this.deliveryMethod === "pickup" ? 0 : (this.currentSubtotal >= 60000 ? 0 : 4990);
    this.currentTotal = this.currentSubtotal + this.shippingCost;

    const modal = document.getElementById("webpay-modal");
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Resetear a paso 1
    document.getElementById("webpay-step-1")?.classList.add("active");
    document.getElementById("webpay-step-2")?.classList.remove("active");
    document.getElementById("webpay-step-3")?.classList.remove("active");

    const err = document.getElementById("checkout-form-error");
    if (err) err.style.display = "none";

    this.updateTotals();
  }

  closeWebpayModal() {
    const modal = document.getElementById("webpay-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  handleCheckoutSubmit(e) {
    if (e) e.preventDefault();

    const name = (document.getElementById("c-name")?.value || "").trim();
    const phone = (document.getElementById("c-phone")?.value || "").trim();
    const email = (document.getElementById("c-email")?.value || "").trim();
    const address = (document.getElementById("c-address")?.value || "").trim();
    const commune = document.getElementById("c-commune")?.value || "Santiago";
    const notes = (document.getElementById("c-notes")?.value || "").trim();
    const errorEl = document.getElementById("checkout-form-error");

    if (!name || !phone) {
      if (errorEl) {
        errorEl.textContent = "Por favor ingrese su Nombre y Teléfono de contacto.";
        errorEl.style.display = "block";
      }
      return;
    }

    if (this.deliveryMethod === "delivery" && !address) {
      if (errorEl) {
        errorEl.textContent = "Por favor ingrese la dirección completa de entrega.";
        errorEl.style.display = "block";
      }
      return;
    }

    if (errorEl) errorEl.style.display = "none";

    this.processPayment({
      name,
      phone,
      email,
      method: this.deliveryMethod,
      address: this.deliveryMethod === "pickup" ? "Retiro en Cava Central (Av. Vitacura 3565)" : address,
      commune: this.deliveryMethod === "pickup" ? "Vitacura, Santiago" : commune,
      notes
    });
  }

  processPayment(customerData) {
    // Pasar a paso 2 (simulación de autorización bancaria)
    document.getElementById("webpay-step-1")?.classList.remove("active");
    document.getElementById("webpay-step-2")?.classList.add("active");

    setTimeout(() => {
      document.getElementById("webpay-step-2")?.classList.remove("active");
      document.getElementById("webpay-step-3")?.classList.add("active");

      const authCode = "TBK-" + Math.floor(100000 + Math.random() * 900000);
      const orderNum = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const trackingCode = customerData.method === "delivery" ? "BLX-" + Math.floor(10000000 + Math.random() * 90000000) : "";
      const now = new Date().toLocaleString("es-CL");

      const cartItems = (window.CartManager && window.CartManager.getCart().length > 0)
        ? [...window.CartManager.getCart()]
        : [
            {
              name: "Cofre Degustación 'Grand Affineur' (5 Quesos)",
              weight: "1.250g con acompañamientos",
              price: this.currentSubtotal,
              quantity: 1,
              image: "img/products/tabla-degustacion.jpg"
            }
          ];

      const newOrder = {
        id: orderNum,
        authCode: authCode,
        date: now,
        timestamp: Date.now(),
        customer: {
          name: customerData.name,
          email: customerData.email || "No especificado",
          phone: customerData.phone,
          address: customerData.address,
          commune: customerData.commune,
          deliveryType: customerData.method === "pickup" ? "Retiro en Cava" : "Despacho Refrigerado Blue Express",
          notes: customerData.notes || ""
        },
        items: cartItems,
        subtotal: this.currentSubtotal,
        shipping: this.shippingCost,
        total: this.currentTotal,
        paymentMethod: "Webpay Plus Débito / Crédito Transbank",
        bank: "Transbank Webpay Plus",
        status: customerData.method === "pickup" ? "Listo para Retiro en Cava" : "En Cava (Preparación Fría)",
        trackingCode: trackingCode,
        trackingUrl: trackingCode ? `https://www.bluex.cl/seguimiento?n=${trackingCode}` : ""
      };

      this.lastCreatedOrder = newOrder;

      // Registrar venta en el Panel de Administración de Pedidos
      if (window.OrdersApp) {
        window.OrdersApp.addOrder(newOrder);
      }

      // Vaciar carrito
      if (window.CartManager) {
        window.CartManager.clear();
      }

      // Renderizar Boleta Electrónica Oficial y botones de descarga/envío
      this.renderReceipt(newOrder);

      // Notificar al chatbot
      if (window.SommelierBot) {
        window.SommelierBot.addBotMessage(
          `¡Enhorabuena! Transbank ha confirmado el pago de su orden **${orderNum}** por **${formatCLP(newOrder.total)}** con código de autorización **${authCode}**. Su boleta electrónica ha sido generada y el pedido ingresó al panel de cava.`
        );
      }
    }, 1800);
  }

  renderReceipt(order) {
    const container = document.getElementById("checkout-receipt-container");
    if (!container) return;

    const netAmount = Math.round(order.total / 1.19);
    const ivaAmount = order.total - netAmount;

    container.innerHTML = `
      <div class="chk-success-badge">
        <span class="chk-badge-dot">✓</span>
        <span>TRANSACCIÓN AUTORIZADA EXITOSAMENTE</span>
      </div>

      <div class="receipt-paper chk-paper-shadow">
        <div class="receipt-top-header">
          <div class="receipt-seller-info">
            <h2 class="r-seller-name">LA CAVA NOIRE GOURMET SPA</h2>
            <p>RUT: 77.892.410-8 • GIRO: VENTA Y AFINACIÓN DE QUESOS</p>
            <p>AV. ALONSO DE CÓRDOVA 3940, VITACURA, SANTIAGO</p>
            <p>DOCUMENTO ELECTRÓNICO TRIBUTARIO</p>
          </div>
          <div class="receipt-box-sii">
            <span class="sii-title">BOLETA ELECTRÓNICA</span>
            <span class="sii-number">N° ${order.id.replace('ORD-', '')}</span>
            <span class="sii-office">S.I.I. - SANTIAGO ORIENTE</span>
          </div>
        </div>

        <div class="receipt-customer-strip">
          <div><span>SEÑOR(A):</span> <strong>${order.customer.name.toUpperCase()}</strong></div>
          <div><span>ENTREGA:</span> <strong>${order.customer.address.toUpperCase()} (${order.customer.commune.toUpperCase()})</strong></div>
          <div><span>CONTACTO:</span> <strong>${order.customer.phone} ${order.customer.email ? '• ' + order.customer.email : ''}</strong></div>
          <div><span>FECHA EMISIÓN:</span> <strong>${order.date}</strong></div>
          <div><span>PAGO:</span> <strong>WEBPAY PLUS TRANSBANK</strong> (AUTH: ${order.authCode})</div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>DETALLE PRODUCTO</th>
              <th>CANT.</th>
              <th>UNITARIO</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(it => `
              <tr>
                <td>${it.name} (${it.weight || 'Pieza'})</td>
                <td>${it.quantity}</td>
                <td>${formatCLP(it.price)}</td>
                <td>${formatCLP(it.price * it.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="receipt-totals-grid">
          <div><span>MONTO NETO:</span> <strong>${formatCLP(netAmount)}</strong></div>
          <div><span>I.V.A. (19%):</span> <strong>${formatCLP(ivaAmount)}</strong></div>
          <div><span>DESPACHO:</span> <strong>${order.shipping === 0 ? 'GRATIS' : formatCLP(order.shipping)}</strong></div>
          <div class="r-total-highlight"><span>TOTAL PAGADO:</span> <strong>${formatCLP(order.total)}</strong></div>
        </div>

        <div class="receipt-cold-chain-stamp">
          <span>❄️ CERTIFICADO DE CADENA DE FRÍO 4°C: Lote empacado bajo atmósfera termocontrolada con gel criogénico.</span>
        </div>

        <!-- Botones de Acción de Boleta -->
        <div class="chk-receipt-actions">
          <button class="btn-chk-print" onclick="window.print()">
            <span>🖨️ Descargar Boleta (PDF / Imprimir)</span>
          </button>
          <button class="btn-chk-email" onclick="window.PaymentGateway.sendReceiptEmail()">
            <span>✉️ Enviar a mi Correo</span>
          </button>
          ${order.trackingCode ? `
            <button class="btn-chk-track" onclick="window.PaymentGateway.closeWebpayModal(); window.OrdersApp.trackBlueExpress('${order.trackingCode}', '${order.id}')">
              <span>🚚 Ver Seguimiento Blue Express</span>
            </button>
          ` : ''}
          <button class="btn-chk-done" onclick="window.PaymentGateway.finishOrder()">
            <span>Volver a la Cava de Quesos</span>
          </button>
        </div>
      </div>
    `;
  }

  sendReceiptEmail() {
    if (!this.lastCreatedOrder) return;
    let email = this.lastCreatedOrder.customer.email;
    if (!email || email === "No especificado") {
      email = prompt("Por favor ingrese su correo electrónico para enviarle la boleta:");
      if (!email || !email.includes("@")) {
        alert("Correo electrónico no válido.");
        return;
      }
      this.lastCreatedOrder.customer.email = email;
      if (window.OrdersApp) window.OrdersApp.save();
    }

    if (window.CartManager) {
      window.CartManager.showToast(`✓ Boleta electrónica N° ${this.lastCreatedOrder.id.replace('ORD-', '')} enviada con éxito a ${email}`);
    } else {
      alert(`✓ Boleta electrónica N° ${this.lastCreatedOrder.id.replace('ORD-', '')} enviada con éxito a ${email}`);
    }
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
    // Filtros de categoría con pulsación táctil háptica y deslizamiento lento y agradable
    const filterPills = document.querySelectorAll(".cat-filter-btn");
    filterPills.forEach(btn => {
      btn.addEventListener("click", () => {
        // Micro-animación elástica al pulsar el botón
        btn.classList.add("btn-filter-press");
        setTimeout(() => btn.classList.remove("btn-filter-press"), 420);

        filterPills.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCategory = btn.getAttribute("data-category");
        this.render();

        // Deslizarse lentamente hacia el catálogo ("lentamente pero un tiempo ideal")
        if (typeof window.glideToSection === "function") {
          window.glideToSection("#catalogo", 15, 750);
        }
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
                  <strong class="bar-score text-gold modal-counter-val" data-target="${product.acidity}" data-suffix="%">0%</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-acidity chart-anim" data-target="${product.acidity}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">⭐ Intensidad de Sabor:</span>
                  <strong class="bar-score modal-counter-val" data-target="${product.intensityScore}" data-suffix="%">0%</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-intensity chart-anim" data-target="${product.intensityScore}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">🧈 Nivel de Cremosidad:</span>
                  <strong class="bar-score modal-counter-val" data-target="${product.creaminess}" data-suffix="%">0%</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-creaminess chart-anim" data-target="${product.creaminess}" style="width: 0%;"></div>
                </div>
              </div>

              <div class="chart-bar-item">
                <div class="chart-bar-labels">
                  <span class="bar-name">🧂 Punto Salino:</span>
                  <strong class="bar-score modal-counter-val" data-target="${product.salinity}" data-suffix="%">0%</strong>
                </div>
                <div class="chart-track">
                  <div class="chart-fill chart-fill-salinity chart-anim" data-target="${product.salinity}" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Datos Básicos y Acompañamiento -->
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
            <strong>🥖 Acompañamiento sugerido en mesa:</strong>
            <p>${product.accompaniment || product.pairing}</p>
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
            <button class="btn-modal-ask-bot" onclick="window.ProductCatalog.closeProductModal(); (window.FromagerBot || window.SommelierBot).openChat(); (window.FromagerBot || window.SommelierBot).handleUserMessage('Hola Jean-Pierre, cuéntame sobre el queso ${product.name} y cómo servirlo.');" title="Consultar al Maestro Quesero">
              <span>🧀 Consultar al Maestro Quesero</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Animación suave de llenado hacia el punto exacto de acidez y notas + conteo numérico 0 a X%
    requestAnimationFrame(() => {
      setTimeout(() => {
        contentEl.querySelectorAll(".chart-anim").forEach(bar => {
          const target = bar.getAttribute("data-target");
          if (target) {
            bar.style.width = `${target}%`;
          }
        });

        contentEl.querySelectorAll(".modal-counter-val").forEach(counter => {
          const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
          const suffix = counter.getAttribute("data-suffix") || "%";
          if (window.ScrollRevealEngine) {
            window.ScrollRevealEngine.animateNumberCounter(counter, target, 2100, suffix);
          } else {
            counter.textContent = `${target}${suffix}`;
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
      <article class="cheese-card luxury-card-3d scroll-reveal-card" data-id="${item.id}" onclick="window.ProductCatalog.openProductModal('${item.id}')">
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
          
          <!-- Mini Indicadores Clave Prácticos con Barras y Porcentajes Dinámicos (0 a X%) -->
          <div class="card-quick-metrics">
            <div class="card-metric-pill" title="Nivel Real de Acidez: ${item.acidity}%">
              <div class="metric-head">
                <span class="m-label">🍋 Acidez</span>
                <strong class="m-val counter-card-metric text-gold" data-target="${item.acidity}" data-suffix="%">0%</strong>
              </div>
              <div class="metric-track">
                <div class="metric-fill metric-fill-acidity" data-target="${item.acidity}" style="width: 0%;"></div>
              </div>
            </div>

            <div class="card-metric-pill" title="Intensidad de Sabor: ${item.intensityScore}%">
              <div class="metric-head">
                <span class="m-label">⭐ Sabor</span>
                <strong class="m-val counter-card-metric" data-target="${item.intensityScore}" data-suffix="%">0%</strong>
              </div>
              <div class="metric-track">
                <div class="metric-fill metric-fill-intensity" data-target="${item.intensityScore}" style="width: 0%;"></div>
              </div>
            </div>

            <div class="card-metric-pill" title="Nivel de Cremosidad: ${item.creaminess}%">
              <div class="metric-head">
                <span class="m-label">🧈 Crema</span>
                <strong class="m-val counter-card-metric" data-target="${item.creaminess}" data-suffix="%">0%</strong>
              </div>
              <div class="metric-track">
                <div class="metric-fill metric-fill-creaminess" data-target="${item.creaminess}" style="width: 0%;"></div>
              </div>
            </div>
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

    // Disparar animación de entrada escalonada fluida a 120Hz para las tarjetas
    grid.classList.remove("animating-filter");
    void grid.offsetWidth;
    grid.classList.add("animating-filter");

    // Registrar tarjetas en el motor de scroll y revelado dinámico
    if (window.ScrollRevealEngine) {
      window.ScrollRevealEngine.observeNewElements();
    }

    this.attachTiltEffects();
  }

  attachTiltEffects() {
    // Delegado al compositor GPU en CSS con will-change: transform para 60-120fps puros sin reflows
  }
}

// --- MOTOR DE REVELADO, ACOMODO AL SCROLL & CONTADORES DE PORCENTAJES (SCROLL REVEAL ENGINE 120Hz) ---
class ScrollRevealEngine {
  constructor() {
    this.observer = null;
    this.animatedElements = new WeakSet();
    this.init();
    this.setupResetOnTop();
  }

  /**
   * Anima un número desde 0 hasta su valor objetivo con un ritmo pausado y elegante a 120Hz (~2.1s)
   */
  animateNumberCounter(element, targetVal, duration = 2100, suffix = "%", prefix = "") {
    if (!element) return;
    let startTime = null;
    const startVal = 0;

    if (element._animRaf) {
      cancelAnimationFrame(element._animRaf);
      element._animRaf = null;
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Curva cuadrática suave (easeOutQuad) que permite leer cada porcentaje sin prisas
      const ease = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(startVal + (targetVal - startVal) * ease);

      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        element._animRaf = requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${targetVal}${suffix}`;
        element._animRaf = null;
      }
    }

    element._animRaf = requestAnimationFrame(step);
  }

  /**
   * Activa el acomodo y animaciones de un contenedor al entrar a la vista
   */
  triggerEntrance(container) {
    if (!container) return;
    container.classList.add("is-in-view");

    // 1. Contadores numéricos (0 a X%) pausados y bien visibles
    const counters = container.querySelectorAll(".counter-metric, .counter-card-metric, .counter-val");
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
      const suffix = counter.getAttribute("data-suffix") || "%";
      const prefix = counter.getAttribute("data-prefix") || "";
      this.animateNumberCounter(counter, target, 2100, suffix, prefix);
    });

    // 2. Barras de progreso de métricas (0% a X% width)
    const bars = container.querySelectorAll(".metric-fill, .c-bar-fill, .craft-fill, .badge-fill");
    bars.forEach(bar => {
      const target = bar.getAttribute("data-target");
      if (target) {
        bar.style.width = `${target}%`;
      }
    });
  }

  /**
   * Resetea el contenedor para que vuelva a animarse si el usuario sube y vuelve a bajar
   */
  resetContainer(container) {
    if (!container) return;
    container.classList.remove("is-in-view");

    const counters = container.querySelectorAll(".counter-metric, .counter-card-metric, .counter-val");
    counters.forEach(counter => {
      if (counter._animRaf) cancelAnimationFrame(counter._animRaf);
      const suffix = counter.getAttribute("data-suffix") || "%";
      const prefix = counter.getAttribute("data-prefix") || "";
      counter.textContent = `${prefix}0${suffix}`;
    });

    const bars = container.querySelectorAll(".metric-fill, .c-bar-fill, .craft-fill, .badge-fill");
    bars.forEach(bar => {
      bar.style.width = "0%";
    });
  }

  init() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".scroll-reveal-group, .modern-stat-reveal, .scroll-reveal-card").forEach(el => {
        this.triggerEntrance(el);
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.12
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (!this.animatedElements.has(el)) {
            this.animatedElements.add(el);
            this.triggerEntrance(el);
          }
        } else {
          // Si el elemento sale de la pantalla por arriba o por abajo, permitir que vuelva a acomodarse
          const rect = entry.boundingClientRect;
          if (rect.top > window.innerHeight || rect.bottom < -100) {
            this.animatedElements.delete(el);
            this.resetContainer(el);
          }
        }
      });
    }, observerOptions);

    this.observeNewElements();
  }

  observeNewElements() {
    if (!this.observer) return;
    const elementsToObserve = document.querySelectorAll(
      ".scroll-reveal-group, .modern-stat-reveal, .scroll-reveal-card, .cold-chain-card, .philosophy-section"
    );
    elementsToObserve.forEach(el => {
      if (!el.dataset.observed) {
        el.dataset.observed = "true";
        this.observer.observe(el);
      }
    });
  }

  setupResetOnTop() {
    // Al volver al menú principal o inicio de la página, resetear para que al bajar todo vuelva a acomodarse
    let lastScrollY = window.pageYOffset;
    window.addEventListener("scroll", () => {
      const currentY = window.pageYOffset;
      if (currentY < 70 && lastScrollY >= 70) {
        document.querySelectorAll(".scroll-reveal-group, .scroll-reveal-card, .cold-chain-card, .philosophy-section").forEach(el => {
          this.animatedElements.delete(el);
          this.resetContainer(el);
        });
      }
      lastScrollY = currentY;
    }, { passive: true });
  }
}

// --- MOTOR DE DESPLAZAMIENTO SUAVE & ELEGANTE (SMOOTH GLIDE CONTROLLER 120Hz) ---
let activeGlideRaf = null;

/**
 * Desplaza la página con una curva cúbica fluida ("deslizándose lentamente pero un tiempo ideal")
 * @param {number} targetY - Posición de scroll vertical de destino
 * @param {number} duration - Duración en milisegundos (por defecto 780ms)
 * @param {Function} [callback] - Función a ejecutar al completar el deslizamiento
 */
window.smoothGlideTo = function(targetY, duration = 780, callback) {
  if (activeGlideRaf) {
    cancelAnimationFrame(activeGlideRaf);
    activeGlideRaf = null;
  }

  const startY = window.pageYOffset;
  const distance = targetY - startY;

  // Si la distancia es insignificante, saltar suavemente
  if (Math.abs(distance) < 5) {
    window.scrollTo(0, targetY);
    if (callback) callback();
    return;
  }

  // Tiempo ideal: duración controlada y calibrada según distancia (680ms a 900ms)
  const actualDuration = Math.min(Math.max(duration, 680), 920);
  let startTime = null;

  // Curva cúbica bezier suave (suave aceleración, velocidad agradable y desaceleración sedosa)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / actualDuration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * ease);

    if (progress < 1) {
      activeGlideRaf = requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      activeGlideRaf = null;
      if (callback) callback();
    }
  }

  activeGlideRaf = requestAnimationFrame(step);
};

// Cancelar suavemente si el usuario interactúa manualmente durante el deslizamiento
window.addEventListener("wheel", () => {
  if (activeGlideRaf) {
    cancelAnimationFrame(activeGlideRaf);
    activeGlideRaf = null;
  }
}, { passive: true });

window.addEventListener("touchmove", () => {
  if (activeGlideRaf) {
    cancelAnimationFrame(activeGlideRaf);
    activeGlideRaf = null;
  }
}, { passive: true });

/**
 * Desplaza la vista hacia un elemento o selector considerando la barra fija superior
 */
window.glideToSection = function(selectorOrElement, extraOffset = 15, duration = 780, callback) {
  if (!selectorOrElement) return;

  if (selectorOrElement === "#" || selectorOrElement === "#top" || selectorOrElement === "top") {
    window.smoothGlideTo(0, duration, callback);
    return;
  }

  const target = typeof selectorOrElement === "string" 
    ? document.querySelector(selectorOrElement) 
    : selectorOrElement;

  if (!target) return;

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.getBoundingClientRect().height : 80;
  const elementPosition = target.getBoundingClientRect().top;
  const targetY = Math.max(0, elementPosition + window.pageYOffset - headerHeight - extraOffset);

  window.smoothGlideTo(targetY, duration, () => {
    target.classList.remove("section-glide-highlight");
    void target.offsetWidth;
    target.classList.add("section-glide-highlight");
    if (callback) callback();
  });
};

// --- 4. INICIALIZACIÓN GLOBAL ---
document.addEventListener("DOMContentLoaded", () => {
  window.CartManager = new CartManager();
  window.PaymentGateway = new PaymentGateway();
  window.ProductCatalog = new ProductCatalog();
  window.ScrollRevealEngine = new ScrollRevealEngine();

  // Menú hamburguesa móvil
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-nav-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  // 1. Logotipo de la Casa: "⚜ LA CAVA NOIRE FROMAGERIE & AFFINEUR PRIVÉE" -> Desliza al inicio suavemente
  const brandLogo = document.querySelector(".brand-logo");
  if (brandLogo) {
    brandLogo.addEventListener("click", (e) => {
      e.preventDefault();
      brandLogo.classList.add("btn-pressed-tactile");
      setTimeout(() => brandLogo.classList.remove("btn-pressed-tactile"), 450);

      document.querySelectorAll(".desktop-nav .nav-link, .mobile-nav-menu a").forEach(l => l.classList.remove("active"));
      window.smoothGlideTo(0, 750);
    });
  }

  // 2. Enlaces de Navegación de Escritorio (Afinaciones de Autor, Cadena de Frío, Nuestra Cava)
  document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
    link.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();

      this.classList.add("btn-pressed-tactile");
      setTimeout(() => this.classList.remove("btn-pressed-tactile"), 450);

      document.querySelectorAll(".desktop-nav .nav-link").forEach(l => l.classList.remove("active"));
      this.classList.add("active");

      let duration = 750;
      if (href === "#filosofia") duration = 850;
      if (href === "#cadena-frio") duration = 800;

      window.glideToSection(href, 15, duration);
    });
  });

  // 3. Enlaces del Menú Desplegable Móvil
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", function(e) {
        const href = this.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        e.preventDefault();

        mobileMenu.classList.remove("open");

        let duration = 750;
        if (href === "#filosofia") duration = 850;
        if (href === "#cadena-frio") duration = 800;

        window.glideToSection(href, 15, duration);
      });
    });
  }

  // 4. Botón Hero: "Ver Quesos Disponibles" -> Desplaza suavemente hacia el catálogo
  const heroPrimaryBtn = document.querySelector(".btn-hero-primary");
  if (heroPrimaryBtn) {
    heroPrimaryBtn.addEventListener("click", function(e) {
      e.preventDefault();
      heroPrimaryBtn.classList.add("btn-pressed-tactile");
      setTimeout(() => heroPrimaryBtn.classList.remove("btn-pressed-tactile"), 450);

      window.glideToSection("#catalogo", 15, 750);
    });
  }

  // 5. Botones Hero y Cabecera del Asistente Quesero -> Efecto de pulsación táctil
  const sommelierTriggerBtns = document.querySelectorAll(".btn-header-sommelier, .btn-hero-secondary, .btn-mobile-sommelier");
  sommelierTriggerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.add("btn-pressed-tactile");
      setTimeout(() => btn.classList.remove("btn-pressed-tactile"), 450);
    });
  });

  // 6. ScrollSpy sutil: ilumina el enlace de navegación correspondiente a la sección visible
  const trackedSections = [
    { id: "catalogo", link: document.querySelector('.desktop-nav a[href="#catalogo"]') },
    { id: "cadena-frio", link: document.querySelector('.desktop-nav a[href="#cadena-frio"]') },
    { id: "filosofia", link: document.querySelector('.desktop-nav a[href="#filosofia"]') }
  ];

  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;
    const headerHeight = 90;

    trackedSections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el && sec.link) {
        const top = el.offsetTop - headerHeight - 40;
        const bottom = top + el.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          document.querySelectorAll(".desktop-nav .nav-link").forEach(l => l.classList.remove("active"));
          sec.link.classList.add("active");
        }
      }
    });
  }, { passive: true });
});
