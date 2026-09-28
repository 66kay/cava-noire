/**
 * LA CAVA NOIRE // Módulo de Gestión de Pedidos & Registro de Ventas Webpay
 * Almacena las compras, emite notificaciones y muestra el panel de administración de órdenes.
 */

class OrdersManager {
  constructor() {
    this.storageKey = "cava_noire_orders";
    this.orders = this.loadOrders();
    this.currentFilter = "todos";

    this.initDOM();
    this.updateBadges();
  }

  loadOrders() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
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
            image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&auto=format&fit=crop&q=80"
          },
          {
            name: "Pecorino al Tartufo Nero Riserva",
            weight: "220g",
            price: 34990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80"
          }
        ],
        subtotal: 64980,
        shipping: 0,
        total: 64980,
        paymentMethod: "Webpay Plus Débito (Banco de Chile)",
        bank: "Banco de Chile",
        status: "En Cava (Preparación Fría)",
        trackingCode: "BLX-88492019"
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
            weight: "1.250g con maridajes",
            price: 89990,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=80"
          }
        ],
        subtotal: 89990,
        shipping: 0,
        total: 89990,
        paymentMethod: "Webpay Plus Crédito (Santander)",
        bank: "Banco Santander",
        status: "Despachado (Blue Express)",
        trackingCode: "BLX-91402841"
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
    this.orders.unshift(orderData);
    this.save();
    this.showSaleNotification(orderData);
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.save();
      if (window.CartManager) {
        window.CartManager.showToast(`Estado de la orden ${orderId} actualizado: ${newStatus}`);
      }
    }
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
        <span class="sale-popup-tag">¡NUEVA VENTA WEBPAY PLUS!</span>
        <h4 class="sale-popup-title">${order.id} • ${formatCLP(order.total)}</h4>
        <p class="sale-popup-meta">${order.customer.name} (${order.customer.commune})</p>
      </div>
      <button class="sale-popup-btn" onclick="window.OrdersApp.openModal(); this.parentElement.remove();">Ver Pedido</button>
    `;

    document.body.appendChild(notif);

    // Sonido sutil de campana de caja/cristal
    if (window.PairingApp && window.PairingApp.playCrystalClink) {
      window.PairingApp.playCrystalClink();
    }

    setTimeout(() => {
      notif.classList.add("fade-out");
      setTimeout(() => notif.remove(), 400);
    }, 6000);
  }

  initDOM() {
    if (document.getElementById("orders-modal")) return;

    const modalHTML = `
      <div id="orders-modal" class="orders-modal" aria-hidden="true">
        <div class="orders-modal-backdrop" onclick="window.OrdersApp.closeModal()"></div>
        <div class="orders-modal-card">
          <!-- Cabecera del Panel -->
          <div class="orders-panel-header">
            <div class="orders-brand">
              <span class="brand-crest">⚜</span>
              <div>
                <h3 class="orders-panel-title">Panel de Control de Pedidos & Ventas</h3>
                <p class="orders-panel-sub">Registro en tiempo real de transacciones Webpay Plus y despachos refrigerados</p>
              </div>
            </div>
            <div class="orders-header-actions">
              <button class="btn-simulate-sale" onclick="window.OrdersApp.createTestOrder()" title="Simular una nueva compra en vivo">
                <span>+ Simular Nueva Venta</span>
              </button>
              <button class="btn-export-orders" onclick="window.OrdersApp.exportCSV()" title="Descargar registro en CSV">
                <span>📥 Exportar CSV</span>
              </button>
              <button class="orders-close-btn" onclick="window.OrdersApp.closeModal()">×</button>
            </div>
          </div>

          <!-- Métricas Resumen -->
          <div class="orders-metrics-row">
            <div class="metric-card">
              <span class="m-label">Ventas Totales Registradas</span>
              <strong id="metric-total-sales" class="m-val gold-text">$0 CLP</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Total de Pedidos</span>
              <strong id="metric-orders-count" class="m-val">0</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">En Preparación Fría</span>
              <strong id="metric-pending-count" class="m-val text-amber">0</strong>
            </div>
            <div class="metric-card">
              <span class="m-label">Cadena de Frío Activa</span>
              <strong class="m-val text-green">4.1°C Certificada</strong>
            </div>
          </div>

          <!-- Pestañas de Filtro -->
          <div class="orders-filter-tabs">
            <button class="order-tab active" data-filter="todos" onclick="window.OrdersApp.setFilter('todos', this)">Todos (<span id="tab-count-todos">0</span>)</button>
            <button class="order-tab" data-filter="preparacion" onclick="window.OrdersApp.setFilter('preparacion', this)">En Cava / Frío (<span id="tab-count-prep">0</span>)</button>
            <button class="order-tab" data-filter="despachado" onclick="window.OrdersApp.setFilter('despachado', this)">Despachados (<span id="tab-count-disp">0</span>)</button>
          </div>

          <!-- Contenedor de la Lista de Órdenes -->
          <div id="orders-list-body" class="orders-list-body">
            <!-- Inyectado dinámicamente -->
          </div>

          <!-- Pie del Panel -->
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
      trackingCode: "BLX-" + Math.floor(10000000 + Math.random() * 90000000)
    };

    this.addOrder(testOrder);
  }

  exportCSV() {
    if (this.orders.length === 0) {
      alert("No hay pedidos para exportar.");
      return;
    }

    let csv = "ID_Orden;Fecha;Cliente;Email;Telefono;Comuna;Direccion;Total_CLP;Metodo_Pago;Codigo_Autorizacion;Estado;N_Seguimiento\n";
    this.orders.forEach(o => {
      csv += `"${o.id}";"${o.date}";"${o.customer.name}";"${o.customer.email}";"${o.customer.phone}";"${o.customer.commune}";"${o.customer.address}";"${o.total}";"${o.paymentMethod}";"${o.authCode}";"${o.status}";"${o.trackingCode || ''}"\n`;
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

    if (!listEl) return;

    // Métricas
    const totalSales = this.orders.reduce((sum, o) => sum + o.total, 0);
    const inPrep = this.orders.filter(o => o.status.includes("Cava") || o.status.includes("Preparación")).length;
    const dispatched = this.orders.filter(o => o.status.includes("Despachado")).length;

    if (totalSalesEl) totalSalesEl.textContent = formatCLP(totalSales);
    if (ordersCountEl) ordersCountEl.textContent = this.orders.length;
    if (pendingCountEl) pendingCountEl.textContent = inPrep;

    document.getElementById("tab-count-todos").textContent = this.orders.length;
    document.getElementById("tab-count-prep").textContent = inPrep;
    document.getElementById("tab-count-disp").textContent = dispatched;

    let filtered = this.orders;
    if (this.currentFilter === "preparacion") {
      filtered = this.orders.filter(o => o.status.includes("Cava") || o.status.includes("Preparación"));
    } else if (this.currentFilter === "despachado") {
      filtered = this.orders.filter(o => o.status.includes("Despachado"));
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-orders-view">
          <span class="e-icon">📦</span>
          <h4>No hay pedidos en esta categoría</h4>
          <p>Los pedidos realizados a través de la web o el Chatbot Sommelier aparecerán aquí automáticamente.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(order => `
      <div class="order-card-row">
        <!-- Columna 1: Meta y Cliente -->
        <div class="order-col-meta">
          <div class="order-id-badge">
            <span class="o-dot"></span>
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
          <span class="items-header-label">Afinaciones Seleccionadas (${order.items.length})</span>
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
            ${order.trackingCode ? `<span class="tracking">Guía: <strong>${order.trackingCode}</strong></span>` : ''}
          </div>
          <div class="order-total-price">
            ${formatCLP(order.total)}
          </div>
        </div>

        <!-- Columna 4: Estado y Acciones -->
        <div class="order-col-status">
          <label class="status-label">Estado de la Orden:</label>
          <select 
            class="status-select ${order.status.includes('Despachado') ? 'status-sent' : 'status-prep'}" 
            onchange="window.OrdersApp.updateOrderStatus('${order.id}', this.value)"
          >
            <option value="En Cava (Preparación Fría)" ${order.status.includes('Cava') ? 'selected' : ''}>🟡 En Cava (Preparación Fría)</option>
            <option value="Despachado (Blue Express)" ${order.status.includes('Despachado') ? 'selected' : ''}>🚚 Despachado (Blue Express Frío)</option>
            <option value="Entregado al Cliente" ${order.status.includes('Entregado') ? 'selected' : ''}>✅ Entregado al Cliente</option>
          </select>
        </div>
      </div>
    `).join("");
  }
}

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
  window.OrdersApp = new OrdersManager();
});
