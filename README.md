# LA CAVA NOIRE // Fromagerie & Cava de Quesos de Autor

Web application boutique de alta gama dedicada a quesos exclusivos de autor, afinaciones de hasta 60 meses, maridajes enológicos y atención en tiempo real mediante un **Sommelier & Maître Fromager IA (Jean-Pierre)** con checkout directo vía **Webpay Plus (Transbank)** en Pesos Chilenos ($ CLP).

**🔗 Demo en Vivo (GitHub Pages):** [https://66kay.github.io/cava-noire/](https://66kay.github.io/cava-noire/)

![La Cava Noire Preview](https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=85)

---

## ⚜️ Módulos y Funcionalidades de la Web App

### 1. 🍷 Jean-Pierre // Sommelier & Maître Fromager IA
- **Asesoría enológica inteligente en tiempo real:** Comprende lenguaje natural para recomendar afinaciones según cepas de vino (Carménère, Cabernet Sauvignon, Pinot Noir, Champagne, Late Harvest), ocasión (cenas románticas, reuniones de 4 a 8 personas) e intolerancias alimentarias (quesos añejos naturalmente libres de lactosa).
- **Checkout directo dentro del Chat:** Al solicitar proceder con la compra o escribir "pagar", el chatbot genera una tarjeta de pedido interactiva en el mismo diálogo con desglose de montos, verificación de cadena de frío y el botón directo: **"💳 Pagar vía Webpay Plus (Transbank)"**.
- **Acciones interactivas:** Permite añadir recomendaciones directamente a la bolsa con un solo clic.

### 2. 🧀 Cava & Maridaje Interactivo (Pairing Studio)
- Selector táctil de cepas y licores nobles con respuesta acústica procedural (sonido cristalino de copa sintetizado con **Web Audio API** nativa).
- Barras sensoriales de afinidad tánica, equilibrio graso y persistencia umami.
- Despliegue dinámico de quesos armonizados con botón para añadirlos al carrito de inmediato.

### 3. 🔪 Atelier de la Tabla (Diseñador Interactivo de Tablas Gourmet)
- Personalización de tablas sobre pizarra negra de cantera, madera de nogal noble o mármol Nero Marquina.
- Estimación precisa de comensales (2, 4, 6 o más) con cálculo dinámico de gramaje por persona (~100g/comensal).
- Selector dinámico de hasta 6 quesos de autor y acompañamientos delicatessen (Miel con Trufa Blanca de Alba, Crackers artesanal al romero, Cuchillo Laguiole).
- Resumen en tiempo real en Pesos Chilenos ($ CLP) con actualización de meta de envío refrigerado gratuito.

### 4. 🧀 Catálogo de Quesos de Autor & Efecto Dual-Photo
- Piezas numeradas: *Comté AOP 36 Meses, Pecorino al Tartufo Nero Riserva, Parmigiano Reggiano Vacche Rosse 30M, Brillat-Savarin Triple Crème, Queso de Oveja Chiloé Reserva Marina 12M, Roquefort de Cueva AOP, Gouda Boerenkaas 5 Años*.
- **Efecto Dual-Photo:** Transición suave a vista de corte o detalle macro al pasar el cursor.
- **Ficha de Cata Organoléptica:** Modal detallado con notas de aroma, paladar, textura, temperatura de servicio y maridaje sugerido.

### 5. 💳 Pasarela Webpay Plus Transbank & Logística Nacional
- Simulación completa de la pasarela oficial de **Webpay Plus (Transbank)** con selección de bancos chilenos (Banco de Chile, Santander, BCI/MACH, BancoEstado/CuentaRUT, Scotiabank, Itaú).
- Soporte para Redcompra Débito y Crédito bancario.
- Simulación de autorización segura 3D-Secure con emisión de **Voucher oficial de Transbank** con código de autorización y seguimiento de cadena de frío.
- Moneda en Pesos Chilenos ($ CLP) con formato nacional ($29.990) y umbral dinámico para despacho refrigerado gratuito ($65.000 CLP).
- Cupones de cortesía válidos: `CAVANOIRE10` (10% OFF) y `SOMMELIER15` (15% OFF).

### 6. 📦 Panel de Control de Pedidos & Ventas en Vivo
- Registro persistente de cada orden aprobada vía Webpay Plus tanto desde el carrito como desde el Chatbot Sommelier IA.
- Ficha detallada con datos del cliente (nombre, dirección de entrega en Chile, teléfono, productos seleccionados y código de transacción Transbank).
- Control de estados logísticos: *🟡 En Cava (Preparación Fría)*, *🚚 Despachado (Blue Express Frío)* y *✅ Entregado al Cliente*.
- Métricas dinámicas de facturación en `$ CLP`, botón para simular nuevas ventas y exportación de datos en formato **CSV**.
- Alerta visual flotante en tiempo real (*popup con sonido de cristal*) cada vez que se concreta un pago.

---

## 🛠️ Stack Tecnológico

- **HTML5 Semántico:** Estructura limpia y accesible con marcado Schema/OpenGraph.
- **CSS3 Luxury Dark:** Paleta negro obsidiana, reflejos oro champagne, efecto 3D tilt, backdrop-filter blur y animaciones fluidas a 60 FPS.
- **Vanilla JavaScript (ES6+):** Arquitectura modular (`products.js`, `sommelier-ai.js`, `pairing-wheel.js`, `board-builder.js`, `app.js`), Web Audio API para efectos acústicos, sin dependencias externas pesadas.

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
