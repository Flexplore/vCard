(function () {
  const CONTACT = {
    firstName: "Florian",
    lastName: "Fournier",
    displayName: "Florian Fournier",
    org: "Flexplore",
    title: "Intégrations IA et automatisation dans les PME",
    phone: "+33652692700",
    email: "contact@flexplore-ia.com",
    website: "https://flexplore-ia.com",
    city: "Carcassonne",
    country: "France",
    whatsapp: "https://wa.me/33652692700",
    avatarUrl: "https://res.cloudinary.com/df8rjlqzg/image/upload/v1767433485/upscalemedia-transformed_3_lx6xhq.png",
    avatarBase64: "",
    avatarBase64Type: "JPEG",
  };

  const LABELS = {
    fr: {
      avatarAlt: (name) => `Photo de ${name}`,
      website: "Ouvrir le site",
    },
    en: {
      avatarAlt: (name) => `Photo of ${name}`,
      website: "Open website",
    },
    es: {
      avatarAlt: (name) => `Foto de ${name}`,
      website: "Abrir sitio web",
    },
  };

  const locale = (document.documentElement.lang || "fr").toLowerCase();
  const labels = LABELS[locale] || LABELS.fr;

  // Année footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const displayNameEl = document.getElementById("displayName");
  if (displayNameEl) displayNameEl.textContent = CONTACT.displayName;

  const websiteLink = document.getElementById("websiteLink");
  if (websiteLink) {
    websiteLink.href = CONTACT.website;
    websiteLink.setAttribute("aria-label", labels.website);
  }

  const avatarImg = document.getElementById("avatarImg");
  if (avatarImg && CONTACT.avatarUrl) {
    avatarImg.src = CONTACT.avatarUrl;
    avatarImg.alt = labels.avatarAlt(CONTACT.displayName);
    avatarImg.style.display = "block";
  } else if (avatarImg) {
    avatarImg.alt = "";
  }

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
      const vcf = buildVCard(CONTACT);

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
    const photoPayload = parseBase64Photo(data.avatarBase64, data.avatarBase64Type);
    const foldedPhoto = photoPayload
      ? foldVCardLine(`PHOTO;ENCODING=b;TYPE=${photoPayload.type}:${photoPayload.base64}`)
      : null;
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(data.lastName)};${esc(data.firstName)};;;`,
      `FN:${esc(`${data.firstName} ${data.lastName}`)}`,
      foldedPhoto,
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

  function foldVCardLine(line) {
    const chunks = [];
    for (let i = 0; i < line.length; i += 75) {
      const chunk = line.slice(i, i + 75);
      chunks.push(i === 0 ? chunk : ` ${chunk}`);
    }
    return chunks.join("\r\n");
  }

  function parseBase64Photo(value, fallbackType) {
    if (!value) return null;
    const stringValue = String(value).trim();
    const dataUrlMatch = stringValue.match(/^data:image\/(png|jpe?g);base64,/i);
    const base64 = stringValue.replace(/^data:image\/(png|jpe?g);base64,/i, "").replace(/\s+/g, "");
    let type = dataUrlMatch ? dataUrlMatch[1].toUpperCase() : String(fallbackType || "JPEG").toUpperCase();
    if (type === "JPG") type = "JPEG";
    return base64 ? { base64, type } : null;
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
