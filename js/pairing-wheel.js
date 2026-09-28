/**
 * LA CAVA NOIRE // Experiencia Interactiva de Maridaje & Rueda de Afinación
 * Animaciones fluidas, síntesis acústica de copa de cristal y selección sensorial.
 */

class PairingStudio {
  constructor() {
    this.currentWine = "carmenere";
    this.audioCtx = null;
    this.initDOM();
    this.initAudio();
  }

  initAudio() {
    // Síntesis de sonido sutil de copa de cristal al interactuar con maridajes
    const initAudioContext = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
    };
    window.addEventListener("click", initAudioContext, { once: true });
    window.addEventListener("touchstart", initAudioContext, { once: true });
  }

  playCrystalClink() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2637.02, now); // Nota E7 cristalina
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.45);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      // Audio silencioso de respaldo si el navegador bloquea autoplay
    }
  }

  initDOM() {
    const container = document.getElementById("pairing-studio-mount");
    if (!container) return;

    this.render();
  }

  selectWine(wineKey) {
    this.currentWine = wineKey;
    this.playCrystalClink();
    this.render();
  }

  render() {
    const container = document.getElementById("pairing-studio-mount");
    if (!container) return;

    const currentPairing = WINE_PAIRING_MATRIX.find(p => p.wine === this.currentWine) || WINE_PAIRING_MATRIX[0];
    const recommendedCheeses = CHEESE_PRODUCTS.filter(c => currentPairing.recommendedCheeses.includes(c.id));

    container.innerHTML = `
      <div class="pairing-container">
        <!-- Selector Horizontal de Cepas -->
        <div class="wine-selector-bar">
          <div class="selector-label">
            <span class="gold-accent-dot"></span>
            <span>SELECCIONE LA CEPA DE SU CAVA:</span>
          </div>
          <div class="wine-pills-row">
            ${WINE_PAIRING_MATRIX.map(item => `
              <button 
                class="wine-pill-btn ${item.wine === this.currentWine ? 'active' : ''}" 
                onclick="window.PairingApp.selectWine('${item.wine}')"
              >
                <span class="wine-icon">${item.wine.includes('espumante') ? '🥂' : item.wine.includes('late') ? '🍯' : '🍷'}</span>
                <span class="wine-title">${item.name.split('/')[0]}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Escaparate Principal del Maridaje -->
        <div class="pairing-stage">
          <!-- Tarjeta de Notas de la Cepa -->
          <div class="wine-profile-card">
            <div class="profile-header">
              <span class="vintage-badge">Cata de Afinación</span>
              <h3 class="wine-name">${currentPairing.name}</h3>
              <p class="wine-desc">${currentPairing.profile}</p>
            </div>

            <div class="sommelier-quote">
              <div class="quote-icon">“</div>
              <p class="quote-text">${currentPairing.reasoning}</p>
              <span class="quote-author">— Jean-Pierre, Maître Sommelier</span>
            </div>

            <div class="sensory-bars">
              <div class="sensory-item">
                <div class="sensory-header-row">
                  <span class="s-label">🍋 Nivel Real de Acidez:</span>
                  <strong class="s-val-text">${currentPairing.acidityLabel || (currentPairing.acidity + '%')}</strong>
                </div>
                <div class="s-track">
                  <div class="s-fill s-bar-animated s-acidity" data-target="${currentPairing.acidity}" style="width: 0%;"></div>
                </div>
              </div>
              <div class="sensory-item">
                <div class="sensory-header-row">
                  <span class="s-label">🧈 Equilibrio Graso en Boca:</span>
                  <strong class="s-val-text">${currentPairing.fatBalanceLabel || (currentPairing.fatBalance + '%')}</strong>
                </div>
                <div class="s-track">
                  <div class="s-fill s-bar-animated s-fat" data-target="${currentPairing.fatBalance}" style="width: 0%;"></div>
                </div>
              </div>
              <div class="sensory-item">
                <div class="sensory-header-row">
                  <span class="s-label">✨ Persistencia Gustativa & Umami:</span>
                  <strong class="s-val-text">${currentPairing.persistenceLabel || (currentPairing.persistence + '%')}</strong>
                </div>
                <div class="s-track">
                  <div class="s-fill s-bar-animated s-persistence" data-target="${currentPairing.persistence}" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjetas de Quesos Armonizados -->
          <div class="matched-cheeses-column">
            <div class="matched-header">
              <h4>Quesos de Autor Recomendados para esta Armonía</h4>
              <span class="count-badge">${recommendedCheeses.length} Selecciones</span>
            </div>

            <div class="matched-grid">
              ${recommendedCheeses.map(cheese => `
                <div class="matched-cheese-card" onclick="window.ProductCatalog.openProductModal('${cheese.id}')">
                  <div class="card-thumb">
                    <img src="${cheese.image}" alt="${cheese.name}">
                    <span class="card-origin-tag">${cheese.origin}</span>
                  </div>
                  <div class="card-body">
                    <div class="cheese-type-line">
                      <span class="category-name">${cheese.categoryLabel}</span>
                      <span class="aging-time">${cheese.aging}</span>
                    </div>
                    <h5 class="cheese-title">${cheese.name}</h5>
                    <p class="cheese-palate">${cheese.tastingNotes.palate}</p>
                    <div class="card-footer-row">
                      <span class="cheese-price">${formatCLP(cheese.price)}</span>
                      <div class="matched-card-btns">
                        <button 
                          class="btn-view-matched" 
                          onclick="event.stopPropagation(); window.ProductCatalog.openProductModal('${cheese.id}');"
                          title="Ver ficha completa"
                        >
                          Ver Ficha
                        </button>
                        <button 
                          class="btn-add-matched" 
                          onclick="event.stopPropagation(); window.CartManager.addItemById('${cheese.id}');"
                          title="Añadir a la bolsa"
                        >
                          + Carrito
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    // Disparar animación suave de llenado progresivo hacia el punto real
    requestAnimationFrame(() => {
      setTimeout(() => {
        container.querySelectorAll(".s-bar-animated").forEach(bar => {
          const target = bar.getAttribute("data-target");
          if (target) {
            bar.style.width = `${target}%`;
          }
        });
      }, 50);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.PairingApp = new PairingStudio();
});
