// Tout se personnalise ici
const CONTACT = {
  firstName: "Florian",
  lastName: "Fournier",
  organization: "Flexplore",
  title: "Expert en IA & Automatisation",

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
  const fileName = `florian-fournier.vcf`;

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

function moveSplineToStage() {
  const enable = window.__ENABLE_SPLINE__ === true;
  const stage = document.getElementById("robotStage");
  const fallback = document.getElementById("robotFallback");
  const preloadViewer = document.getElementById("spline-boot");

  if (!stage) return;

  if (!enable || !preloadViewer) {
    // Spline désactivé : on garde juste un fallback propre
    if (fallback) fallback.style.display = "flex";
    return;
  }

  if (fallback) fallback.style.display = "none";

  // Déplace le viewer dans la zone visible
  try {
    stage.appendChild(preloadViewer);
  } catch {
    // ignore
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

  moveSplineToStage();
}

document.addEventListener("DOMContentLoaded", init);
