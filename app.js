// Cuban Market Analysis — SPA. Vanilla JS, fetches /data/*.json from same origin.
(async function () {
  const fmt = new Intl.NumberFormat("es-CU");
  const datafmt = new Intl.DateTimeFormat("es-CU", { dateStyle: "medium", timeStyle: "short" });

  async function loadJSON(path) {
    const r = await fetch(path, { cache: "no-cache" });
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  }

  function fillCards(latest) {
    for (const el of document.querySelectorAll(".value[data-window]")) {
      const win = el.dataset.window;
      el.textContent = fmt.format(latest.windows[win]?.total_ads ?? 0);
    }
  }

  function renderCategoryTable(latest, categories) {
    const w = latest.windows["30d"] || { by_category: {} };
    const rows = Object.entries(w.by_category)
      .map(([cid, c]) => ({
        cid,
        name: c.name_es || c.slug || cid,
        count: c.count || 0,
        usd: c.prices?.USD?.median ?? null,
        cup: c.prices?.CUP?.median ?? null,
        other: Object.entries(c.prices || {})
          .filter(([cur]) => cur !== "USD" && cur !== "CUP")
          .map(([cur, p]) => `${cur} ${fmt.format(Math.round(p.median ?? 0))}`)
          .join(", ") || "—",
      }))
      .sort((a, b) => b.count - a.count);
    const tbody = document.querySelector("#cat-table tbody");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5">Sin datos en la ventana de 30 días.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows
      .map((r) => `
        <tr>
          <td>${escapeHtml(r.name)}</td>
          <td class="num">${fmt.format(r.count)}</td>
          <td class="num">${r.usd != null ? "$" + fmt.format(Math.round(r.usd)) : "—"}</td>
          <td class="num">${r.cup != null ? fmt.format(Math.round(r.cup)) : "—"}</td>
          <td class="num">${escapeHtml(r.other)}</td>
        </tr>
      `)
      .join("");
  }

  function renderProvinces(latest) {
    const w = latest.windows["30d"] || { by_province: {} };
    const rows = Object.entries(w.by_province)
      .map(([pid, p]) => ({ name: p.name || pid, count: p.count }))
      .sort((a, b) => b.count - a.count);
    const el = document.getElementById("provinces");
    if (!rows.length) {
      el.textContent = "Sin datos.";
      return;
    }
    el.innerHTML = rows.map((r) => `
      <div class="row"><span>${escapeHtml(r.name)}</span><span>${fmt.format(r.count)}</span></div>
    `).join("");
  }

  function renderTrend(latest) {
    const trend = latest.trend_30d || [];
    const labels = trend.map((d) => d.date.slice(5));
    const data = trend.map((d) => d.total);
    const ctx = document.getElementById("trend").getContext("2d");
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const fg = dark ? "#f0f0f0" : "#1a1a1a";
    const grid = dark ? "#333" : "#eee";
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Anuncios / día",
          data,
          borderColor: "#c41e3a",
          backgroundColor: "rgba(196,30,58,0.15)",
          tension: 0.25,
          fill: true,
          pointRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: fg, maxRotation: 0, autoSkip: true }, grid: { color: grid } },
          y: { ticks: { color: fg }, grid: { color: grid }, beginAtZero: true },
        },
      },
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  try {
    const [latest, categories, meta] = await Promise.all([
      loadJSON("data/latest.json"),
      loadJSON("data/categories.json"),
      loadJSON("data/meta.json"),
    ]);
    fillCards(latest);
    renderCategoryTable(latest, categories);
    renderProvinces(latest);
    renderTrend(latest);
    const upd = document.getElementById("last-updated");
    upd.textContent = datafmt.format(new Date(meta.generated_at));
  } catch (e) {
    console.error(e);
    document.querySelector("main").insertAdjacentHTML(
      "afterbegin",
      `<p style="color:var(--accent)">Error cargando datos: ${e.message}</p>`,
    );
  }
})();
