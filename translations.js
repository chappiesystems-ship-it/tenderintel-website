// CosmoTender — English translations (NL is the default in HTML)
const TRANSLATIONS = {
  en: {
    "nav.brand_line":        "AI-powered tender intelligence for Dutch public procurement",
    "hero.eyebrow":          "AI tender intelligence for Dutch public procurement",
    "hero.h1":               "Find the tenders worth pursuing — without reading every dossier.",
    "hero.subtitle":         "CosmoTender monitors TenderNed continuously, scores each opportunity, and surfaces a clear GO / MAYBE / NOGO recommendation so your team can move fast and focus on the right work.",
    "hero.cta_primary":      "Join the waitlist",
    "hero.cta_secondary":    "How it works",
    "panel.label":           "Recent insight",
    "panel.score_label":     "Tender score",
    "panel.copy":            "Water infrastructure contract · Budget € 3,200,000 · Delivery 2026",
    "panel.li1":             "Risk summary extracted automatically",
    "panel.li2":             "Contract terms and deadlines surfaced in seconds",
    "panel.li3":             "Recommended next action: prepare the bid team",
    "features.eyebrow":      "Product",
    "features.h2":           "Decision-ready tender scoring, summaries, and alerts",
    "features.lead":         "Turn TenderNed publications into clear, actionable insight for your bid team, CFO, and client portal.",
    "features.card1.p":      "Automated fit scoring for every tender so you know what to pursue and what to decline.",
    "features.card2.h3":     "Executive summaries",
    "features.card2.p":      "Get concise requirements, budgets, deadlines and risks in a single page.",
    "features.card3.h3":     "Sector-aware matching",
    "features.card3.p":      "Filter opportunities by your focus areas, capabilities, and strategic fit.",
    "features.card4.h3":     "Daily alerts",
    "features.card4.p":      "Receive the most promising tenders first via dashboard, email, or Telegram.",
    "process.eyebrow":       "How it works",
    "process.h2":            "From TenderNed watchlist to actionable verdicts",
    "process.step1.title":   "Ingest",
    "process.step1.p":       "Continuous TenderNed monitoring captures public procurement notices in real time.",
    "process.step2.title":   "Analyze",
    "process.step2.p":       "AI reads each dossier, extracts key terms, budgets, deadlines and compliance signals.",
    "process.step3.title":   "Score",
    "process.step3.p":       "Scores tenders against your profile and delivers a clear GO / MAYBE / NOGO recommendation.",
    "process.step4.title":   "Deliver",
    "process.step4.p":       "Delivery options include a client portal, daily digest, and secure notifications.",
    "waitlist.eyebrow":      "Join the waitlist",
    "waitlist.h2":           "Be first to access the CosmoTender client portal.",
    "waitlist.lead":         "Sign up and we will contact you when the pilot version is ready for early customers.",
    "form.email_label":      "Email address",
    "form.email_ph":         "name@company.com",
    "form.company_label":    "Company name",
    "form.company_ph":       "Your company",
    "form.sector_label":     "Sector / focus area",
    "form.sector_ph":        "IT, Infrastructure, Healthcare, etc.",
    "form.notes_label":      "Notes",
    "form.notes_ph":         "What kinds of tenders are most important for you?",
    "form.submit":           "Reserve my spot",
    "form.note":             "We will only use your email to share CosmoTender launch details.",
    "footer.copy":           "© 2026 CosmoTender. Built for smarter TenderNed decisions.",
  }
};

// i18n engine — apply a language to the page
function applyLang(lang) {
  const strings = TRANSLATIONS[lang] || {};
  const isDefault = lang === "nl";

  document.documentElement.lang = lang;

  // Text content
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = isDefault
      ? el.dataset.i18nNl || el.textContent   // restore NL from cache
      : (strings[key] || el.textContent);

    // Cache the original NL value on first run
    if (!el.dataset.i18nNl) el.dataset.i18nNl = el.textContent;
    if (!isDefault && strings[key]) el.textContent = strings[key];
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.dataset.i18nPh;
    if (!el.dataset.i18nNlPh) el.dataset.i18nNlPh = el.placeholder;
    el.placeholder = isDefault
      ? el.dataset.i18nNlPh
      : (strings[key] || el.dataset.i18nNlPh);
  });

  // Picker button state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  // Page title
  document.title = lang === "en"
    ? "CosmoTender | AI-powered tender intelligence"
    : "CosmoTender | AI-gestuurde tenderintelligentie";

  localStorage.setItem("ct_lang", lang);
}

// Boot: respect stored preference, default NL
document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("ct_lang") || "nl";

  // Cache all NL values before any swap
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.dataset.i18nNl = el.textContent;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.dataset.i18nNlPh = el.placeholder;
  });

  if (stored !== "nl") applyLang(stored);

  // Wire picker buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
});
