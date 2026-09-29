/**
 * LA CAVA NOIRE // Jean-Pierre - Maître Sommelier & Affineur
 * Motor de asesoría gastronómica, cata en vivo y checkout directo con Webpay Plus.
 */

class SommelierAI {
  constructor() {
    this.botName = "Jean-Pierre";
    this.botTitle = "Maître Fromager & Affineur de Cava";
    this.isOpen = false;
    this.history = [];
    this.isTyping = false;

    this.initDOM();
    this.initEvents();
  }

  initDOM() {
    // Verificar si el widget ya existe en el DOM
    if (document.getElementById("sommelier-widget")) return;

    const widgetHTML = `
      <div id="sommelier-widget" class="sommelier-widget">
        <!-- Botón flotante disparador -->
        <button id="sommelier-toggle-btn" class="sommelier-toggle-btn" aria-label="Consultar al Maestro Quesero">
          <div class="toggle-pulse"></div>
          <div class="toggle-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M8 2h8l1 6H7L8 2z"></path>
              <path d="M12 8v10"></path>
              <path d="M7 22h10"></path>
              <path d="M5 8c0 4 3 7 7 7s7-3 7-7"></path>
            </svg>
          </div>
          <div class="toggle-badge">
            <span class="badge-dot"></span>
            <span>Maestro Quesero</span>
          </div>
        </button>

        <!-- Ventana de Chat Flotante -->
        <div id="sommelier-window" class="sommelier-window" aria-hidden="true">
          <!-- Header del Sommelier -->
          <div class="sommelier-header">
            <div class="sommelier-avatar">
              <div class="avatar-ring">
                <img src="https://images.unsplash.com/photo-1559561853-08451507cbe7?w=160&auto=format&fit=crop&q=80" alt="Jean-Pierre Sommelier">
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
              <button class="chip-btn" data-query="¿Venden vino o solo quesos de autor?">🧀 ¿Venden vino o solo quesos?</button>
              <button class="chip-btn" data-query="¿Qué queso marida con vino Carménère o Cabernet que tengo en casa?">🍷 Maridaje con mi Vino</button>
              <button class="chip-btn" data-query="Recomiéndame una tabla gourmet para 4 personas">🧀 Tabla para 4 personas</button>
              <button class="chip-btn" data-query="¿Tienen quesos exclusivos con trufa negra?">✨ Queso Trufado</button>
              <button class="chip-btn" data-query="¿Qué opciones tienen sin lactosa natural?">🥛 Sin Lactosa</button>
              <button class="chip-btn chip-highlight" data-query="Quiero proceder con la compra y pagar vía Webpay">💳 Proceder a Pagar con Webpay</button>
            </div>
          </div>

          <!-- Formulario de Entrada de Texto -->
          <form id="sommelier-input-form" class="sommelier-input-form">
            <input 
              type="text" 
              id="sommelier-input" 
              class="sommelier-input" 
              placeholder="Pregúntale a Jean-Pierre sobre maridajes, quesos o tu pedido..."
              autocomplete="off"
            />
            <button type="submit" id="sommelier-send-btn" class="sommelier-send-btn" aria-label="Enviar mensaje">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    const chipsContainer = document.getElementById("sommelier-quick-chips");

    if (toggleBtn) toggleBtn.addEventListener("click", () => this.toggleChat());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeChat());
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetConversation());

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("sommelier-input");
        const query = input.value.trim();
        if (!query || this.isTyping) return;
        input.value = "";
        this.handleUserMessage(query);
      });
    }

    if (chipsContainer) {
      chipsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip-btn");
        if (!btn || this.isTyping) return;
        const query = btn.getAttribute("data-query");
        if (query) this.handleUserMessage(query);
      });
    }

    // Mensaje de bienvenida inicial
    this.sendInitialGreeting();
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
      Soy **${this.botName}**, su Maître Fromager y Sommelier personal. 
      
      En La Cava Noire nos dedicamos **exclusivamente a la afinación, maduración y venta de quesos artesanales de autor (no vendemos vinos ni licores)**. Mi misión es guiarle para elegir el queso perfecto que mejor armonice con las botellas que usted ya tenga en casa, diseñar su tabla gourmet o gestionar su pedido refrigerado a través de **Webpay Plus**.
      
      ¿Qué vino descorchará en su hogar o qué tipo de queso artesanal busca hoy?
    `;

    this.addBotMessage(greetingText, [
      { text: "🍷 Asesoría con mi Vino de Casa", query: "¿Qué queso marida con vino Carménère o Cabernet que tengo en casa?" },
      { text: "🧀 Ver Cofre Grand Affineur", query: "Háblame del Cofre Degustación Grand Affineur" },
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
          <span>LN</span>
        </div>
        <div class="message-content">
          <div class="message-bubble bot-bubble">
            ${formattedHTML}
            ${customCardHTML}
          </div>
          ${actionsHTML}
          <div class="message-time">${this.getCurrentTime()} • Sommelier Certificado</div>
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
    typingEl.id = "sommelier-typing";
    typingEl.className = "message bot-message typing-indicator-msg";
    typingEl.innerHTML = `
      <div class="bot-message-wrapper">
        <div class="bot-avatar-small"><span>LN</span></div>
        <div class="message-bubble bot-bubble typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    container.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const el = document.getElementById("sommelier-typing");
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
    return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  }

  escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  formatMarkdown(text) {
    let out = text.trim();
    // Bold
    out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic
    out = out.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Newlines to breaks
    out = out.replace(/\n\s*\n/g, "</p><p>");
    out = out.replace(/\n/g, "<br>");
    return `<p>${out}</p>`;
  }

  handleUserMessage(query) {
    this.addUserMessage(query);
    this.showTypingIndicator();

    // Simulación de respuesta reflexiva del sommelier
    setTimeout(() => {
      this.hideTypingIndicator();
      this.processQuery(query);
    }, 650);
  }

  processQuery(rawQuery) {
    const q = rawQuery.toLowerCase();

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

    // 2. MARIDAJE CON VINOS TINTOS (Carménère / Cabernet / Syrah)
    if (q.includes("carmenere") || q.includes("carménère") || q.includes("cabernet") || q.includes("tinto") || q.includes("vino tinto")) {
      const comte = CHEESE_PRODUCTS.find(c => c.id === "comte-36m");
      const pecorino = CHEESE_PRODUCTS.find(c => c.id === "pecorino-tartufo");
      const chiloe = CHEESE_PRODUCTS.find(c => c.id === "chiloe-oveja-niebla");

      const reply = `
        Para cepas con cuerpo y estructura como el **Carménère** y el **Cabernet Sauvignon** de valles chilenos (Maipo o Colchagua), requerimos quesos con suficiente grasa láctica y notas tostadas que abracen los taninos sin opacarse:
        
        1. **${comte.name}** (${formatCLP(comte.price)}): Su afinación de 36 meses aporta notas a avellana tostada y cristales de tirosina que armonizan de forma sublime con la madera noble de un tinto Reserva.
        2. **${pecorino.name}** (${formatCLP(pecorino.price)}): Las lascas de trufa negra salvaje crean un puente aromático perfecto con las notas de tabaco y frutos negros del Cabernet.
        3. **${chiloe.name}** (${formatCLP(chiloe.price)}): Si desea una nota austral marina de gran persistencia.
      `;

      const card = this.renderProductRecommendationCard([comte, pecorino]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M ($29.990)", query: "Agrega el Comté 36M al carrito" },
        { text: "🛒 Añadir Pecorino Trufado ($34.990)", query: "Agrega el Pecorino Trufado al carrito" },
        { text: "💳 Proceder al Pago Webpay", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 3. VINOS BLANCOS / CHAMPAGNE / ESPUMANTE
    if (q.includes("blanco") || q.includes("champagne") || q.includes("espumante") || q.includes("sauvignon") || q.includes("chardonnay")) {
      const brillat = CHEESE_PRODUCTS.find(c => c.id === "brillat-savarin-creme");
      const parmigiano = CHEESE_PRODUCTS.find(c => c.id === "parmigiano-vacche-rosse");

      const reply = `
        Los vinos blancos crujientes y espumantes de método tradicional exigen texturas contrastantes:
        
        1. **${brillat.name}** (${formatCLP(brillat.price)}): Un 72% de materia grasa con una cremosidad celestial. La fina acidez y burbuja del espumante cortan la untuosidad dejando una sensación de frescura inmaculada.
        2. **${parmigiano.name}** (${formatCLP(parmigiano.price)}): La mineralidad y granulosidad de la raza autóctona *Vacche Rosse* resalta las notas de levadura y manzana horneada de un buen Champagne o Chardonnay de barrica.
      `;

      const card = this.renderProductRecommendationCard([brillat, parmigiano]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Brillat-Savarin ($24.990)", query: "Agrega el Brillat-Savarin al carrito" },
        { text: "💳 Proceder con la Compra", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 4. QUESO TRUFADO
    if (q.includes("trufa") || q.includes("trufado") || q.includes("tartufo")) {
      const pecorino = CHEESE_PRODUCTS.find(c => c.id === "pecorino-tartufo");
      const miel = DELICATESSEN_ITEMS.find(d => d.id === "miel-trufa-alba");

      const reply = `
        Nuestra línea de quesos trufados es la más codiciada de la cava privada:
        
        - **${pecorino.name}** (${formatCLP(pecorino.price)}): No utilizamos esencias químicas; son auténticas lascas de trufa negra toscana (*Tuber melanosporum*) maduradas con leche pura de oveja durante 12 meses.
        - **Acompañamiento sugerido:** Una cucharadita de **${miel.name}** (${formatCLP(miel.price)}) eleva la experiencia a nivel de alta gastronomía de autor.
      `;

      const card = this.renderProductRecommendationCard([pecorino]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Pecorino Trufado ($34.990)", query: "Agrega el Pecorino Trufado al carrito" },
        { text: "💳 Pagar con Webpay", query: "Quiero proceder a pagar con Webpay" }
      ], card);
      return;
    }

    // 5. ASESORÍA DE TABLA PARA PERSONAS / EVENTOS
    if (q.includes("tabla") || q.includes("personas") || q.includes("comensales") || q.includes("invitados") || q.includes("cena")) {
      const grandAffineur = CHEESE_PRODUCTS.find(c => c.id === "tabla-degustacion-privee");

      const reply = `
        Para deleitar a sus invitados, la regla de oro de la fromagerie francesa es calcular entre **100g y 150g de queso por persona** si se acompaña de cóctel y vino.
        
        Para 4 a 8 comensales, la elección predilecta es nuestro **${grandAffineur.name}** (${formatCLP(grandAffineur.price)}):
        
        - 1.250g de afinación premium con **5 quesos de denominación de origen** (Comté 36M, Brillat-Savarin Triple Crème, Pecorino al Tartufo, Roquefort de Cueva y Oveja Chiloé).
        - Incluye miel con trufa blanca, nueces pecanas y crackers de masa madre horneadas en leña.
        - Se despacha en estuche de madera de cedro con cadena de frío garantizada a 4°C.
      `;

      const card = this.renderProductRecommendationCard([grandAffineur]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Cofre Grand Affineur ($89.990)", query: "Agrega el Cofre Grand Affineur al carrito" },
        { text: "💳 Proceder al Pago Webpay Directo", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 6. PREGUNTAS DE INTENSIDAD / FUERTE / SUAVE
    if (q.includes("fuerte") || q.includes("intenso") || q.includes("potente") || q.includes("azul")) {
      const roquefort = CHEESE_PRODUCTS.find(c => c.id === "roquefort-societe");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");

      const reply = `
        Para paladares audaces que buscan máxima intensidad umami:
        
        1. **${roquefort.name}** (${formatCLP(roquefort.price)}): Intensidad 5/5. Afinado en cuevas calizas naturales francesas. Textura húmeda con vetas verdeazuladas y un picor noble salino inolvidable.
        2. **${gouda.name}** (${formatCLP(gouda.price)}): Intensidad 5/5. Con 5 años de cueva, presenta cristales dorados de tirosina y un perfil tostado que recuerda a maltas añejas y toffee salino.
      `;

      const card = this.renderProductRecommendationCard([roquefort, gouda]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Roquefort ($26.990)", query: "Agrega el Roquefort al carrito" },
        { text: "🛒 Añadir Gouda 5 Años ($33.990)", query: "Agrega el Gouda al carrito" },
        { text: "💳 Ir a Pagar con Webpay", query: "Quiero pagar con Webpay" }
      ], card);
      return;
    }

    // 7. SIN LACTOSA
    if (q.includes("lactosa") || q.includes("intolerante") || q.includes("intolerancia")) {
      const comte = CHEESE_PRODUCTS.find(c => c.id === "comte-36m");
      const gouda = CHEESE_PRODUCTS.find(c => c.id === "gouda-vintage-5a");
      const parmigiano = CHEESE_PRODUCTS.find(c => c.id === "parmigiano-vacche-rosse");

      const reply = `
        ¡Excelente noticia! Los quesos de pasta dura con larga maduración artesanal son **naturalmente casi 0% lactosa**:
        
        Durante los 30 a 60 meses de curación en cava, las bacterias lácticas consumen la totalidad de los azúcares (lactosa), transformándolos en ácido láctico y aminoácidos digestibles.
        
        Nuestras recomendaciones 100% seguras y deliciosas:
        - **${comte.name}** (36 meses)
        - **${parmigiano.name}** (30 meses)
        - **${gouda.name}** (5 años de maduración)
      `;

      const card = this.renderProductRecommendationCard([comte, parmigiano]);
      this.addBotMessage(reply, [
        { text: "🛒 Añadir Comté 36M al Carrito", query: "Agrega el Comté 36M al carrito" },
        { text: "💳 Proceder al Pago", query: "Quiero pagar con Webpay" }
      ], card);
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
          
          Su producto será empacado en nuestro estuche térmico especial con gel refrigerante a 4°C para garantizar su textura original.
          
          ¿Desea agregar algún acompañamiento o prefiere proceder al pago con Webpay Plus de inmediato?
        `;
        this.addBotMessage(reply, [
          { text: "💳 Proceder con la Compra (Webpay)", query: "Quiero proceder con la compra y pagar vía Webpay" },
          { text: "🍯 Ver Acompañamientos", query: "¿Tienen miel con trufa o crackers artesanales?" },
          { text: "🍷 Consultar otro maridaje", query: "¿Qué queso marida con vino tinto?" }
        ]);
        return;
      }
    }

    // 9. FALLBACK INTELIGENTE CON SUGERENCIAS
    const generalReply = `
      Como Maître Fromager, puedo recomendarle las joyas de nuestra cava de maduración:
      
      - **Afinaciones de Lujo:** Disponemos de Comté AOP 36M, Pecorino Trufado de la Toscana, Gouda Vintage de 5 años y nuestro exclusivo Queso de Oveja Chiloé Curado en Niebla Marina.
      - **Maridajes a Medida:** Indíqueme qué botella de vino abrirá y le indicaré el maridaje exacto.
      - **Despachos & Pagos:** Envíos refrigerados isotérmicos a todo Chile con pasarela segura **Webpay Plus (Transbank)**.
      
      ¿Le preparo una propuesta personalizada o prefiere revisar el estado de su orden?
    `;

    this.addBotMessage(generalReply, [
      { text: "🍷 Ver Maridajes con Vino", query: "¿Qué queso marida con vino Carménère o Cabernet?" },
      { text: "🧀 Ver Cofre Degustación", query: "Recomiéndame una tabla gourmet para 4 personas" },
      { text: "💳 Proceder al Pago con Webpay", query: "Quiero pagar con Webpay" }
    ]);
  }

  /**
   * Tarjeta visual interactiva de checkout directamente dentro del chatbot
   */
  handleCheckoutIntent() {
    const cart = window.CartManager ? window.CartManager.getCart() : [];
    
    // Si el carrito está vacío, sugerir el Cofre Grand Affineur como orden curada
    let itemsToProcess = cart;
    let isSuggestedCart = false;

    if (!itemsToProcess || itemsToProcess.length === 0) {
      isSuggestedCart = true;
      const defaultProduct = CHEESE_PRODUCTS.find(p => p.id === "tabla-degustacion-privee") || CHEESE_PRODUCTS[0];
      itemsToProcess = [{ ...defaultProduct, quantity: 1 }];
    }

    const subtotal = itemsToProcess.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingThreshold = 65000;
    const shippingCost = subtotal >= shippingThreshold ? 0 : 4990;
    const total = subtotal + shippingCost;

    let itemsHTML = itemsToProcess.map(item => `
      <div class="chat-checkout-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="item-meta">
          <span class="item-name">${item.name}</span>
          <span class="item-sub">${item.weight || "Pieza gourmet"} • Cant: ${item.quantity}</span>
        </div>
        <div class="item-price">${formatCLP(item.price * item.quantity)}</div>
      </div>
    `).join("");

    const cardHTML = `
      <div class="chat-checkout-card">
        <div class="checkout-card-header">
          <div class="badge-gold">ORDEN DE CAVA LISTA</div>
          <div class="tbk-logo">
            <span class="tbk-text">Webpay Plus</span>
            <span class="tbk-sub">Transbank</span>
          </div>
        </div>

        <div class="checkout-items-list">
          ${itemsHTML}
        </div>

        <div class="checkout-breakdown">
          <div class="breakdown-row">
            <span>Subtotal:</span>
            <span>${formatCLP(subtotal)}</span>
          </div>
          <div class="breakdown-row">
            <span>Envío Refrigerado (Isotérmico 4°C):</span>
            <span>${shippingCost === 0 ? '<strong class="free-text">GRATIS</strong>' : formatCLP(shippingCost)}</span>
          </div>
          <div class="breakdown-total">
            <span>Total a Pagar (CLP):</span>
            <span class="total-amount">${formatCLP(total)}</span>
          </div>
        </div>

        <div class="checkout-security-notice">
          <span>🔒 Transacción cifrada TLS 256-bit • Débito Redcompra y Crédito</span>
        </div>

        <div class="checkout-actions">
          <button class="btn-webpay-chat" onclick="window.SommelierBot.executeWebpayPayment(${total})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Pagar vía Webpay Plus (${formatCLP(total)})</span>
          </button>
        </div>
      </div>
    `;

    const note = isSuggestedCart
      ? `He preparado para usted nuestra selección insignia **Cofre Grand Affineur** lista para ser despachada bajo estricta cadena de frío. Puede proceder a pagar directamente vía Webpay Plus:`
      : `He preparado el resumen de su bolsa para proceder con el pago inmediato a través de la pasarela oficial **Webpay Plus (Transbank)**:`;

    this.addBotMessage(note, [], cardHTML);
  }

  renderProductRecommendationCard(products) {
    if (!products || products.length === 0) return "";
    return `
      <div class="bot-product-cards-slider">
        ${products.map(p => `
          <div class="bot-mini-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="card-details">
              <span class="card-badge">${p.badge || "D.O.P."}</span>
              <h4>${p.name}</h4>
              <p class="aging">${p.aging} • ${p.origin}</p>
              <div class="price-row">
                <span class="price">${formatCLP(p.price)}</span>
                <button class="btn-mini-add" onclick="window.CartManager.addItemById('${p.id}'); window.SommelierBot.openChat();">
                  + Añadir
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  executeWebpayPayment(amount) {
    if (window.PaymentGateway) {
      window.PaymentGateway.openWebpayModal(amount);
    } else {
      alert("Iniciando pasarela Webpay Plus...");
    }
  }
}

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
  window.SommelierBot = new SommelierAI();
});
