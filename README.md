# LA CAVA NOIRE // Quesería Gourmet de Autor & Afinación Exclusiva

Web application boutique de alta gama dedicada **exclusivamente a quesos artesanales de autor** y afinaciones de hasta 60 meses en cava, con asesoría gastronómica en tiempo real mediante **Jean-Pierre (Maître Fromager & Asesor Quesero IA)**, carrito con cálculo dinámico, panel administrativo de control de pedidos y checkout con **Webpay Plus (Transbank)** en Pesos Chilenos ($ CLP).

**🔗 Demo en Vivo (GitHub Pages):** [https://66kay.github.io/cava-noire/](https://66kay.github.io/cava-noire/)

![La Cava Noire Preview](https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=85)

---

## ⚜️ Módulos y Funcionalidades de la Web App

### 1. 🧀 Jean-Pierre // Maître Fromager & Asesor Quesero IA
- **Asesoría quesera experta 100% enfocada en quesos:** Comprende lenguaje natural para orientar sobre maduraciones, texturas, notas de cata, cálculo de porciones por persona (100g a 150g para tablas de picoteo) e intolerancias alimentarias (quesos añejos naturalmente libres de lactosa).
- **Venta exclusiva de quesos:** Aclara de inmediato que la cava no comercializa vinos ni bebidas alcohólicas, enfocándose exclusivamente en el mundo del queso artesanal de autor.
- **Checkout directo dentro del Chat:** Al solicitar proceder con la compra o escribir "pagar", el chatbot genera una tarjeta de pedido interactiva en el mismo diálogo con desglose de montos, verificación de cadena de frío y el botón directo: **"💳 Pagar vía Webpay Plus (Transbank)"**.
- **Acciones interactivas:** Permite añadir quesos y acompañamientos directamente al carrito con un solo clic.

### 2. 🧀 Catálogo de Quesos de Autor & Efecto Dual-Photo
- **Piezas numeradas:** *Comté AOP 36 Meses, Pecorino al Tartufo Nero Riserva, Parmigiano Reggiano Vacche Rosse 30M, Brillat-Savarin Triple Crème, Queso de Oveja Chiloé Reserva Marina 12M, Roquefort de Cueva AOP, Gouda Boerenkaas 5 Años, Morbier AOP con raya de ceniza, Cofre Degustación Grand Affineur*.
- **Efecto Dual-Photo:** Transición suave a vista de corte o detalle macro al pasar el cursor.
- **Ficha Técnica Organoléptica:** Modal detallado con barras animadas de acidez láctica, perfil aromático, textura, temperatura de servicio y acompañamiento en mesa sugerido.

### 3. 💳 Pasarela Webpay Plus Transbank & Logística Nacional
- Simulación completa de la pasarela oficial de **Webpay Plus (Transbank)** con formulario de despacho (nombre, teléfono, comuna, dirección en Chile o retiro en cava).
- Generación de comprobante oficial de pago tipo Boleta Electrónica SII con código de autorización y desglose en `$ CLP`.
- Umbral dinámico para despacho refrigerado gratuito ($65.000 CLP).
- Cupones de cortesía válidos: `CAVANOIRE10` (10% OFF) y `FROMAGER15` (15% OFF).

### 4. 📦 Panel de Control de Pedidos & Ventas en Vivo
- Registro persistente de cada orden aprobada vía Webpay Plus.
- Ficha detallada con datos del cliente (nombre, dirección de entrega en Chile, teléfono, productos seleccionados y código de transacción Transbank).
- Control de estados logísticos: *🟡 En Cava (Preparación Fría)*, *🚚 Despachado (Blue Express Frío)* y *✅ Entregado al Cliente*.
- Métricas dinámicas de facturación en `$ CLP`, botón para simular nuevas ventas y exportación de datos en formato **CSV**.
- Alerta visual flotante en tiempo real con timbre armónico cada vez que se concreta un pago.

---

## 🛠️ Stack Tecnológico

- **HTML5 Semántico:** Estructura limpia y accesible con marcado Schema/OpenGraph.
- **CSS3 Luxury Dark:** Paleta negro obsidiana, reflejos oro champagne, efecto 3D tilt, backdrop-filter blur y animaciones fluidas a 120 FPS.
- **Vanilla JavaScript (ES6+):** Arquitectura modular (`products.js`, `orders-manager.js`, `fromager-ai.js`, `app.js`), Web Audio API para efectos acústicos, sin dependencias externas pesadas.

---

## 🚀 Puesta en Marcha Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/66kay/cava-noire.git
   ```
2. Entrar a la carpeta:
   ```bash
   cd cava-noire
   ```
3. Ejecutar un servidor web local:
   ```bash
   python -m http.server 8082
   ```
4. Abrir en el navegador: [http://localhost:8082](http://localhost:8082)

---

© 2026 LA CAVA NOIRE GOURMET SPA. Alonso de Córdova, Vitacura, Santiago de Chile.
