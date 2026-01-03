// main.js

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

    // 1) Photo affichée sur la page (peut être locale dans ton repo)
    // Mets ta photo dans /assets/avatar.jpg (ou .png) et laisse ce chemin.
    avatarUrl: "assets/avatar.jpg",

    // 2) Photo embarquée dans la vCard (remplie automatiquement au clic)
    // (on n'écrit rien ici, c'est calculé)
    avatarBase64: "",
    avatarType: "", // "JPEG" ou "PNG"
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

  // Nom affiché
  const displayNameEl = document.getElementById("displayName");
  if (displayNameEl) displayNameEl.textContent = CONTACT.displayName;

  // Lien site
  const websiteLink = document.getElementById("websiteLink");
  if (websiteLink) {
    websiteLink.href = CONTACT.website;
    websiteLink.setAttribute("aria-label", labels.website);
  }

  // Avatar UI
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
    showSpline();
    setTimeout(() => {
      const isUpgraded =
        splineEl &&
        splineEl.tagName.toLowerCase() === "spline-viewer" &&
        splineEl.shadowRoot;
      if (!isUpgraded) showFallback();
    }, 3000);
  }

  // Cache photo vCard (évite de refetch à chaque clic)
  let cachedPhoto = null; // { base64, type }

  // Bouton vCard
  const btnVcf = document.getElementById("btnVcf");
  if (btnVcf) {
    btnVcf.addEventListener("click", async () => {
      try {
        btnVcf.disabled = true;

        // Si on a une photo locale (ou url), on l’embarque dans le VCF
        if (!cachedPhoto && CONTACT.avatarUrl) {
          cachedPhoto = await fetchImageAsBase64(CONTACT.avatarUrl);
        }

        const vcf = buildVCard(CONTACT, cachedPhoto);
        downloadTextFile(vcf, "florian-fournier-flexplore.vcf", "text/vcard;charset=utf-8");
      } catch (e) {
        console.error("Erreur génération vCard:", e);
        // Même si la photo échoue, on génère un VCF sans photo
        const vcf = buildVCard(CONTACT, null);
        downloadTextFile(vcf, "florian-fournier-flexplore.vcf", "text/vcard;charset=utf-8");
      } finally {
        btnVcf.disabled = false;
      }
    });
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function buildVCard(data, photo) {
    // vCard 3.0 (compatible iPhone/Android)
    const photoLine = photo
      ? foldVCardLine(`PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.base64}`)
      : null;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(data.lastName)};${esc(data.firstName)};;;`,
      `FN:${esc(`${data.firstName} ${data.lastName}`)}`,
      photoLine,
      data.org ? `ORG:${esc(data.org)}` : null,
      data.title ? `TITLE:${esc(data.title)}` : null,
      data.phone ? `TEL;TYPE=CELL:${esc(data.phone)}` : null,
      data.email ? `EMAIL;TYPE=INTERNET:${esc(data.email)}` : null,
      data.website ? `URL:${esc(data.website)}` : null,
      (data.city || data.country)
        ? `ADR;TYPE=WORK:;;${esc(data.city || "")};;;${esc(data.country || "")}`
        : null,
      data.whatsapp ? `X-SOCIALPROFILE;type=whatsapp:${esc(data.whatsapp)}` : null,
      "END:VCARD",
    ].filter(Boolean);

    return lines.join("\r\n");
  }

  // Découpe ligne vCard (75 chars max par ligne, continuation avec espace)
  function foldVCardLine(line) {
    const chunks = [];
    for (let i = 0; i < line.length; i += 75) {
      const chunk = line.slice(i, i + 75);
      chunks.push(i === 0 ? chunk : ` ${chunk}`);
    }
    return chunks.join("\r\n");
  }

  // Fetch image -> base64 (sans le prefix data:image/...;base64,)
  async function fetchImageAsBase64(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Impossible de charger l'image (${res.status})`);

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const blob = await res.blob();

    const base64 = await blobToBase64(blob); // retourne data:...;base64,XXXX
    const cleaned = base64.replace(/^data:image\/(png|jpe?g);base64,/i, "").replace(/\s+/g, "");

    let type = "JPEG";
    if (contentType.includes("png") || url.toLowerCase().endsWith(".png")) type = "PNG";
    if (contentType.includes("jpeg") || contentType.includes("jpg") || url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg")) {
      type = "JPEG";
    }

    return { base64: cleaned, type };
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("FileReader a échoué"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(blob);
    });
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
