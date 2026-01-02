(function () {
  // Année footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Fallback si Spline non chargé / désactivé
  const splineEnabled = !!window.__SPLINE_ENABLED__;
  const splineEl = document.getElementById("splineRobot");
  const fallbackEl = document.getElementById("robotFallback");

  function showFallback() {
    if (fallbackEl) fallbackEl.style.display = "block";
    if (splineEl) splineEl.style.display = "none";
  }
  function showSpline() {
    if (fallbackEl) fallbackEl.style.display = "none";
    if (splineEl) splineEl.style.display = "block";
  }

  if (!splineEnabled) {
    showFallback();
  } else {
    // Par défaut on tente d'afficher Spline, si ça ne charge pas -> fallback
    showSpline();
    // Si au bout de 3s le viewer n’a rien rendu, on bascule fallback
    setTimeout(() => {
      // Si la lib n’a pas été chargée, spline-viewer reste un élément “inconnu”
      // On détecte via l’existence de sa méthode/props internes (simple et robuste)
      const isUpgraded = splineEl && splineEl.tagName.toLowerCase() === "spline-viewer" && splineEl.shadowRoot;
      if (!isUpgraded) showFallback();
    }, 3000);
  }

  // vCard
  const btnVcf = document.getElementById("btnVcf");
  if (btnVcf) {
    btnVcf.addEventListener("click", () => {
      const vcf = buildVCard({
        firstName: "Florian",
        lastName: "Fournier",
        org: "Flexplore",
        title: "Intégrations IA et automatisation dans les PME",
        phone: "+33652692700",
        email: "contact@flexplore-ia.com",
        website: "https://flexplore-ia.com",
        city: "Carcassonne",
        country: "France",
        whatsapp: "https://wa.me/33652692700",
      });

      downloadTextFile(vcf, "florian-fournier-flexplore.vcf", "text/vcard;charset=utf-8");
    });
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function buildVCard(data) {
    // vCard 3.0 (compatible iPhone/Android)
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(data.lastName)};${esc(data.firstName)};;;`,
      `FN:${esc(`${data.firstName} ${data.lastName}`)}`,
      data.org ? `ORG:${esc(data.org)}` : null,
      data.title ? `TITLE:${esc(data.title)}` : null,
      data.phone ? `TEL;TYPE=CELL:${esc(data.phone)}` : null,
      data.email ? `EMAIL;TYPE=INTERNET:${esc(data.email)}` : null,
      data.website ? `URL:${esc(data.website)}` : null,
      (data.city || data.country) ? `ADR;TYPE=WORK:;;${esc(data.city || "")};;;${esc(data.country || "")}` : null,
      data.whatsapp ? `X-SOCIALPROFILE;type=whatsapp:${esc(data.whatsapp)}` : null,
      "END:VCARD",
    ].filter(Boolean);

    return lines.join("\r\n");
  }

  function downloadTextFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }
})();
