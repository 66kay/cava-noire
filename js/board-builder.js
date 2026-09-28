/**
 * LA CAVA NOIRE // Atelier de la Tabla de Degustación
 * Diseñador interactivo sobre pizarra negra y madera noble con cálculo en tiempo real.
 */

class BoardBuilder {
  constructor() {
    this.boardType = "pizarra-negra";
    this.guests = 4;
    this.selectedCheeses = ["comte-36m", "brillat-savarin-creme", "pecorino-tartufo"];
    this.selectedExtras = ["crackers-romero-artesanal"];

    this.boardPricing = {
      "pizarra-negra": { name: "Pizarra Negra Natural de Cantera", price: 14990, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=450&auto=format&fit=crop&q=72" },
      "madera-nogal": { name: "Madera de Nogal Noble Curada", price: 19990, image: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=450&auto=format&fit=crop&q=72" },
      "marmol-marquina": { name: "Mármol Nero Marquina Pulido", price: 29990, image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=450&auto=format&fit=crop&q=72" }
    };

    this.initDOM();
  }

  initDOM() {
    const mount = document.getElementById("board-builder-mount");
    if (!mount) return;
    this.render();
  }

  setBoardType(type) {
    this.boardType = type;
    this.render();
  }

  setGuests(count) {
    this.guests = count;
    this.render();
  }

  toggleCheese(id) {
    if (this.selectedCheeses.includes(id)) {
      if (this.selectedCheeses.length <= 1) {
        alert("Debe mantener al menos 1 queso en su tabla gourmet.");
        return;
      }
      this.selectedCheeses = this.selectedCheeses.filter(c => c !== id);
    } else {
      if (this.selectedCheeses.length >= 6) {
        alert("El límite para esta tabla es de 6 quesos de autor simultáneos.");
        return;
      }
      this.selectedCheeses.push(id);
    }
    this.render();
  }

  toggleExtra(id) {
    if (this.selectedExtras.includes(id)) {
      this.selectedExtras = this.selectedExtras.filter(e => e !== id);
    } else {
      this.selectedExtras.push(id);
    }
    this.render();
  }

  calculateTotal() {
    let total = this.boardPricing[this.boardType].price;

    this.selectedCheeses.forEach(cId => {
      const cheese = CHEESE_PRODUCTS.find(p => p.id === cId);
      if (cheese) total += cheese.price;
    });

    this.selectedExtras.forEach(eId => {
      const extra = DELICATESSEN_ITEMS.find(d => d.id === eId);
      if (extra) total += extra.price;
    });

    return total;
  }

  calculateEstimatedWeight() {
    let grams = 0;
    this.selectedCheeses.forEach(cId => {
      const c = CHEESE_PRODUCTS.find(p => p.id === cId);
      if (c) {
        const match = c.weight.match(/(\d+)g/);
        if (match) grams += parseInt(match[1], 10);
      }
    });
    return grams;
  }

  addCustomBoardToCart() {
    const total = this.calculateTotal();
    const boardMeta = this.boardPricing[this.boardType];
    const cheeseNames = this.selectedCheeses.map(id => {
      const c = CHEESE_PRODUCTS.find(p => p.id === id);
      return c ? c.name : id;
    }).join(", ");

    const customItem = {
      id: "tabla-custom-" + Date.now(),
      name: `Tabla Personalizada: ${boardMeta.name}`,
      subtitle: `Para ${this.guests} personas • ${this.selectedCheeses.length} quesos de autor`,
      origin: "Composición Exclusiva de Autor",
      category: "tablas-degustacion",
      price: total,
      weight: `${this.calculateEstimatedWeight()}g de afinaciones`,
      image: boardMeta.image,
      quantity: 1,
      customDetails: cheeseNames
    };

    if (window.CartManager) {
      window.CartManager.addItem(customItem);
      window.CartManager.openDrawer();
    }
  }

  render() {
    const mount = document.getElementById("board-builder-mount");
    if (!mount) return;

    const total = this.calculateTotal();
    const totalGrams = this.calculateEstimatedWeight();
    const gramsPerGuest = Math.round(totalGrams / this.guests);

    mount.innerHTML = `
      <div class="board-builder-card">
        <!-- Visualizador Interactivo de Pizarra Negra -->
        <div class="builder-preview-stage ${this.boardType}">
          <div class="stage-overlay"></div>
          
          <div class="stage-header">
            <span class="preview-badge">VISTA PREVIA DE PIZARRA GOURMET</span>
            <div class="portion-gauge">
              <span>${totalGrams}g Totales (~${gramsPerGuest}g / comensal)</span>
            </div>
          </div>

          <div class="slate-visual-canvas">
            <div class="slate-inner-ring">
              <div class="slate-cheeses-cluster">
                ${this.selectedCheeses.map((cId, idx) => {
                  const c = CHEESE_PRODUCTS.find(p => p.id === cId);
                  if (!c) return "";
                  return `
                    <div class="slate-item-chip animate-scale-in" style="animation-delay: ${idx * 0.08}s">
                      <img src="${c.image}" alt="${c.name}">
                      <div class="chip-info">
                        <span class="chip-name">${c.name.split('(')[0]}</span>
                        <span class="chip-weight">${c.weight}</span>
                      </div>
                      <button class="chip-remove" onclick="window.BoardApp.toggleCheese('${c.id}')" title="Quitar">×</button>
                    </div>
                  `;
                }).join("")}

                ${this.selectedExtras.map(eId => {
                  const ext = DELICATESSEN_ITEMS.find(d => d.id === eId);
                  if (!ext) return "";
                  return `
                    <div class="slate-extra-chip">
                      <span>✨ ${ext.name.split('(')[0]}</span>
                      <button class="chip-remove" onclick="window.BoardApp.toggleExtra('${ext.id}')">×</button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <div class="stage-footer">
            <div class="cold-seal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>Despachado en caja de conservación térmica con geles eutécticos a 4°C</span>
            </div>
          </div>
        </div>

        <!-- Panel de Configuración -->
        <div class="builder-controls-panel">
          <!-- 1. Base de Presentación -->
          <div class="control-group">
            <label class="control-title">1. Base de Servicio y Presentación</label>
            <div class="options-pills">
              ${Object.keys(this.boardPricing).map(typeKey => `
                <button 
                  class="option-pill ${this.boardType === typeKey ? 'active' : ''}" 
                  onclick="window.BoardApp.setBoardType('${typeKey}')"
                >
                  <span class="pill-name">${this.boardPricing[typeKey].name}</span>
                  <span class="pill-price">+${formatCLP(this.boardPricing[typeKey].price)}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <!-- 2. Número de Comensales -->
          <div class="control-group">
            <label class="control-title">2. Cantidad de Invitados</label>
            <div class="guests-selector">
              <button class="guest-btn ${this.guests === 2 ? 'active' : ''}" onclick="window.BoardApp.setGuests(2)">2 Comensales (Íntima)</button>
              <button class="guest-btn ${this.guests === 4 ? 'active' : ''}" onclick="window.BoardApp.setGuests(4)">4 Comensales (Gourmet)</button>
              <button class="guest-btn ${this.guests === 6 ? 'active' : ''}" onclick="window.BoardApp.setGuests(6)">6 Comensales (Cata)</button>
              <button class="guest-btn ${this.guests === 8 ? 'active' : ''}" onclick="window.BoardApp.setGuests(8)">8+ Comensales (Recepción)</button>
            </div>
          </div>

          <!-- 3. Selección de Quesos -->
          <div class="control-group">
            <div class="control-title-row">
              <label class="control-title">3. Selecciona tus Quesos de Autor (${this.selectedCheeses.length}/6)</label>
              <span class="selection-hint">Mínimo 1, máximo 6</span>
            </div>
            <div class="cheeses-toggle-list">
              ${CHEESE_PRODUCTS.filter(p => p.category !== "tablas-degustacion").map(cheese => {
                const isSelected = this.selectedCheeses.includes(cheese.id);
                return `
                  <div 
                    class="cheese-toggle-card ${isSelected ? 'selected' : ''}" 
                    onclick="window.BoardApp.toggleCheese('${cheese.id}')"
                  >
                    <div class="toggle-indicator">${isSelected ? '✓' : '+'}</div>
                    <div class="toggle-text">
                      <span class="t-name">${cheese.name}</span>
                      <span class="t-meta">${cheese.aging} • ${cheese.origin} • ${cheese.weight}</span>
                    </div>
                    <div class="toggle-price">${formatCLP(cheese.price)}</div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- 4. Acompañamientos Delicatessen -->
          <div class="control-group">
            <label class="control-title">4. Delicatessen y Maridaje Complementario</label>
            <div class="extras-grid">
              ${DELICATESSEN_ITEMS.map(extra => {
                const isSel = this.selectedExtras.includes(extra.id);
                return `
                  <div 
                    class="extra-card ${isSel ? 'selected' : ''}" 
                    onclick="window.BoardApp.toggleExtra('${extra.id}')"
                  >
                    <div class="extra-check">${isSel ? '✓' : '+'}</div>
                    <div class="extra-desc">
                      <span class="ext-name">${extra.name}</span>
                      <span class="ext-price">+${formatCLP(extra.price)}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Resumen y Añadir a la Bolsa -->
          <div class="builder-receipt-box">
            <div class="receipt-summary-line">
              <span>Total Composición Personalizada:</span>
              <span class="receipt-total-clp">${formatCLP(total)}</span>
            </div>
            <div class="shipping-notice">
              ${total >= 65000 
                ? '<span class="free-shipping-tag">✓ ¡Despacho Refrigerado GRATIS a todo Chile!</span>' 
                : '<span>Agrega ' + formatCLP(65000 - total) + ' más para obtener Despacho Refrigerado Gratis.</span>'}
            </div>
            <button class="btn-builder-add" onclick="window.BoardApp.addCustomBoardToCart()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Añadir Tabla de Autor a la Bolsa (${formatCLP(total)})</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.BoardApp = new BoardBuilder();
});
