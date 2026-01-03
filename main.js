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

    // photo locale dans ton repo (GitHub Pages servira /vCard/assets/avatar.jpg)
    avatarUrl: "assets/avatar.jpg",
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

  // Cache photo vCard (évite de recalculer)
  let cachedVCardPhoto = null; // { base64, type: "JPEG" }

  // Bouton vCard
  const btnVcf = document.getElementById("btnVcf");
  if (btnVcf) {
    btnVcf.addEventListener("click", async () => {
      try {
        btnVcf.disabled = true;

        // Important : ça doit tourner sur une URL http(s) (GitHub Pages / Netlify)
        // Pas en ouvrant index.html en local (file://), sinon fetch peut échouer.
        if (!cachedVCardPhoto && CONTACT.avatarUrl) {
          cachedVCardPhoto = await fetchAndPrepareVCardPhoto(CONTACT.avatarUrl);
        }

        const vcf = buildVCard(CONTACT, cachedVCardPhoto);
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

  async function fetchAndPrepareVCardPhoto(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Impossible de charger l'image (${res.status})`);
    const blob = await res.blob();

    // On convertit en JPEG 512x512 pour éviter un VCF énorme
    const base64 = await blobToSquareJpegBase64(blob, 512, 0.82);

    return { base64, type: "JPEG" };
  }

  async function blobToSquareJpegBase64(blob, size = 512, quality = 0.82) {
    // Chemin moderne : createImageBitmap (rapide)
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(blob);
      const { sx, sy, sw, sh } = centerSquareCrop(bmp.width, bmp.height);

      // crop carré au centre
      const cropped = await createImageBitmap(blob, sx, sy, sw, sh);

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D indisponible");

      ctx.drawImage(cropped, 0, 0, size, size);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      return dataUrl.replace(/^data:image\/jpeg;base64,/i, "").replace(/\s+/g, "");
    }

    // Fallback : via <img>
    const dataUrl = await blobToDataUrl(blob);
    const img = await loadImage(dataUrl);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponible");

    const { sx, sy, sw, sh } = centerSquareCrop(img.naturalWidth, img.naturalHeight);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

    const jpegUrl = canvas.toDataURL("image/jpeg", quality);
    return jpegUrl.replace(/^data:image\/jpeg;base64,/i, "").replace(/\s+/g, "");
  }

  function centerSquareCrop(w, h) {
    const side = Math.min(w, h);
    const sx = Math.floor((w - side) / 2);
    const sy = Math.floor((h - side) / 2);
    return { sx, sy, sw: side, sh: side };
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("FileReader a échoué"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(blob);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Impossible de charger l'image"));
      img.src = src;
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
