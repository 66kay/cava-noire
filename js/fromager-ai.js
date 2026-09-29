/**
 * LA CAVA NOIRE // Jean-Pierre - Maître Fromager & Concierge de Cava
 * Asesoría gastronómica especializada 100% en quesos de autor, afinación y checkout Webpay Plus.
 * Exclusivamente quesos y afinaciones artesanales (sin comercialización de vinos).
 */

class FromagerAI {
  constructor() {
    this.botName = "Jean-Pierre";
    this.botTitle = "Maître Fromager & Concierge de Cava";
    this.isOpen = false;
    this.history = [];
    this.isTyping = false;

    this.initDOM();
    this.initEvents();
  }

  initDOM() {
    if (document.getElementById("sommelier-widget")) return;

    const widgetHTML = `
      <div id="sommelier-widget" class="sommelier-widget">
        <!-- Botón flotante disparador -->
        <button id="sommelier-toggle-btn" class="sommelier-toggle-btn" aria-label="Consultar a Jean-Pierre, Maestro Quesero">
          <div class="toggle-pulse"></div>
          <div class="toggle-icon">
            <span style="font-size: 1.35rem; line-height: 1;">🧀</span>
          </div>
          <div class="toggle-badge">
            <span class="badge-dot"></span>
            <span>Maestro Quesero</span>
          </div>
        </button>

        <!-- Ventana de Chat Flotante -->
        <div id="sommelier-window" class="sommelier-window" aria-hidden="true">
          <!-- Header del Asistente Quesero -->
          <div class="sommelier-header">
            <div class="sommelier-avatar">
              <div class="avatar-ring">
                <img src="https://images.unsplash.com/photo-1559561853-08451507cbe7?w=160&auto=format&fit=crop&q=80" alt="Jean-Pierre Maître Fromager">
              </div>
              <span class="status-indicator"></span>
            </div>
            <div class="sommelier-info">
              <h3 class="sommelier-title">${this.botName}</h3>
              <p class="sommelier-subtitle">${this.botTitle}</p>
            </div>
            <div class="sommelier-actions">
              <button id="sommelier-reset-btn" class="header-action-btn" title="Reiniciar consulta">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button id="sommelier-close-btn" class="header-action-btn" title="Cerrar chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Subheader con garantía de despacho y Webpay -->
          <div class="sommelier-ribbon">
            <span>🛡️ Cadena de Frío Certificada (4°C)</span>
            <span class="ribbon-sep">•</span>
            <span>💳 Pago Oficial Webpay Plus</span>
          </div>

          <!-- Contenedor de Mensajes -->
          <div id="sommelier-messages" class="sommelier-messages">
            <!-- Los mensajes se inyectan dinámicamente -->
          </div>

          <!-- Chips de Acciones Rápidas -->
          <div class="sommelier-chips-scroll">
            <div id="sommelier-quick-chips" class="sommelier-quick-chips">
              <button class="chip-btn" data-query="Recomiéndame una tabla gourmet para 4 personas">🧀 Tabla para 4 personas</button>
              <button class="chip-btn" data-query="¿Tienen quesos exclusivos con trufa negra?">✨ Queso Trufado</button>
              <button class="chip-btn" data-query="¿Qué opciones tienen sin lactosa natural?">🥛 Sin Lactosa</button>
              <button class="chip-btn" data-query="¿Cuáles son los quesos más intensos de la cava?">🏔️ Quesos Fuertes</button>
              <button class="chip-btn" data-query="¿Cómo funciona el despacho en frío a 4°C?">❄️ Envío Refrigerado</button>
              <button class="chip-btn chip-highlight" data-query="Quiero proceder con la compra y pagar vía Webpay">💳 Proceder a Pagar con Webpay</button>
            </div>
          </div>

          <!-- Formulario de Entrada de Texto -->
          <form id="sommelier-input-form" class="sommelier-input-form">
            <input 
              type="text" 
              id="sommelier-input" 
              class="sommelier-input" 
              placeholder="Pregúntele a Jean-Pierre sobre quesos, tablas o su pedido..."
              autocomplete="off"
            >
            <button type="submit" id="sommelier-send-btn" class="sommelier-send-btn" aria-label="Enviar pregunta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHTML);
  }

  initEvents() {
    const toggleBtn = document.getElementById("sommelier-toggle-btn");
    const closeBtn = document.getElementById("sommelier-close-btn");
    const resetBtn = document.getElementById("sommelier-reset-btn");
    const form = document.getElementById("sommelier-input-form");
    const input = document.getElementById("sommelier-input");
    const chipsContainer = document.getElementById("sommelier-quick-chips");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeChat());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetConversation());
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || this.isTyping) return;
        input.value = "";
        this.handleUserMessage(text);
      });
    }

    if (chipsContainer) {
      chipsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip-btn");
        if (!btn || this.isTyping) return;
        const query = btn.getAttribute("data-query");
        if (query) {
          this.handleUserMessage(query);
        }
      });
    }

    const messagesContainer = document.getElementById("sommelier-messages");
    if (messagesContainer) {
      messagesContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".inline-action-pill");
        if (pill && !this.isTyping) {
          const query = pill.getAttribute("data-query") || pill.textContent.trim();
          if (query) this.handleUserMessage(query);
          return;
        }

        const addBtn = e.target.closest(".mini-add-btn");
        if (addBtn) {
          const pid = addBtn.getAttribute("data-product-id");
          if (pid && window.CartManager) {
            window.CartManager.addItemById(pid);
          }
          return;
        }
      });
    }

    // Saludo de bienvenida diferido
    setTimeout(() => {
      this.sendInitialGreeting();
    }, 1200);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const win = document.getElementById("sommelier-window");
    const btn = document.getElementById("sommelier-toggle-btn");

    if (this.isOpen) {
      win.classList.add("active");
      win.setAttribute("aria-hidden", "false");
      btn.classList.add("active");
      document.getElementById("sommelier-input")?.focus();
      this.scrollToBottom();
    } else {
      win.classList.remove("active");
      win.setAttribute("aria-hidden", "true");
      btn.classList.remove("active");
    }
  }

  openChat() {
    if (!this.isOpen) this.toggleChat();
  }

  closeChat() {
    if (this.isOpen) this.toggleChat();
  }

  sendInitialGreeting() {
    const greetingText = `
      *Bonjour.* Es un placer recibirle en **La Cava Noire**.
      
      ¿En qué afinación o tabla puedo orientarle hoy? Disponemos de piezas con maduración de hasta 60 meses, quesos trufados, opciones sin lactosa y despacho refrigerado a 4°C a todo Chile.
    `;

    this.addBotMessage(greetingText, [
      { text: "🧀 Tabla para Picoteo", query: "Recomiéndame una tabla gourmet para 4 personas" },
      { text: "✨ Queso Trufado", query: "¿Tienen quesos exclusivos con trufa negra?" },
      { text: "🥛 Sin Lactosa", query: "¿Qué opciones tienen sin lactosa natural?" },
      { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
    ]);
  }

  resetConversation() {
    const container = document.getElementById("sommelier-messages");
    if (container) container.innerHTML = "";
    this.history = [];
    this.sendInitialGreeting();
  }

  addUserMessage(text) {
    const container = document.getElementById("sommelier-messages");
    if (!container) return;

    const msgEl = document.createElement("div");
    msgEl.className = "message user-message animate-fade-in";
    msgEl.innerHTML = `
      <div class="message-bubble user-bubble">
        <p>${this.escapeHTML(text)}</p>
      </div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;
    container.appendChild(msgEl);
    this.scrollToBottom();
  }

  addBotMessage(markdownText, quickActions = [], customCardHTML = "") {
    const container = document.getElementById("sommelier-messages");
    if (!container) return;

    const formattedHTML = this.formatMarkdown(markdownText);
    const msgEl = document.createElement("div");
    msgEl.className = "message bot-message animate-fade-in";

    let actionsHTML = "";
    if (quickActions && quickActions.length > 0) {
      actionsHTML = `
        <div class="bot-inline-actions">
          ${quickActions.map(act => `
            <button class="inline-action-pill" data-query="${this.escapeHTML(act.query)}">
              ${act.text}
            </button>
          `).join("")}
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="bot-message-wrapper">
        <div class="bot-avatar-small">
          <span>🧀</span>
        </div>
        <div class="message-content">
          <div class="message-bubble bot-bubble">
            ${formattedHTML}
            ${customCardHTML}
          </div>
          ${actionsHTML}
          <div class="message-time">${this.getCurrentTime()} • Maestro Quesero</div>
        </div>
      </div>
    `;

    container.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    this.isTyping = true;
    const container = document.getElementById("sommelier-messages");
    if (!container) return;

    const typingEl = document.createElement("div");
    typingEl.id = "sommelier-typing-indicator";
    typingEl.className = "message bot-message typing-indicator-msg";
    typingEl.innerHTML = `
      <div class="bot-message-wrapper">
        <div class="bot-avatar-small">
          <span>🧀</span>
        </div>
        <div class="message-bubble bot-bubble typing-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    `;
    container.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const el = document.getElementById("sommelier-typing-indicator");
    if (el) el.remove();
  }

  scrollToBottom() {
    const container = document.getElementById("sommelier-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  getCurrentTime() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  escapeHTML(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  formatMarkdown(text) {
    let out = text.trim();
    out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*(.*?)\*/g, "<em>$1</em>");
    out = out.replace(/\n\s*\n/g, "</p><p>");
    out = out.replace(/\n/g, "<br>");
    return `<p>${out}</p>`;
  }

  handleUserMessage(query) {
    if (!query || typeof query !== "string" || !query.trim() || this.isTyping) return;
    const cleanQuery = query.trim();
    this.addUserMessage(cleanQuery);
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      this.processQuery(cleanQuery);
    }, 600);
  }

  processQuery(rawQuery) {
    const q = rawQuery.toLowerCase();

    // 0. ACLARACIÓN: VENTA EXCLUSIVA DE QUESOS (NO VENDEMOS VINO NI ALCOHOL)
    if (
      q.includes("vino") || 
      q.includes("vinos") || 
      q.includes("cepa") || 
      q.includes("copa") || 
      q.includes("alcohol") || 
      q.includes("licor") || 
      q.includes("botella")
    ) {
      const reply = `
        En **La Cava Noire** nos dedicamos **exclusivamente a la afinación y venta de quesos artesanales de autor**.
        
        No vendemos vinos ni alcohol. Con gusto le asesoro en nuestras piezas de colección: pastas duras, cremosos, trufados o cofres de cata.
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Ver Cofre Degustación", query: "Háblame del Cofre Degustación Grand Affineur" },
        { text: "✨ Quesos Trufados", query: "¿Tienen quesos exclusivos con trufa negra?" },
        { text: "🧈 Quesos Cremosos", query: "¿Qué queso suave y cremoso tienen?" }
      ]);
      return;
    }

    // 1. INTENCIÓN DE PAGO / CHECKOUT / WEBPAY
    if (
      q.includes("pagar") || 
      q.includes("webpay") || 
      q.includes("checkout") || 
      q.includes("comprar") || 
      q.includes("proceder") || 
      q.includes("finalizar") ||
      q.includes("pedido") ||
      q.includes("transbank")
    ) {
      this.handleCheckoutIntent();
      return;
    }

    // 2. ACCIÓN DE AGREGAR PRODUCTO AL CARRITO DESDE EL CHAT
    if (q.includes("agrega") || q.includes("añadir") || q.includes("añade") || q.includes("sumar") || q.includes("comprar este")) {
      let foundProduct = null;
      if (q.includes("comte") || q.includes("comté")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "comte-36m");
      else if (q.includes("trufa") || q.includes("pecorino")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "pecorino-tartufo");
      else if (q.includes("brillat") || q.includes("savarin")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "brillat-savarin-creme");
      else if (q.includes("parmigiano") || q.includes("parmesano")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "parmigiano-vacche-rosse");
      else if (q.includes("chiloe") || q.includes("chiloé")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "chiloe-oveja-niebla");
      else if (q.includes("roquefort") || q.includes("azul")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "roquefort-societe");
      else if (q.includes("gouda")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "gouda-vintage-5a");
      else if (q.includes("morbier")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "morbier-ceniza-aop");
      else if (q.includes("cofre") || q.includes("tabla")) foundProduct = CHEESE_PRODUCTS.find(p => p.id === "tabla-degustacion-privee");
      else if (q.includes("miel")) foundProduct = DELICATESSEN_ITEMS.find(d => d.id === "miel-trufa-alba");
      else if (q.includes("cracker") || q.includes("galleta")) foundProduct = DELICATESSEN_ITEMS.find(d => d.id === "crackers-romero-artesanal");
      else if (q.includes("cuchillo") || q.includes("laguiole")) foundProduct = DELICATESSEN_ITEMS.find(d => d.id === "cuchillo-laguiole-fromage");

      if (foundProduct) {
        if (window.CartManager) {
          window.CartManager.addItem(foundProduct);
        }
        const reply = `
          *Parfait.* He añadido **${foundProduct.name}** a su bolsa (${formatCLP(foundProduct.price)}).
          
          Se despacha en empaque isotérmico con gel refrigerante a 4°C. ¿Desea sumar otro queso o prefiere pagar directamente?
        `;
        this.addBotMessage(reply, [
          { text: "💳 Proceder al Pago (Webpay)", query: "Quiero proceder con la compra y pagar vía Webpay" },
          { text: "🍯 Ver Acompañamientos", query: "¿Tienen miel con trufa o crackers artesanales?" },
          { text: "🧀 Ver otro queso artesanal", query: "¿Qué queso suave y cremoso tienen?" }
        ]);
        return;
      }
    }

    // 3. QUESO TRUFADO
    if (q.includes("trufa") || q.includes("trufado") || q.includes("tartufo")) {
      const pecorino = CHEESE_PRODUCTS.find(c => c.id === "pecorino-tartufo");
      const miel = DELICATESSEN_ITEMS.find(d => d.id === "miel-trufa-alba");

      const reply = `
        Nuestra joya trufada: **${pecorino.name}** (${formatCLP(pecorino.price)}), afinado 12 meses con auténtica trufa negra toscana (*Tuber melanosporum*), sin esencias sintéticas.
        
        *Sugerencia:* Una cucharadita de **${miel.name}** (${formatCLP(miel.price)}) para un maridaje inolvidable.
      `;

      const card = this.renderProductRecommendationCard([pecorino]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Pecorino al Carrito", query: "Agrega el Pecorino Trufado al carrito" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder a pagar con Webpay" }
      ], card);
      return;
    }

    // 4. ASESORÍA DE TABLA PARA PERSONAS / EVENTOS / PICOTEO
    if (q.includes("tabla") || q.includes("personas") || q.includes("comensales") || q.includes("invitados") || q.includes("cena") || q.includes("picoteo")) {
      const grandAffineur = CHEESE_PRODUCTS.find(c => c.id === "tabla-degustacion-privee");

      const reply = `
        Para picoteos o catas calculamos **100g a 150g por persona**.
        
        Para 4 a 8 personas recomendamos el **${grandAffineur.name}** (${formatCLP(grandAffineur.price)}): 1.250g con 5 quesos AOP selectos en estuche de madera con miel de trufa blanca, nueces y crackers. Listo para servir y disfrutar.
      `;

      const card = this.renderProductRecommendationCard([grandAffineur]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Cofre al Carrito", query: "Agrega el Cofre Grand Affineur al carrito" },
        { text: "💳 Pagar con Webpay", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 5. PREGUNTAS DE INTENSIDAD / FUERTE / SUAVE / CREMOSO
    if (q.includes("fuerte") || q.includes("intenso") || q.includes("potente") || q.includes("azul")) {
      const roquefort = CHEESE_PRODUCTS.find(c => c.id === "roquefort-societe");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");

      const reply = `
        Para amantes de la intensidad pura:
        • **${roquefort.name}** (${formatCLP(roquefort.price)}): Afinado en cuevas francesas, notas salinas nobles y untuosidad única.
        • **${gouda.name}** (${formatCLP(gouda.price)}): 5 años en cava con cristales de tirosina y matices de caramelo tostado.
      `;

      const card = this.renderProductRecommendationCard([roquefort, gouda]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Roquefort ($26.990)", query: "Agrega el Roquefort al carrito" },
        { text: "🛒 Añadir Gouda 5 Años ($33.990)", query: "Agrega el Gouda al carrito" },
        { text: "💳 Pagar con Webpay", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 6. CREMOSOS / SUAVES
    if (q.includes("cremoso") || q.includes("suave") || q.includes("brie") || q.includes("untar")) {
      const brillat = CHEESE_PRODUCTS.find(c => c.id === "brillat-savarin-creme");
      const morbier = CHEESE_PRODUCTS.find(c => c.id === "morbier-ceniza-aop");

      const reply = `
        Para texturas delicadas y fundentes:
        • **${brillat.name}** (${formatCLP(brillat.price)}): Triple crème mantecoso, textura sedosa tipo mousse.
        • **${morbier.name}** (${formatCLP(morbier.price)}): Suave y elástico con su tradicional línea de ceniza vegetal.
      `;

      const card = this.renderProductRecommendationCard([brillat, morbier]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Brillat-Savarin ($24.990)", query: "Agrega el Brillat-Savarin al carrito" },
        { text: "🛒 Añadir Morbier ($22.990)", query: "Agrega el Morbier al carrito" }
      ], card);
      return;
    }

    // 7. SIN LACTOSA
    if (q.includes("lactosa") || q.includes("intolerante") || q.includes("intolerancia")) {
      const comte = CHEESE_PRODUCTS.find(c => c.id === "comte-36m");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");
      const parmigiano = CHEESE_PRODUCTS.find(c => c.id === "parmigiano-vacche-rosse");

      const reply = `
        Los quesos de pasta dura con larga maduración son **naturalmente casi 0% lactosa**, ya que las bacterias lácticas la consumen durante los meses de curación en cava.
        
        Opciones 100% seguras y digestibles: **${comte.name}** (36M), **${parmigiano.name}** (30M) y **${gouda.name}** (5 años).
      `;

      const card = this.renderProductRecommendationCard([comte, parmigiano]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M al Carrito", query: "Agrega el Comté 36M al carrito" },
        { text: "💳 Proceder al Pago", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 8. ENVÍO REFRIGERADO / CADENA DE FRÍO
    if (q.includes("envio") || q.includes("envío") || q.includes("despacho") || q.includes("frio") || q.includes("frío") || q.includes("temperatura")) {
      const reply = `
        Garantizamos **Cadena de Frío certificada a 4°C** en todo momento:
        • Embalaje isotérmico con gel criogénico (autonomía 24-48 hrs).
        • Entrega express en Santiago y regiones vía Blue Express Frío y Chilexpress Priority.
        • **Envío GRATIS** en compras sobre $65.000 ($4.990 tarifa plana en Santiago).
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Ver Tablas Gourmet", query: "Recomiéndame una tabla gourmet para 4 personas" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
      ]);
      return;
    }

    // 9. CONSULTA ESPECÍFICA DE CUALQUIER QUESO DEL CATÁLOGO
    const matchedCheese = CHEESE_PRODUCTS.find(p => {
      const pid = p.id.toLowerCase();
      if (pid === "comte-36m" && (q.includes("comte") || q.includes("comté"))) return true;
      if (pid === "pecorino-tartufo" && (q.includes("pecorino") || q.includes("tartufo"))) return true;
      if (pid === "parmigiano-vacche-rosse" && (q.includes("parmigiano") || q.includes("parmesano") || q.includes("vacche") || q.includes("rosse"))) return true;
      if (pid === "brillat-savarin-creme" && (q.includes("brillat") || q.includes("savarin"))) return true;
      if (pid === "chiloe-oveja-niebla" && (q.includes("chiloe") || q.includes("chiloé") || q.includes("oveja marina"))) return true;
      if (pid === "roquefort-societe" && (q.includes("roquefort") || q.includes("baragnaudes"))) return true;
      if (pid === "gouda-vintage-5a" && (q.includes("gouda") || q.includes("boerenkaas"))) return true;
      if (pid === "morbier-ceniza-aop" && (q.includes("morbier") || q.includes("ceniza"))) return true;
      if (pid === "tabla-degustacion-privee" && (q.includes("grand affineur") || q.includes("cofre degustacion") || q.includes("cofre degustación"))) return true;
      return false;
    });

    if (matchedCheese) {
      const reply = `
        **${matchedCheese.name}** (${formatCLP(matchedCheese.price)})
        • **Origen & Afinación:** ${matchedCheese.origin} • ${matchedCheese.aging} (${matchedCheese.appellation}).
        • **Perfil:** ${matchedCheese.easyGuide}
        • **Acompañamiento:** ${matchedCheese.accompaniment}
      `;
      const card = this.renderProductRecommendationCard([matchedCheese]);
      const shortName = matchedCheese.name.split(" ")[0];
      this.addBotMessage(reply, [
        { text: `🛒 Añadir ${shortName} al Carrito`, query: `Agrega el ${shortName} al carrito` },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" },
        { text: "🧀 Ver otro queso artesanal", query: "¿Qué queso suave y cremoso tienen?" }
      ], card);
      return;
    }

    // 10. ACOMPAÑAMIENTOS & DELICATESSEN
    if (q.includes("miel") || q.includes("cracker") || q.includes("galleta") || q.includes("cuchillo") || q.includes("laguiole") || q.includes("delicatessen") || q.includes("acompañamiento")) {
      const reply = `
        Para complementar su tabla de quesos:
        • **Miel con Trufa Blanca de Alba** (120g - $18.990)
        • **Crackers al Romero & Sal de Cahuil** (150g - $6.990)
        • **Cuchillo Maestro Fromager Laguiole** ($42.990)
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Ver Tablas Gourmet", query: "Recomiéndame una tabla gourmet para 4 personas" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
      ]);
      return;
    }

    // 11. UBICACIÓN, RETIRO Y HORARIOS
    if (q.includes("donde") || q.includes("dónde") || q.includes("ubicacion") || q.includes("ubicación") || q.includes("direccion") || q.includes("dirección") || q.includes("tienda") || q.includes("retiro") || q.includes("horario")) {
      const reply = `
        Nuestra cava subterránea de guarda está en **Av. Alonso de Córdova, Vitacura** (Santiago).
        
        Ofrecemos despacho refrigerado express a domicilio o retiro privado previa coordinación al momento de pagar en Webpay Plus.
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Ver Catálogo", query: "Recomiéndame una tabla gourmet para 4 personas" },
        { text: "❄️ Cadena de Frío", query: "¿Cómo funciona el despacho en frío?" }
      ]);
      return;
    }

    // 12. SALUDOS Y CORTESÍA
    if (q === "hola" || q === "buenas" || q === "buenos dias" || q === "buenos días" || q === "buenas tardes" || q === "buenas noches" || q === "bonjour" || q.startsWith("hola ") || q.startsWith("buenos dias ") || q.startsWith("buenos días ")) {
      const reply = `
        *Bonjour.* Es un placer saludarle en **La Cava Noire**.
        
        ¿En qué afinación o tabla puedo orientarle hoy? Disponemos de quesos con maduración de hasta 60 meses, piezas trufadas, opciones sin lactosa y despacho en frío a 4°C.
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Tabla para Picoteo", query: "Recomiéndame una tabla gourmet para 4 personas" },
        { text: "✨ Quesos Trufados", query: "¿Tienen quesos exclusivos con trufa negra?" },
        { text: "🏔️ Quesos Fuertes", query: "¿Cuáles son los quesos más intensos de la cava?" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
      ]);
      return;
    }

    // 13. FALLBACK INTELIGENTE CON SUGERENCIAS
    const generalReply = `
      Como Maître Fromager, puedo orientarle en piezas de colección (Comté 36M, Trufados, Azules y Chiloé) o armar su tabla ideal para picoteo.
      
      ¿Qué perfil busca o prefiere revisar el catálogo completo?
    `;

    this.addBotMessage(generalReply, [
      { text: "🧀 Tabla para Picoteo", query: "Recomiéndame una tabla gourmet para 4 personas" },
      { text: "✨ Quesos Trufados", query: "¿Tienen quesos exclusivos con trufa negra?" },
      { text: "💳 Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
    ]);
  }

  handleCheckoutIntent() {
    const cart = window.CartManager ? (window.CartManager.cart || window.CartManager.getCart() || []) : [];
    
    if (cart.length === 0) {
      const reply = `
        Su carrito está vacío en este momento.
        
        Le sugiero comenzar con nuestro **${CHEESE_PRODUCTS[0].name}** o el **${CHEESE_PRODUCTS[1].name}**, ambos con despacho garantizado a 4°C.
      `;
      const card = this.renderProductRecommendationCard([CHEESE_PRODUCTS[0], CHEESE_PRODUCTS[1]]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M", query: "Agrega el Comté 36M al carrito" },
        { text: "🛒 Añadir Pecorino", query: "Agrega el Pecorino al carrito" },
        { text: "📦 Ver Cofre Degustación", query: "Háblame del Cofre Degustación Grand Affineur" }
      ], card);
      return;
    }

    const subtotal = window.CartManager && typeof window.CartManager.getSubtotal === "function"
      ? window.CartManager.getSubtotal()
      : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = window.CartManager && typeof window.CartManager.getTotalItemsCount === "function"
      ? window.CartManager.getTotalItemsCount()
      : cart.reduce((sum, item) => sum + item.quantity, 0);

    const checkoutCardHTML = `
      <div class="chat-checkout-summary">
        <div class="checkout-summary-header">
          <span class="gold-badge">Orden Lista para Pagar</span>
          <h4>Resumen de su Cava (${count} productos)</h4>
        </div>
        <div class="checkout-items-preview">
          ${cart.map(item => `
            <div class="chat-item-row">
              <span class="chat-item-name">${item.quantity}x ${item.name}</span>
              <span class="chat-item-price">${formatCLP(item.price * item.quantity)}</span>
            </div>
          `).join("")}
        </div>
        <div class="chat-total-row">
          <span>Subtotal estimado:</span>
          <strong>${formatCLP(subtotal)} CLP</strong>
        </div>
        <button class="btn-chat-webpay" onclick="window.SommelierBot.launchWebpayCheckout()">
          <span>💳 Continuar al Pago Oficial Webpay Plus</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;

    const reply = `
      Su orden está lista para despacho refrigerado a 4°C. Puede abonar de forma segura vía **Webpay Plus (Transbank)** a continuación:
    `;

    this.addBotMessage(reply, [], checkoutCardHTML);
  }

  launchWebpayCheckout() {
    this.closeChat();
    if (window.PaymentGateway && typeof window.PaymentGateway.openWebpayModal === "function") {
      window.PaymentGateway.openWebpayModal();
    } else if (window.CartManager) {
      window.CartManager.openDrawer();
    }
  }

  renderProductRecommendationCard(products) {
    if (!products || products.length === 0) return "";

    return `
      <div class="chat-products-carousel">
        ${products.map(p => `
          <div class="chat-product-mini-card">
            <img src="${p.image}" alt="${p.name}" class="mini-thumb">
            <div class="mini-info">
              <span class="mini-cat">${p.origin}</span>
              <h5>${p.name}</h5>
              <div class="mini-bottom">
                <span class="mini-price">${formatCLP(p.price)}</span>
                <button class="mini-add-btn" data-product-id="${p.id}" onclick="window.CartManager && window.CartManager.addItemById('${p.id}');">
                  + Carrito
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.FromagerBot = new FromagerAI();
  window.SommelierBot = window.FromagerBot;
});
