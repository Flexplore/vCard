const CONTACT = {
  firstName: "Florian",
  lastName: "Fournier",
  organization: "Flexplore",
  title: "Integrations IA et automatisation dans les PME",

  phoneE164: "+33652692700",
  phoneDisplay: "+33 6 52 69 27 00",

  email: "contact@flexplore-ia.com",
  website: "https://flexplore-ia.com",
  city: "Carcassonne",

  whatsappE164: "33652692700",
  calendly: "https://calendly.com/flexplore/30min?back=1&month=2025-11"
};

function escVCard(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildVCard() {
  const fullName = `${CONTACT.firstName} ${CONTACT.lastName}`.trim();
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escVCard(CONTACT.lastName)};${escVCard(CONTACT.firstName)};;;`,
    `FN:${escVCard(fullName)}`,
    CONTACT.organization ? `ORG:${escVCard(CONTACT.organization)}` : null,
    CONTACT.title ? `TITLE:${escVCard(CONTACT.title)}` : null,
    CONTACT.phoneE164 ? `TEL;TYPE=CELL,VOICE:${escVCard(CONTACT.phoneE164)}` : null,
    CONTACT.email ? `EMAIL;TYPE=INTERNET:${escVCard(CONTACT.email)}` : null,
    CONTACT.website ? `URL:${escVCard(CONTACT.website)}` : null,
    CONTACT.city ? `ADR;TYPE=WORK:;;${escVCard(CONTACT.city)};;;;` : null,
    "END:VCARD"
  ].filter(Boolean);

  return lines.join("\r\n");
}

function downloadVCard() {
  const vcf = buildVCard();
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const fileName = "florian-fournier.vcf";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("href", value);
}

async function mountSplineWithWait() {
  const enable = window.__ENABLE_SPLINE__ === true;
  const stage = document.getElementById("robotStage");
  const fallback = document.getElementById("robotFallback");
  const preloadViewer = document.getElementById("spline-boot");

  if (!stage) return;

  // Si Spline désactivé par settings (reduce motion / save-data / 2g)
  if (!enable) {
    if (fallback) fallback.style.display = "flex";
    return;
  }

  // Attendre que la lib Spline soit prête + que le custom element existe
  const waitMs = 6000;

  try {
    const waitForLib = new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        // soit script loaded, soit custom element défini
        if (window.__SPLINE_LIB_READY__ === true) return resolve();
        if (customElements.get("spline-viewer")) return resolve();
        if (Date.now() - start > waitMs) return reject(new Error("Spline lib timeout"));
        requestAnimationFrame(tick);
      };
      tick();
    });

    await waitForLib;

    // Sécurité: attendre la définition
    if (customElements.whenDefined) {
      await Promise.race([
        customElements.whenDefined("spline-viewer"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("whenDefined timeout")), waitMs))
      ]);
    }

    if (!preloadViewer) throw new Error("No preload viewer found");

    if (fallback) fallback.style.display = "none";

    // Monter le viewer dans la zone visible
    stage.appendChild(preloadViewer);

    // S'assure que l'url est bien présente (au cas où)
    if (!preloadViewer.getAttribute("url") && window.__SPLINE_SCENE_URL__) {
      preloadViewer.setAttribute("url", window.__SPLINE_SCENE_URL__);
    }
  } catch {
    // Si ça rate (lib bloquée, réseau, etc) : fallback
    if (fallback) fallback.style.display = "flex";
  }
}

function init() {
  const fullName = `${CONTACT.firstName} ${CONTACT.lastName}`.trim();

  setText("fullName", fullName);
  setText("tagline", CONTACT.title);

  setHref("btnCalendly", CONTACT.calendly);
  setHref("btnWebsite", CONTACT.website);

  const btnAdd = document.getElementById("btnAddContact");
  if (btnAdd) btnAdd.addEventListener("click", downloadVCard);

  setText("year", String(new Date().getFullYear()));

  // Monter Spline après chargement DOM
  mountSplineWithWait();
}

document.addEventListener("DOMContentLoaded", init);
