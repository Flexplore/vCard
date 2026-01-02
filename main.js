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

  // WhatsApp: par défaut j'ai mis le même numéro que ton tel (sans +)
  whatsappE164: "33652692700",

  calendly: "https://calendly.com/flexplore/30min?back=1&month=2025-11",

  // pas fourni
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
    CONTACT.city ? `ADR;TYPE=HOME:;;${escVCard(CONTACT.city)};;;;` : null,
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

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setHref(id, href) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("href", href);
}

function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "88px";
  t.style.transform = "translateX(-50%)";
  t.style.padding = "10px 12px";
  t.style.borderRadius = "999px";
  t.style.background = "rgba(0,0,0,.65)";
  t.style.border = "1px solid rgba(255,255,255,.18)";
  t.style.color = "rgba(255,255,255,.92)";
  t.style.zIndex = "9999";
  t.style.fontWeight = "700";
  t.style.fontSize = "13px";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1700);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      ta.remove();
      return false;
    }
  }
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
  toast("Fichier contact généré (.vcf)");
}

async function shareVCard() {
  const { blob, fileName } = makeVCardFile();

  const canShareFiles =
    navigator.canShare &&
    navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] });

  if (!navigator.share || !canShareFiles) {
    toast("Partage non supporté ici. Utilise 'Ajouter le contact'.");
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

function init() {
  const fullName = `${CONTACT.firstName} ${CONTACT.lastName}`.trim();
  setText("fullName", fullName || "Contact");
  setText("tagline", CONTACT.title || "");
  setText("city", CONTACT.city || "");

  setHref("phoneLink", CONTACT.phoneE164 ? `tel:${CONTACT.phoneE164}` : "#");
  setText("phoneLink", CONTACT.phoneDisplay || CONTACT.phoneE164 || "Téléphone");

  setHref("emailLink", CONTACT.email ? `mailto:${CONTACT.email}` : "#");
  setText("emailLink", CONTACT.email || "Email");

  setHref("websiteLink", CONTACT.website || "#");
  setText("websiteLink", (CONTACT.website || "").replace(/^https?:\/\//, "") || "Site");

  setHref("btnCall", CONTACT.phoneE164 ? `tel:${CONTACT.phoneE164}` : "#");
  setHref("barCall", CONTACT.phoneE164 ? `tel:${CONTACT.phoneE164}` : "#");

  const wa = CONTACT.whatsappE164 ? `https://wa.me/${CONTACT.whatsappE164}` : "#";
  setHref("btnWhatsapp", wa);
  setHref("btnWhatsapp2", wa);
  setHref("barWhatsapp", wa);

  setHref("btnEmail", CONTACT.email ? `mailto:${CONTACT.email}` : "#");
  setHref("btnEmail2", CONTACT.email ? `mailto:${CONTACT.email}` : "#");

  setHref("btnSms", CONTACT.phoneE164 ? `sms:${CONTACT.phoneE164}` : "#");

  setHref("btnCalendly", CONTACT.calendly || "#");

  // LinkedIn: si pas fourni, on laisse # (tu peux aussi mettre ton lien plus tard)
  setHref("btnLinkedIn", CONTACT.linkedin || "#");

  const btnAdd = document.getElementById("btnAddContact");
  const barAdd = document.getElementById("barAdd");
  const btnShare = document.getElementById("btnShareContact");

  if (btnAdd) btnAdd.addEventListener("click", downloadVCard);
  if (barAdd) barAdd.addEventListener("click", downloadVCard);
  if (btnShare) btnShare.addEventListener("click", shareVCard);

  const btnCopy = document.getElementById("btnCopyPhone");
  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONTACT.phoneDisplay || CONTACT.phoneE164 || "");
      toast(ok ? "Numéro copié" : "Impossible de copier");
    });
  }

  setText("year", String(new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", init);
