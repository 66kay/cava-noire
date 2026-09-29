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
              placeholder="Pregúntale a Jean-Pierre sobre quesos, afinaciones o tu pedido..."
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
      *Bonjour et bienvenue à La Cava Noire.* 
      Soy **${this.botName}**, su Maître Fromager y asesor quesero personal. 
      
      En La Cava Noire nos dedicamos **exclusivamente a la afinación, maduración y venta de quesos artesanales de autor de alta gama**. 
      
      Puedo orientarle para elegir la pieza exacta según la intensidad que busque, calcular las porciones para su tabla de picoteo, explicarle el proceso de maduración de nuestras cavas subterráneas o guiarle en su compra directa con **Webpay Plus**.
      
      ¿Qué tipo de queso artesanal desea disfrutar hoy?
    `;

    this.addBotMessage(greetingText, [
      { text: "🧀 Armar Tabla para Invitados", query: "Recomiéndame una tabla gourmet para 4 personas" },
      { text: "✨ Quesos Trufados", query: "¿Tienen quesos exclusivos con trufa negra?" },
      { text: "📦 Ver Cofre Grand Affineur", query: "Háblame del Cofre Degustación Grand Affineur" },
      { text: "💳 Finalizar Compra de Quesos", query: "Quiero proceder con la compra y pagar vía Webpay" }
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
            <button class="inline-action-pill" onclick="window.SommelierBot.handleUserMessage('${this.escapeHTML(act.query)}')">
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
    this.addUserMessage(query);
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      this.processQuery(query);
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
        En **La Cava Noire** nuestro negocio es **100% y de manera exclusiva la afinación, maduración y venta de quesos artesanales de autor**. 
        
        **No vendemos vinos ni bebidas alcohólicas.** Nuestra cava subterránea y nuestro catálogo están dedicados por entero al arte quesero francés, italiano, holandés y austral chileno.
        
        ¿Qué tipo de queso busca hoy? Puedo guiarle entre nuestras pastas prensadas cocidas, cremosas triple crème, quesos trufados o nuestra tabla degustación.
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

    // 2. QUESO TRUFADO
    if (q.includes("trufa") || q.includes("trufado") || q.includes("tartufo")) {
      const pecorino = CHEESE_PRODUCTS.find(c => c.id === "pecorino-tartufo");
      const miel = DELICATESSEN_ITEMS.find(d => d.id === "miel-trufa-alba");

      const reply = `
        Nuestra línea de quesos trufados es la joya más codiciada de la cava privada:
        
        - **${pecorino.name}** (${formatCLP(pecorino.price)}): No utilizamos aromatizantes sintéticos; son auténticas virutas de trufa negra toscana (*Tuber melanosporum*) maduradas con leche pura de oveja durante 12 meses.
        - **Acompañamiento sugerido:** Una cucharadita de **${miel.name}** (${formatCLP(miel.price)}) eleva el contraste a nivel de alta gastronomía.
      `;

      const card = this.renderProductRecommendationCard([pecorino]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Pecorino Trufado al Carrito", query: "Agrega el Pecorino Trufado al carrito" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder a pagar con Webpay" }
      ], card);
      return;
    }

    // 3. ASESORÍA DE TABLA PARA PERSONAS / EVENTOS
    if (q.includes("tabla") || q.includes("personas") || q.includes("comensales") || q.includes("invitados") || q.includes("cena")) {
      const grandAffineur = CHEESE_PRODUCTS.find(c => c.id === "tabla-degustacion-privee");

      const reply = `
        Para una reunión o picoteo en casa, la regla de oro de la fromagerie es calcular entre **100g y 150g de queso por persona**.
        
        Para 4 a 8 comensales, la elección predilecta es nuestro **${grandAffineur.name}** (${formatCLP(grandAffineur.price)}):
        
        - 1.250g de afinación gourmet con **5 quesos de denominación de origen** (Comté 36M, Brillat-Savarin Triple Crème, Pecorino al Tartufo, Roquefort de Cueva y Oveja Chiloé).
        - Incluye miel con trufa blanca de Alba, nueces pecanas chilenas y crackers de masa madre horneadas en leña.
        - Se despacha en estuche de madera de cedro con cadena de frío garantizada a 4°C.
      `;

      const card = this.renderProductRecommendationCard([grandAffineur]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Cofre Grand Affineur al Carrito", query: "Agrega el Cofre Grand Affineur al carrito" },
        { text: "💳 Proceder al Pago Webpay Directo", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 4. PREGUNTAS DE INTENSIDAD / FUERTE / SUAVE / CREMOSO
    if (q.includes("fuerte") || q.includes("intenso") || q.includes("potente") || q.includes("azul")) {
      const roquefort = CHEESE_PRODUCTS.find(c => c.id === "roquefort-societe");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");

      const reply = `
        Para paladares que buscan máxima potencia y persistencia en boca:
        
        1. **${roquefort.name}** (${formatCLP(roquefort.price)}): Intensidad 5/5. Afinado en cuevas calizas naturales francesas. Pasta marfil húmeda con vetas verdeazuladas y un picor noble salino inolvidable.
        2. **${gouda.name}** (${formatCLP(gouda.price)}): Intensidad 5/5. Con 5 años de cueva, presenta cristales dorados de tirosina y un perfil tostado que recuerda a caramelo toffee y malta añeja.
      `;

      const card = this.renderProductRecommendationCard([roquefort, gouda]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Roquefort ($26.990)", query: "Agrega el Roquefort al carrito" },
        { text: "🛒 Añadir Gouda 5 Años ($33.990)", query: "Agrega el Gouda al carrito" },
        { text: "💳 Ir a Pagar con Webpay", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 5. CREMOSOS / SUAVES
    if (q.includes("cremoso") || q.includes("suave") || q.includes("brie") || q.includes("untar")) {
      const brillat = CHEESE_PRODUCTS.find(c => c.id === "brillat-savarin-creme");
      const morbier = CHEESE_PRODUCTS.find(c => c.id === "morbier-ceniza-aop");

      const reply = `
        Para amantes de las texturas untuosas y sedosas:
        
        1. **${brillat.name}** (${formatCLP(brillat.price)}): Un 72% de materia grasa con textura de mousse aterciopelada. Suave, delicado y mantecoso.
        2. **${morbier.name}** (${formatCLP(morbier.price)}): Tierno y elástico, con su tradicional línea de ceniza vegetal y sabor suave a campo.
      `;

      const card = this.renderProductRecommendationCard([brillat, morbier]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Brillat-Savarin ($24.990)", query: "Agrega el Brillat-Savarin al carrito" },
        { text: "🛒 Añadir Morbier ($22.990)", query: "Agrega el Morbier al carrito" }
      ], card);
      return;
    }

    // 6. SIN LACTOSA
    if (q.includes("lactosa") || q.includes("intolerante") || q.includes("intolerancia")) {
      const comte = CHEESE_PRODUCTS.find(c => c.id === "comte-36m");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");
      const parmigiano = CHEESE_PRODUCTS.find(c => c.id === "parmigiano-vacche-rosse");

      const reply = `
        ¡Excelente noticia! Los quesos de pasta dura con larga maduración artesanal son **naturalmente casi 0% lactosa**:
        
        Durante los 30 a 60 meses de curación en cava, las bacterias lácticas consumen los azúcares (lactosa), transformándolos en ácido láctico y aminoácidos digestibles.
        
        Nuestras recomendaciones 100% seguras y deliciosas:
        - **${comte.name}** (36 meses de maduración)
        - **${parmigiano.name}** (30 meses de curación)
        - **${gouda.name}** (5 años en cava)
      `;

      const card = this.renderProductRecommendationCard([comte, parmigiano]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M al Carrito", query: "Agrega el Comté 36M al carrito" },
        { text: "💳 Proceder al Pago", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 7. ENVÍO REFRIGERADO / CADENA DE FRÍO
    if (q.includes("envio") || q.includes("envío") || q.includes("despacho") || q.includes("frio") || q.includes("frío") || q.includes("temperatura")) {
      const reply = `
        Garantizamos **Cadena de Frío certificada a 4°C** en cada envío:
        
        - **Caja Isotérmica:** Barrera aluminizada de triple capa de alta densidad.
        - **Geles Criogénicos:** Conservan la temperatura interna entre 2°C y 6°C por hasta 72 horas.
        - **Couriers Especializados:** Blue Express Frío y Chilexpress Priority con entrega en 24-48h a todo Chile.
        - **Envío Gratis:** En compras superiores a $65.000.
      `;
      this.addBotMessage(reply, [
        { text: "🧀 Ver Catálogo de Quesos", query: "Recomiéndame una tabla gourmet para 4 personas" },
        { text: "💳 Ir a Pagar con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
      ]);
      return;
    }

    // 8. ACCIÓN DE AGREGAR PRODUCTO AL CARRITO DESDE EL CHAT
    if (q.includes("agrega") || q.includes("añadir") || q.includes("añade") || q.includes("comprar este")) {
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

      if (foundProduct) {
        if (window.CartManager) {
          window.CartManager.addItem(foundProduct);
        }
        const reply = `
          Magnifique choice. He añadido **${foundProduct.name}** a su bolsa de compras por **${formatCLP(foundProduct.price)}**.
          
          Su pieza de queso será empacada en nuestra caja isotérmica con gel refrigerante a 4°C para conservar su textura y aroma intactos.
          
          ¿Desea agregar algún acompañamiento artesanal o prefiere proceder al pago con Webpay Plus de inmediato?
        `;
        this.addBotMessage(reply, [
          { text: "💳 Proceder al Pago (Webpay)", query: "Quiero proceder con la compra y pagar vía Webpay" },
          { text: "🍯 Ver Acompañamientos", query: "¿Tienen miel con trufa o crackers artesanales?" },
          { text: "🧀 Ver otro queso artesanal", query: "¿Qué queso suave y cremoso tienen?" }
        ]);
        return;
      }
    }

    // 9. FALLBACK INTELIGENTE CON SUGERENCIAS
    const generalReply = `
      Como Maître Fromager, puedo recomendarle las joyas de nuestra cava de maduración:
      
      - **Afinaciones de Lujo:** Disponemos de Comté AOP 36M, Pecorino Trufado de la Toscana, Gouda Vintage de 5 años y nuestro exclusivo Queso de Oveja Chiloé Curado en Niebla Marina.
      - **Despachos & Pagos:** Envíos refrigerados isotérmicos a todo Chile con pasarela segura oficial **Webpay Plus (Transbank)**.
      
      ¿Le preparo una propuesta personalizada para picotear o prefiere proceder con su compra?
    `;

    this.addBotMessage(generalReply, [
      { text: "🧀 Tabla para Invitados", query: "Recomiéndame una tabla gourmet para 4 personas" },
      { text: "✨ Quesos Trufados", query: "¿Tienen quesos exclusivos con trufa negra?" },
      { text: "💳 Pagar Pedido con Webpay", query: "Quiero proceder con la compra y pagar vía Webpay" }
    ]);
  }

  handleCheckoutIntent() {
    const items = window.CartManager ? window.CartManager.items : [];
    
    if (items.length === 0) {
      const reply = `
        Actualmente su carrito no tiene quesos agregados. 
        
        Permítame sugerirle nuestro **${CHEESE_PRODUCTS[0].name}** (${formatCLP(CHEESE_PRODUCTS[0].price)}) o nuestro célebre **${CHEESE_PRODUCTS[1].name}** para comenzar su pedido con despacho en frío garantizado.
      `;
      const card = this.renderProductRecommendationCard([CHEESE_PRODUCTS[0], CHEESE_PRODUCTS[1]]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M al Carrito", query: "Agrega el Comté 36M al carrito" },
        { text: "🛒 Añadir Pecorino al Carrito", query: "Agrega el Pecorino al carrito" },
        { text: "📦 Ver Cofre Degustación", query: "Háblame del Cofre Degustación Grand Affineur" }
      ], card);
      return;
    }

    const subtotal = window.CartManager.getSubtotal();
    const count = window.CartManager.getTotalItemsCount();

    const checkoutCardHTML = `
      <div class="chat-checkout-summary">
        <div class="checkout-summary-header">
          <span class="gold-badge">Orden Lista para Pagar</span>
          <h4>Resumen de su Cava (${count} productos)</h4>
        </div>
        <div class="checkout-items-preview">
          ${items.map(item => `
            <div class="chat-item-row">
              <span class="chat-item-name">${item.quantity}x ${item.product.name}</span>
              <span class="chat-item-price">${formatCLP(item.product.price * item.quantity)}</span>
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
      Excelente decisión. Todo está dispuesto para procesar su despacho refrigerado con **Webpay Plus**. 
      
      Pulse el botón a continuación para abrir la pasarela segura oficial de Transbank:
    `;

    this.addBotMessage(reply, [], checkoutCardHTML);
  }

  launchWebpayCheckout() {
    this.closeChat();
    if (window.OrdersApp && typeof window.OrdersApp.openCheckoutModalWithCart === "function") {
      window.OrdersApp.openCheckoutModalWithCart();
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
                <button class="mini-add-btn" onclick="window.CartManager.addItemById('${p.id}');">
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
