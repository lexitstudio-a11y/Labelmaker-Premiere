(() => {
  const GENERIC = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy",
    "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "emoji", "math", "fangsong"]);
  const ctx = document.createElement("canvas").getContext("2d");
  const TEST = "mmmmmmmmmmlliWQ@#1234567890éà";
  const baseWidths = {};

  function width(font) {
    ctx.font = `72px ${font}`;
    return ctx.measureText(TEST).width;
  }
  ["monospace", "serif", "sans-serif"].forEach((b) => (baseWidths[b] = width(b)));

  // Une police est disponible si elle change la largeur par rapport à chaque police de secours.
  function isAvailable(name) {
    const quoted = `"${name}"`;
    return Object.keys(baseWidths).some((b) => width(`${quoted}, ${b}`) !== baseWidths[b]);
  }

  function parseStack(stack) {
    return stack.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }

  function detect(el) {
    const cs = getComputedStyle(el);
    const stack = parseStack(cs.fontFamily);
    let used = null;
    for (const f of stack) {
      if (GENERIC.has(f.toLowerCase())) { used = used || `${f} (police générique du système)`; break; }
      if (isAvailable(f)) { used = f; break; }
    }
    return {
      used: used || stack[0] || "Inconnue",
      stack: cs.fontFamily,
      size: cs.fontSize,
      weight: cs.fontWeight,
      style: cs.fontStyle,
      color: cs.color,
      lineHeight: cs.lineHeight
    };
  }

  let tip = null;
  function removeTip() { if (tip) { tip.remove(); tip = null; } }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function show(info, rect) {
    removeTip();
    tip = document.createElement("div");
    tip.id = "ff-tooltip";
    tip.innerHTML =
      `<span class="ff-name">${esc(info.used)}</span>` +
      `<span class="ff-row"><b>Taille :</b> ${esc(info.size)} · <b>Graisse :</b> ${esc(info.weight)} · <b>Style :</b> ${esc(info.style)}</span>` +
      `<span class="ff-row"><b>Couleur :</b> ${esc(info.color)} · <b>Interligne :</b> ${esc(info.lineHeight)}</span>` +
      `<span class="ff-stack">font-family : ${esc(info.stack)}</span>` +
      `<span class="ff-btn">Copier le nom</span>`;
    document.documentElement.appendChild(tip);
    tip.querySelector(".ff-btn").addEventListener("click", (e) => {
      const name = info.used.replace(/ \(police générique.*$/, "");
      navigator.clipboard?.writeText(name);
      e.target.textContent = "Copié ✔";
    });
    const top = window.scrollY + rect.bottom + 8;
    const left = Math.max(8, Math.min(window.scrollX + rect.left, window.scrollX + document.documentElement.clientWidth - tip.offsetWidth - 8));
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  document.addEventListener("mouseup", (e) => {
    if (tip && tip.contains(e.target)) return;
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { removeTip(); return; }
      let node = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (!node) return;
      show(detect(node), sel.getRangeAt(0).getBoundingClientRect());
    }, 10);
  });

  document.addEventListener("mousedown", (e) => { if (tip && !tip.contains(e.target)) removeTip(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") removeTip(); });
})();
