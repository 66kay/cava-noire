/**
 * LA CAVA NOIRE // Módulo de Gestión de Pedidos & Registro de Ventas Webpay
 * Almacena las compras, emite notificaciones, genera tracking Blue Express y boletas de venta.
 */

class OrdersManager {
  constructor() {
    this.storageKey = "cava_noire_orders";
    this.orders = this.loadOrders();
    this.currentFilter = "todos";

    this.initAdminLoginModal();
    this.initDOM();
    this.initTrackingModal();
    this.initReceiptModal();
    this.updateBadges();

    // Acceso directo por URL Hash #admin
    if (window.location.hash === "#admin") {
      setTimeout(() => this.openAdminPortal(), 350);
    }
    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#admin") {
        this.openAdminPortal();
      }
    });

    // Atajo de teclado: Ctrl + Shift + A (o Cmd + Shift + A)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        this.openAdminPortal();
      }
    });
  }

  /* GESTIÓN DE ACCESO ADMINISTRATIVO (ADMIN GATE) */
  isAdminAuthenticated() {
    return sessionStorage.getItem("cava_admin_auth") === "true";
  }

  openAdminPortal() {
    if (this.isAdminAuthenticated()) {
      this.openModal();
    } else {
      this.openAdminLogin();
    }
  }

  openAdminLogin() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      const err = document.getElementById("admin-login-error");
      if (err) err.style.display = "none";
      setTimeout(() => {
        document.getElementById("admin-user-input")?.focus();
      }, 100);
    }
  }

  closeAdminLogin() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  handleAdminLogin(e) {
    if (e) e.preventDefault();
    const userInput = document.getElementById("admin-user-input");
    const passInput = document.getElementById("admin-pass-input");
    const errorEl = document.getElementById("admin-login-error");
    const userVal = (userInput?.value || "").trim().toLowerCase();
    const passVal = (passInput?.value || "").trim();

    if (userVal === "admin" && passVal === "admin") {
      sessionStorage.setItem("cava_admin_auth", "true");
      this.closeAdminLogin();
      this.openModal();
      if (window.CartManager) {
        window.CartManager.showToast("✓ Sesión iniciada: Administrador General");
      }
    } else {
      if (errorEl) {
        errorEl.textContent = "Credenciales incorrectas. Verifique usuario y contraseña.";
        errorEl.style.display = "block";
      }
    }
  }

  adminLogout() {
    sessionStorage.removeItem("cava_admin_auth");
    this.closeModal();
    if (window.CartManager) {
      window.CartManager.showToast("Sesión de administrador cerrada.");
    }
  }

  /* MODAL DE AUTENTICACIÓN ADMINISTRATIVA (ADMIN LOGIN MODAL) */
  initAdminLoginModal() {
    if (document.getElementById("admin-login-modal")) return;

    const loginHTML = `
      <div id="admin-login-modal" class="admin-login-modal" aria-hidden="true">
        <div class="admin-login-backdrop" onclick="window.OrdersApp.closeAdminLogin()"></div>
        <div class="admin-login-card">
          <div class="admin-login-header">
            <div class="admin-login-brand">
              <span class="admin-crown-icon">⚜</span>
              <div>
                <h3 class="admin-login-title">Control Maestro de Cava</h3>
                <p class="admin-login-sub">Acceso restringido para Sommeliers y Administradores</p>
              </div>
            </div>
            <button class="admin-login-close" onclick="window.OrdersApp.closeAdminLogin()">×</button>
          </div>

          <form class="admin-login-form" onsubmit="window.OrdersApp.handleAdminLogin(event)">
            <div class="admin-form-group">
              <label for="admin-user-input" class="admin-input-label">Usuario Administrador</label>
              <div class="admin-input-wrap">
                <span class="admin-input-icon">👤</span>
                <input 
                  type="text" 
                  id="admin-user-input" 
                  class="admin-text-input" 
                  placeholder="Ingrese usuario"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <div class="admin-form-group">
              <label for="admin-pass-input" class="admin-input-label">Contraseña de Seguridad</label>
              <div class="admin-input-wrap">
                <span class="admin-input-icon">🔑</span>
                <input 
                  type="password" 
                  id="admin-pass-input" 
                  class="admin-text-input" 
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <div id="admin-login-error" class="admin-login-error-msg" style="display: none;"></div>

            <div class="admin-login-buttons">
              <button type="submit" class="btn-admin-submit">
                <span>🔒 Iniciar Sesión de Administrador</span>
              </button>
            </div>
          </form>

          <div class="admin-login-footer">
            <span class="admin-security-badge">🛡️ Sesión Segura SSL 256-bit • Auditoría Cava Noire</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", loginHTML);
  }

  loadOrders() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const loaded = JSON.parse(raw);
        // Garantizar que siempre exista un ejemplo en la pestaña de Entregados para pruebas
        if (Array.isArray(loaded) && !loaded.some(o => o.status && o.status.includes("Entregado"))) {
          loaded.push({
            id: "ORD-652091",
            authCode: "TBK-381042",
            date: "26/09/2026 11:30",
            timestamp: Date.now() - 1000 * 60 * 60 * 28,
            customer: {
              name: "Vicente Larraín",
              email: "vicente.larrain@gmail.com",
              phone: "+56 9 8124 9910",
              address: "Av. Las Condes 12461, Torre B",
              commune: "Las Condes, Región Metropolitana"
            },
            items: [
              {
                name: "Parmigiano Reggiano Vacche Rosse (30 Meses)",
                weight: "300g",
                price: 31990,
                quantity: 1,
                image: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=160&auto=format&fit=crop&q=70"
              },
              {
                name: "Morbier AOP con Raya de Ceniza Vegetal",
                weight: "250g",
                price: 22990,
                quantity: 1,
                image: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=160&auto=format&fit=crop&q=70"
              }
            ],
            subtotal: 54980,
            shipping: 4990,
            total: 59970,
            paymentMethod: "Webpay Plus Débito (Banco de Chile)",
            bank: "Banco de Chile",
            status: "Entregado al Cliente",
            trackingCode: "BLX-77218402",
            trackingUrl: "https://www.bluex.cl/seguimiento?n=BLX-77218402"
          });
          localStorage.setItem(this.storageKey, JSON.stringify(loaded));
        }
        return loaded;
      } catch (e) {
        console.error("Error al cargar pedidos:", e);
      }
    }

    // Pedidos iniciales de demostración para visualización inmediata
    const initialOrders = [
      {
        id: "ORD-819240",
        authCode: "TBK-548912",
        date: "27/09/2026 19:42",
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        customer: {
          name: "Andrés Maturana",
          email: "andres.maturana@gmail.com",
          phone: "+56 9 7412 8839",
          address: "Av. Bicentenario 3800, Depto 902",
          commune: "Vitacura, Región Metropolitana"
        },
        items: [
          {
            name: "Comté Extra Réserve AOP (36 Meses)",
            weight: "250g",
            price: 29990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=160&auto=format&fit=crop&q=70"
          },
          {
            name: "Pecorino al Tartufo Nero Riserva",
            weight: "220g",
            price: 34990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=160&auto=format&fit=crop&q=70"
          }
        ],
        subtotal: 64980,
        shipping: 0,
        total: 64980,
        paymentMethod: "Webpay Plus Débito (Banco de Chile)",
        bank: "Banco de Chile",
        status: "En Cava (Preparación Fría)",
        trackingCode: "BLX-88492019",
        trackingUrl: "https://www.bluex.cl/seguimiento?n=BLX-88492019"
      },
      {
        id: "ORD-739104",
        authCode: "TBK-921473",
        date: "27/09/2026 14:15",
        timestamp: Date.now() - 1000 * 60 * 60 * 8,
        customer: {
          name: "Sofía Errázuriz",
          email: "sofia.errazuriz@outlook.cl",
          phone: "+56 9 9231 4452",
          address: "Camino El Algarrobo 1540",
          commune: "Lo Barnechea, Región Metropolitana"
        },
        items: [
          {
            name: "Cofre Degustación 'Grand Affineur' (5 Quesos)",
            weight: "1.250g con acompañamientos",
            price: 89990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=160&auto=format&fit=crop&q=70"
          }
        ],
        subtotal: 89990,
        shipping: 0,
        total: 89990,
        paymentMethod: "Webpay Plus Crédito (Santander)",
        bank: "Banco Santander",
        status: "Despachado (Blue Express)",
        trackingCode: "BLX-91402841",
        trackingUrl: "https://www.bluex.cl/seguimiento?n=BLX-91402841"
      },
      {
        id: "ORD-652091",
        authCode: "TBK-381042",
        date: "26/09/2026 11:30",
        timestamp: Date.now() - 1000 * 60 * 60 * 28,
        customer: {
          name: "Vicente Larraín",
          email: "vicente.larrain@gmail.com",
          phone: "+56 9 8124 9910",
          address: "Av. Las Condes 12461, Torre B",
          commune: "Las Condes, Región Metropolitana"
        },
        items: [
          {
            name: "Parmigiano Reggiano Vacche Rosse (30 Meses)",
            weight: "300g",
            price: 31990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=160&auto=format&fit=crop&q=70"
          },
          {
            name: "Morbier AOP con Raya de Ceniza Vegetal",
            weight: "250g",
            price: 22990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=160&auto=format&fit=crop&q=70"
          }
        ],
        subtotal: 54980,
        shipping: 4990,
        total: 59970,
        paymentMethod: "Webpay Plus Débito (Banco de Chile)",
        bank: "Banco de Chile",
        status: "Entregado al Cliente",
        trackingCode: "BLX-77218402",
        trackingUrl: "https://www.bluex.cl/seguimiento?n=BLX-77218402"
      }
    ];

    localStorage.setItem(this.storageKey, JSON.stringify(initialOrders));
    return initialOrders;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    this.updateBadges();
    this.render();
  }

  getOrders() {
    return this.orders;
  }

  addOrder(orderData) {
    if (!orderData.trackingCode) {
      const code = "BLX-" + Math.floor(10000000 + Math.random() * 90000000);
      orderData.trackingCode = code;
      orderData.trackingUrl = `https://www.bluex.cl/seguimiento?n=${code}`;
    }
    this.orders.unshift(orderData);
    this.save();
    if (this.isAdminAuthenticated()) {
      this.showSaleNotification(orderData);
    }
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (!order.trackingCode) {
        const code = "BLX-" + Math.floor(10000000 + Math.random() * 90000000);
        order.trackingCode = code;
        order.trackingUrl = `https://www.bluex.cl/seguimiento?n=${code}`;
      }
      this.save();

      let toastMsg = `Estado del pedido ${orderId}: ${newStatus}`;
      if (newStatus.includes("Entregado")) {
        toastMsg = `✓ Pedido ${orderId} entregado con éxito. Se archivó en la pestaña 'Entregados'.`;
      }
      if (window.CartManager) {
        window.CartManager.showToast(toastMsg);
      }
    }
  }

  dispatchOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    if (!order.trackingCode) {
      order.trackingCode = "BLX-" + Math.floor(10000000 + Math.random() * 90000000);
      order.trackingUrl = `https://www.bluex.cl/seguimiento?n=${order.trackingCode}`;
    }
    order.status = "Despachado (Blue Express)";
    this.save();
    this.trackBlueExpress(order.trackingCode, order.id);
  }

  updateBadges() {
    const count = this.orders.length;
    const badge = document.getElementById("orders-count-badge");
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
  }

  showSaleNotification(order) {
    const notif = document.createElement("div");
    notif.className = "sale-live-popup animate-slide-up";
    notif.innerHTML = `
      <div class="sale-popup-icon">💰</div>
      <div class="sale-popup-content">
        <span class="sale-popup-tag">¡NUEVA VENTA WEBPAY PLUS CONFIRMADA!</span>
        <h4 class="sale-popup-title">${order.id} • ${formatCLP(order.total)}</h4>
        <p class="sale-popup-meta">${order.customer.name} (${order.customer.commune})</p>
      </div>
      <button class="sale-popup-btn" onclick="window.OrdersApp.openModal(); this.parentElement.remove();">Ver Pedido</button>
    `;

    document.body.appendChild(notif);

    this.playSuccessChime();

    setTimeout(() => {
      notif.classList.add("fade-out");
      setTimeout(() => notif.remove(), 400);
    }, 6000);
  }

  playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.50, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Silencioso si el navegador restringe audio
    }
  }

  initDOM() {
    if (document.getElementById("orders-modal")) return;

    const modalHTML = `
      <div id="orders-modal" class="orders-modal" aria-hidden="true">
        <div class="orders-modal-backdrop" onclick="window.OrdersApp.closeModal()"></div>
        <div class="orders-modal-card">
          <!-- Cabecera del Panel (Fija) -->
          <div class="orders-panel-header">
            <div class="orders-brand">
              <span class="brand-crest">⚜</span>
              <div>
                <h3 class="orders-panel-title">Panel de Control de Pedidos & Ventas</h3>
                <p class="orders-panel-sub">Registro en tiempo real de transacciones Webpay Plus y despachos refrigerados</p>
              </div>
            </div>
            <div class="orders-header-actions">
              <div class="admin-badge-indicator" title="Sesión activa con privilegios de gestión total">
                <span class="admin-live-dot"></span>
                <span>Master Affineur</span>
              </div>
              <button class="btn-simulate-sale" onclick="window.OrdersApp.createTestOrder()" title="Simular una nueva compra en vivo">
                <span>+ Simular Venta</span>
              </button>
              <button class="btn-export-orders" onclick="window.OrdersApp.exportCSV()" title="Descargar registro en CSV">
                <span>📥 Exportar CSV</span>
              </button>
              <button class="btn-admin-logout" onclick="window.OrdersApp.adminLogout()" title="Cerrar sesión de administrador">
                <span>🔒 Salir</span>
              </button>
              <button class="orders-close-btn" onclick="window.OrdersApp.closeModal()">×</button>
            </div>
          </div>

          <!-- Métricas Resumen de Gestión -->
          <div class="orders-metrics-row">
            <div class="metric-card">
              <span class="m-label">Ingresos Totales (Ventas Webpay)</span>
              <strong id="metric-total-sales" class="m-val gold-text">$0 CLP</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Total Pedidos Registrados</span>
              <strong id="metric-orders-count" class="m-val">0</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Por Despachar (En Cava)</span>
              <strong id="metric-pending-count" class="m-val text-amber">0</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Despachados (En Tránsito)</span>
              <strong id="metric-dispatched-count" class="m-val text-blue">0</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Entregados al Cliente</span>
              <strong id="metric-delivered-count" class="m-val text-green">0</strong>
            </div>
          </div>

          <!-- Pestañas de Filtro -->
          <div class="orders-filter-tabs">
            <button class="order-tab active" data-filter="todos" onclick="window.OrdersApp.setFilter('todos', this)" title="Pedidos activos pendientes de entrega">Todos / Activos (<span id="tab-count-todos">0</span>)</button>
            <button class="order-tab" data-filter="preparacion" onclick="window.OrdersApp.setFilter('preparacion', this)" title="Pedidos en preparación en cava fría">Por Despachar (<span id="tab-count-prep">0</span>)</button>
            <button class="order-tab" data-filter="despachado" onclick="window.OrdersApp.setFilter('despachado', this)" title="Pedidos con guía Blue Express en tránsito">Despachados (<span id="tab-count-disp">0</span>)</button>
            <button class="order-tab tab-delivered" data-filter="entregado" onclick="window.OrdersApp.setFilter('entregado', this)" title="Pedidos entregados exitosamente al cliente">✅ Entregados (<span id="tab-count-deliv">0</span>)</button>
            <button class="order-tab tab-history" data-filter="historico" onclick="window.OrdersApp.setFilter('historico', this)" title="Historial completo de todas las compras">Historial Total (<span id="tab-count-hist">0</span>)</button>
          </div>

          <!-- Contenedor Scrollable de la Lista (Con padding holgado para evitar que se tape) -->
          <div class="orders-scroll-wrapper">
            <div id="orders-list-body" class="orders-list-body">
              <!-- Inyectado dinámicamente -->
            </div>
          </div>

          <!-- Pie del Panel (Completamente Despejado y Sin Tapar el Último Pedido) -->
          <div class="orders-panel-footer">
            <div class="orders-footer-note">
              <span>🔒 Sistema sincronizado con pasarela oficial Webpay Plus (Transbank). Datos persistidos localmente.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  /* MODAL DE SEGUIMIENTO EN VIVO BLUE EXPRESS */
  initTrackingModal() {
    if (document.getElementById("bluex-tracking-modal")) return;

    const trackingHTML = `
      <div id="bluex-tracking-modal" class="bluex-modal" aria-hidden="true">
        <div class="bluex-backdrop" onclick="window.OrdersApp.closeTrackingModal()"></div>
        <div class="bluex-card">
          <div class="bluex-header">
            <div class="bluex-logo-wrap">
              <span class="bluex-logo-brand">Blue Express</span>
              <span class="bluex-logo-tag">Priority Frío 4°C</span>
            </div>
            <button class="bluex-close-btn" onclick="window.OrdersApp.closeTrackingModal()">×</button>
          </div>

          <div id="bluex-body" class="bluex-body">
            <!-- Rellenado dinámicamente -->
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", trackingHTML);
  }

  trackBlueExpress(trackingCode, orderId) {
    const order = this.orders.find(o => o.id === orderId) || this.orders[0];
    const bodyEl = document.getElementById("bluex-body");
    const modalEl = document.getElementById("bluex-tracking-modal");
    if (!bodyEl || !modalEl) return;

    const isDelivered = order.status && order.status.includes("Entregado");
    const isDispatched = order.status && order.status.includes("Despachado");

    const statusBadgeText = isDelivered 
      ? "● Entregado al Cliente (Recepción Conforme)" 
      : (isDispatched ? "● En Tránsito Refrigerado" : "🟡 En Preparación en Cava Fría");

    bodyEl.innerHTML = `
      <div class="tracking-summary-strip">
        <div class="t-col">
          <span class="t-sub">Número de Envío (Guía):</span>
          <strong class="t-main">${trackingCode || 'BLX-88492019'}</strong>
        </div>
        <div class="t-col">
          <span class="t-sub">Estado Actual:</span>
          <strong class="t-status ${isDelivered ? 'text-green' : (isDispatched ? 'text-blue' : 'text-amber')}">${statusBadgeText}</strong>
        </div>
      </div>

      <div class="tracking-cold-badge">
        <span>${isDelivered ? '✓ Protocolo Térmico 4°C Cumplido Sin Quiebres de Temperatura' : '❄️ Carga Termocontrolada: Temperatura Cava 4.1°C • Empaque Isotérmico Sellado'}</span>
      </div>

      <!-- Barra de Progreso de 4 Etapas -->
      <div class="tracking-stepper">
        <div class="step completed">
          <div class="step-dot">✓</div>
          <span class="step-title">Pago Aprobado</span>
          <span class="step-desc">Webpay Transbank</span>
        </div>
        <div class="step ${isDispatched || isDelivered ? 'completed' : 'active'}">
          <div class="step-dot">${isDispatched || isDelivered ? '✓' : '●'}</div>
          <span class="step-title">Empacado en Cava</span>
          <span class="step-desc">Isotérmico con Gel 4°C</span>
        </div>
        <div class="step ${isDelivered ? 'completed' : (isDispatched ? 'active' : '')}">
          <div class="step-dot">${isDelivered ? '✓' : (isDispatched ? '●' : '○')}</div>
          <span class="step-title">En Móvil Frío</span>
          <span class="step-desc">Priority Blue Express</span>
        </div>
        <div class="step ${isDelivered ? 'completed active' : ''}">
          <div class="step-dot">${isDelivered ? '✓' : '○'}</div>
          <span class="step-title">Entregado</span>
          <span class="step-desc">${isDelivered ? 'Recepción Conforme' : 'Reparto en Domicilio'}</span>
        </div>
      </div>

      <!-- Datos de Destino -->
      <div class="tracking-details-box">
        <div class="t-detail-row">
          <span>Destinatario:</span>
          <strong>${order.customer.name}</strong>
        </div>
        <div class="t-detail-row">
          <span>Dirección de Entrega:</span>
          <strong>${order.customer.address}, ${order.customer.commune}</strong>
        </div>
        <div class="t-detail-row">
          <span>Courier Oficial:</span>
          <strong>Blue Express Chile (Flota Refrigerada Priority)</strong>
        </div>
        <div class="t-detail-row">
          <span>Fecha Estimada:</span>
          <strong class="text-green">Mañana antes de las 18:00 hrs</strong>
        </div>
      </div>

      <div class="tracking-actions-row">
        <button class="btn-copy-tracking" onclick="navigator.clipboard.writeText('https://www.bluex.cl/seguimiento?n=${trackingCode}'); alert('Enlace de seguimiento de Blue Express copiado al portapapeles para enviar al cliente.');">
          <span>🔗 Copiar Enlace para el Cliente</span>
        </button>
        <button class="btn-close-tracking" onclick="window.OrdersApp.closeTrackingModal()">
          <span>Cerrar</span>
        </button>
      </div>
    `;

    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
  }

  closeTrackingModal() {
    const modalEl = document.getElementById("bluex-tracking-modal");
    if (modalEl) {
      modalEl.classList.remove("open");
      modalEl.setAttribute("aria-hidden", "true");
    }
  }

  /* MODAL DE COMPROBANTE TRIBUTARIO / BOLETA DE VENTA */
  initReceiptModal() {
    if (document.getElementById("receipt-modal")) return;

    const receiptHTML = `
      <div id="receipt-modal" class="receipt-modal" aria-hidden="true">
        <div class="receipt-backdrop" onclick="window.OrdersApp.closeReceiptModal()"></div>
        <div class="receipt-card">
          <button class="receipt-close-btn" onclick="window.OrdersApp.closeReceiptModal()">×</button>
          <div id="receipt-content" class="receipt-content">
            <!-- Rellenado dinámicamente -->
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", receiptHTML);
  }

  viewSalesReceipt(orderId) {
    const order = this.orders.find(o => o.id === orderId) || this.orders[0];
    const contentEl = document.getElementById("receipt-content");
    const modalEl = document.getElementById("receipt-modal");
    if (!contentEl || !modalEl) return;

    const netAmount = Math.round(order.total / 1.19);
    const ivaAmount = order.total - netAmount;

    contentEl.innerHTML = `
      <div class="receipt-paper">
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
          <div><span>DIRECCIÓN:</span> <strong>${order.customer.address.toUpperCase()}, ${order.customer.commune.toUpperCase()}</strong></div>
          <div><span>FECHA EMISIÓN:</span> <strong>${order.date}</strong></div>
          <div><span>PAGO:</span> <strong>${order.paymentMethod.toUpperCase()}</strong> (TRANSBANK AUTH: ${order.authCode})</div>
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
          <div class="r-total-highlight"><span>TOTAL PAGADO:</span> <strong>${formatCLP(order.total)}</strong></div>
        </div>

        <div class="receipt-cold-chain-stamp">
          <span>❄️ CERTIFICADO DE CADENA DE FRÍO 4°C: Lote despachado bajo protocolo isotérmico con gel refrigerante.</span>
        </div>

        <div class="receipt-actions-row">
          <button class="btn-print-receipt" onclick="window.print()">
            <span>🖨️ Imprimir Boleta</span>
          </button>
          <button class="btn-close-receipt" onclick="window.OrdersApp.closeReceiptModal()">
            <span>Volver al Panel</span>
          </button>
        </div>
      </div>
    `;

    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
  }

  closeReceiptModal() {
    const modalEl = document.getElementById("receipt-modal");
    if (modalEl) {
      modalEl.classList.remove("open");
      modalEl.setAttribute("aria-hidden", "true");
    }
  }

  setFilter(filter, btn) {
    this.currentFilter = filter;
    document.querySelectorAll(".order-tab").forEach(t => t.classList.remove("active"));
    if (btn) btn.classList.add("active");
    this.render();
  }

  openModal() {
    const modal = document.getElementById("orders-modal");
    if (!modal) return;
    this.render();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("orders-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  createTestOrder() {
    const randomCheese = CHEESE_PRODUCTS[Math.floor(Math.random() * CHEESE_PRODUCTS.length)];
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = "BLX-" + Math.floor(10000000 + Math.random() * 90000000);

    const testOrder = {
      id: "ORD-" + randomNum,
      authCode: "TBK-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString("es-CL"),
      timestamp: Date.now(),
      customer: {
        name: "Ignacio Silva Prado",
        email: "i.silva@uai.cl",
        phone: "+56 9 8291 0041",
        address: "Av. Presidente Riesco 5711, Piso 14",
        commune: "Las Condes, Región Metropolitana"
      },
      items: [
        {
          name: randomCheese.name,
          weight: randomCheese.weight,
          price: randomCheese.price,
          quantity: 1,
          image: randomCheese.image
        }
      ],
      subtotal: randomCheese.price,
      shipping: randomCheese.price >= 65000 ? 0 : 4990,
      total: randomCheese.price + (randomCheese.price >= 65000 ? 0 : 4990),
      paymentMethod: "Webpay Plus Débito (Banco Santander)",
      bank: "Banco Santander",
      status: "En Cava (Preparación Fría)",
      trackingCode: trackingCode,
      trackingUrl: `https://www.bluex.cl/seguimiento?n=${trackingCode}`
    };

    this.addOrder(testOrder);
  }

  exportCSV() {
    if (this.orders.length === 0) {
      alert("No hay pedidos para exportar.");
      return;
    }

    let csv = "ID_Orden;Fecha;Cliente;Email;Telefono;Comuna;Direccion;Total_CLP;Metodo_Pago;Codigo_Autorizacion;Estado;N_Guia_BlueExpress;Link_Tracking\n";
    this.orders.forEach(o => {
      csv += `"${o.id}";"${o.date}";"${o.customer.name}";"${o.customer.email}";"${o.customer.phone}";"${o.customer.commune}";"${o.customer.address}";"${o.total}";"${o.paymentMethod}";"${o.authCode}";"${o.status}";"${o.trackingCode || ''}";"${o.trackingUrl || ''}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Cava_Noire_Pedidos_${Date.now()}.csv`;
    link.click();
  }

  render() {
    this.updateBadges();

    const listEl = document.getElementById("orders-list-body");
    const totalSalesEl = document.getElementById("metric-total-sales");
    const ordersCountEl = document.getElementById("metric-orders-count");
    const pendingCountEl = document.getElementById("metric-pending-count");
    const dispatchedCountEl = document.getElementById("metric-dispatched-count");
    const deliveredCountEl = document.getElementById("metric-delivered-count");

    if (!listEl) return;

    // Métricas
    const totalSales = this.orders.reduce((sum, o) => sum + o.total, 0);
    const activeOrders = this.orders.filter(o => !o.status.includes("Entregado"));
    const inPrep = this.orders.filter(o => o.status.includes("Cava") || o.status.includes("Preparación"));
    const dispatched = this.orders.filter(o => o.status.includes("Despachado"));
    const delivered = this.orders.filter(o => o.status.includes("Entregado"));

    if (totalSalesEl) totalSalesEl.textContent = formatCLP(totalSales);
    if (ordersCountEl) ordersCountEl.textContent = this.orders.length;
    if (pendingCountEl) pendingCountEl.textContent = inPrep.length;
    if (dispatchedCountEl) dispatchedCountEl.textContent = dispatched.length;
    if (deliveredCountEl) deliveredCountEl.textContent = delivered.length;

    const tabTodosEl = document.getElementById("tab-count-todos");
    const tabPrepEl = document.getElementById("tab-count-prep");
    const tabDispEl = document.getElementById("tab-count-disp");
    const tabDelivEl = document.getElementById("tab-count-deliv");
    const tabHistEl = document.getElementById("tab-count-hist");

    if (tabTodosEl) tabTodosEl.textContent = activeOrders.length;
    if (tabPrepEl) tabPrepEl.textContent = inPrep.length;
    if (tabDispEl) tabDispEl.textContent = dispatched.length;
    if (tabDelivEl) tabDelivEl.textContent = delivered.length;
    if (tabHistEl) tabHistEl.textContent = this.orders.length;

    let filtered = activeOrders;
    if (this.currentFilter === "preparacion") {
      filtered = inPrep;
    } else if (this.currentFilter === "despachado") {
      filtered = dispatched;
    } else if (this.currentFilter === "entregado") {
      filtered = delivered;
    } else if (this.currentFilter === "historico") {
      filtered = this.orders;
    }

    if (filtered.length === 0) {
      let emptyTitle = "No hay pedidos en esta categoría";
      let emptyMsg = "Los pedidos realizados a través de la web o el Chatbot Sommelier aparecerán aquí automáticamente.";
      if (this.currentFilter === "entregado") {
        emptyTitle = "Sin entregas completadas en este filtro";
        emptyMsg = "Cuando un pedido finalice su despacho, cámbielo a 'Entregado al Cliente' para que se archive ordenadamente en esta sección.";
      } else if (this.currentFilter === "todos") {
        emptyTitle = "¡Cava al día! No hay pedidos activos pendientes";
        emptyMsg = "Todos los pedidos han sido entregados al cliente. Puede revisar el archivo histórico en la pestaña 'Entregados' o 'Historial Total'.";
      }

      listEl.innerHTML = `
        <div class="empty-orders-view">
          <span class="e-icon">📦</span>
          <h4>${emptyTitle}</h4>
          <p>${emptyMsg}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(order => {
      const isDelivered = order.status && order.status.includes("Entregado");
      const isDispatched = order.status && order.status.includes("Despachado");
      const statusClass = isDelivered ? "status-delivered" : (isDispatched ? "status-sent" : "status-prep");

      return `
      <div class="order-card-row ${isDelivered ? 'order-card-delivered' : ''}">
        <!-- Columna 1: Meta y Cliente -->
        <div class="order-col-meta">
          <div class="order-id-badge ${isDelivered ? 'badge-delivered' : ''}">
            <span class="o-dot ${isDelivered ? 'dot-delivered' : ''}"></span>
            <strong>${order.id}</strong>
          </div>
          <span class="order-date">${order.date}</span>
          <div class="order-customer">
            <span class="cust-name">${order.customer.name}</span>
            <span class="cust-address">${order.customer.address}, ${order.customer.commune}</span>
            <span class="cust-contact">📞 ${order.customer.phone} • ✉️ ${order.customer.email}</span>
          </div>
        </div>

        <!-- Columna 2: Productos -->
        <div class="order-col-items">
          <span class="items-header-label">Afinaciones (${order.items.length})</span>
          <div class="order-items-mini-list">
            ${order.items.map(it => `
              <div class="order-mini-item">
                <img src="${it.image}" alt="${it.name}">
                <div class="mini-meta">
                  <span class="m-name">${it.name}</span>
                  <span class="m-qty">Cant: ${it.quantity} • ${it.weight || ''} • ${formatCLP(it.price * it.quantity)}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Columna 3: Pago y Webpay -->
        <div class="order-col-payment">
          <div class="tbk-paid-tag">
            <span class="shield">🛡️</span>
            <span>Webpay Plus Aprobado</span>
          </div>
          <div class="payment-specs">
            <span>Auth: <strong>${order.authCode}</strong></span>
            <span>Medio: ${order.paymentMethod}</span>
            ${order.trackingCode ? `<span class="tracking">Guía Blue Express: <strong>${order.trackingCode}</strong></span>` : ''}
          </div>
          <div class="order-total-price">
            ${formatCLP(order.total)}
          </div>
        </div>

        <!-- Columna 4: Estado y Acciones Rápidas -->
        <div class="order-col-status">
          <label class="status-label">Estado Logístico:</label>
          <select 
            class="status-select ${statusClass}" 
            onchange="window.OrdersApp.updateOrderStatus('${order.id}', this.value)"
          >
            <option value="En Cava (Preparación Fría)" ${order.status.includes('Cava') ? 'selected' : ''}>🟡 En Cava (Preparación Fría)</option>
            <option value="Despachado (Blue Express)" ${isDispatched ? 'selected' : ''}>🚚 Despachado (Blue Express Frío)</option>
            <option value="Entregado al Cliente" ${isDelivered ? 'selected' : ''}>✅ Entregado al Cliente</option>
          </select>

          <div class="order-row-action-btns">
            <!-- Botón de Tracking Blue Express -->
            <button 
              class="btn-order-action btn-bluex-track" 
              onclick="window.OrdersApp.trackBlueExpress('${order.trackingCode}', '${order.id}')"
              title="Ver seguimiento en vivo de Blue Express"
            >
              <span>🚚 Seguimiento Blue Express</span>
            </button>

            <!-- Botón de Boleta / Comprobante -->
            <button 
              class="btn-order-action btn-view-receipt" 
              onclick="window.OrdersApp.viewSalesReceipt('${order.id}')"
              title="Ver Boleta Electrónica y Detalle Tributario"
            >
              <span>🧾 Ver Boleta / Factura</span>
            </button>
          </div>
        </div>
      </div>
    `}).join("");
  }
}

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
  window.OrdersApp = new OrdersManager();
});
