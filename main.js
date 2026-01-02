// Modifie uniquement cet objet pour personnaliser tout le site + la vCard
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

  // WhatsApp: par défaut identique au téléphone (sans +)
  whatsappE164: "33652692700",

  calendly: "https://calendly.com/flexplore/30min?back=1&month=2025-11",

  // Mets ton lien si tu veux, sinon on cache le bouton automatiquement
  linkedin: ""
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

  // vCard 3.0 (compatible iOS/Android)
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

function makeVCardFile() {
  const vcf = buildVCard();
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const fileName =
    `${(CONTACT.firstName || "contact").toLowerCase()}` +
    `${CONTACT.lastName ? "-" + CONTACT.lastName.toLowerCase() : ""}.vcf`;
  return { blob, fileName };
}

function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "22px";
  t.style.transform = "translateX(-50%)";
  t.style.padding = "10px 12px";
  t.style.borderRadius = "999px";
  t.style.background = "rgba(0,0,0,.65)";
  t.style.border = "1px solid rgba(255,255,255,.18)";
  t.style.color = "rgba(255,255,255,.92)";
  t.style.zIndex = "9999";
  t.style.fontWeight = "800";
  t.style.fontSize = "13px";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

async function downloadVCard() {
  const { blob, fileName } = makeVCardFile();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast("Fiche contact prête (.vcf)");
}

async function shareVCard() {
  const { blob, fileName } = makeVCardFile();

  const canShareFiles =
    navigator.canShare &&
    navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] });

  if (!navigator.share || !canShareFiles) {
    // fallback: téléchargement
    await downloadVCard();
    return;
  }

  try {
    const file = new File([blob], fileName, { type: blob.type });
    await navigator.share({
      title: "Contact",
      text: "Voici mon contact",
      files: [file]
    });
  } catch {
    // annulé
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("href", href);
}

function hideIfEmpty(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!value || value === "#" || String(value).trim() === "") {
    el.style.display = "none";
  }
}

function init() {
  const fullName = `${CONTACT.firstName} ${CONTACT.lastName}`.trim();

  // texte
  setText("fullName", fullName);
  setText("tagline", CONTACT.title || "");
  setText("location", CONTACT.city || "");
  setText("avatarInitial", (CONTACT.firstName?.[0] || "F").toUpperCase());

  setText("phoneText", CONTACT.phoneDisplay || CONTACT.phoneE164 || "");
  setText("emailText", CONTACT.email || "");
  setText("websiteText", (CONTACT.website || "").replace(/^https?:\/\//, ""));

  // liens
  setHref("btnCall", CONTACT.phoneE164 ? `tel:${CONTACT.phoneE164}` : "#");
  setHref("btnEmail", CONTACT.email ? `mailto:${CONTACT.email}` : "#");
  setHref("btnWebsite", CONTACT.website || "#");
  setHref("btnCalendly", CONTACT.calendly || "#");

  const wa = CONTACT.whatsappE164 ? `https://wa.me/${CONTACT.whatsappE164}` : "#";
  setHref("btnWhatsapp", wa);

  setHref("btnLinkedIn", CONTACT.linkedin || "#");

  // cache LinkedIn si pas fourni
  hideIfEmpty("btnLinkedIn", CONTACT.linkedin);

  // boutons vCard
  const btnAdd = document.getElementById("btnAddContact");
  const btnShare = document.getElementById("btnShareContact");
  if (btnAdd) btnAdd.addEventListener("click", downloadVCard);
  if (btnShare) btnShare.addEventListener("click", shareVCard);

  setText("year", String(new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", init);
