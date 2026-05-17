# cuban-market-analysis

Observatorio del mercado informal cubano sobre [Revolico](https://www.revolico.com/), publicado como sitio estático en GitHub Pages: <https://syalia-srl.github.io/cuban-market-analysis/>.

Este repositorio contiene únicamente los **datos agregados** (JSON regenerables) y la **SPA** que los visualiza. La lógica del crawler, parser y pipeline vive en el repositorio privado [`syalia-srl/cuban-market-analysis-private`](https://github.com/syalia-srl/cuban-market-analysis-private).

## Origen

Sucesor espiritual de [isladata.com](https://isladata.com/) (2014–2020), reactivado en 2026 con un foco más estrecho: el mercado informal observable a través de plataformas de anuncios clasificados.

## Metodología

- Crawl nocturno de las categorías de primer nivel de Revolico (`compra-venta`, `computadoras`, `vehiculos` / `autos`, `vivienda`, `empleos`, `servicios`).
- Un JSON por anuncio crudo conservado en el lado privado, con `updated_on` como timestamp canónico.
- Agregaciones determinísticas regeneradas en cada ejecución: ventanas de 24h / 7d / 30d / all-time, conteos por categoría nativa, conteos por provincia, tendencia diaria.
- Sin "categorización inteligente" en esta primera iteración — los conteos siguen la taxonomía nativa de Revolico.

## Estructura del sitio

```
index.html            # SPA
app.js                # Carga + render (vanilla JS + Chart.js CDN)
style.css             # Estilos
data/latest.json      # Ventanas + tendencia 30d
data/categories.json  # Taxonomía de Revolico
data/provinces.json   # Taxonomía geográfica
data/meta.json        # Timestamp de la última generación
data/daily/*.json     # Snapshot diario
data/monthly/*.json   # Snapshot mensual
```

## Licencia

MIT.
