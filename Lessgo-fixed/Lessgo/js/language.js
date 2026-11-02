// Supported languages: the code must match js/lang/<code>.js and js/words-<code>.txt
const SUPPORTED = ["en", "nl"];
const DEFAULT_LANG = "en";

// Normalises whatever is in localStorage ("EN", "English", "Dutch", "nl"...) to a valid code
function normalizeLanguage(value) {
  const v = String(value || "").trim().toLowerCase();
  if (SUPPORTED.includes(v)) return v;
  if (v === "english") return "en";
  if (v === "dutch" || v === "nederlands") return "nl";
  return DEFAULT_LANG;
}

function getCurrentLanguage() {
  return normalizeLanguage(localStorage.getItem("language"));
}

function setLanguage(lang) {
  localStorage.setItem("language", normalizeLanguage(lang));
}

function changeLanguage(lang) {
  setLanguage(lang);
  location.reload();
}

// Safe helper: only touches an element if it exists on the current page
function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el && text !== undefined) el.textContent = text;
}

function applyLanguage(language, page) {
  if (page === "menu") {
    setText(".play", language.menu.play_btn);
    setText(".how", language.menu.guide_btn);
    setText(".settings", language.menu.settings_btn);
    setText(".quit", language.menu.quit_btn);
  } else if (page === "guides") {
    setText(".guide-title", language.guide.page_title);
    setText(".guide-instructions", language.guide.instructions);
    setText(".back-btn", language.guide.back_btn);
  } else if (page === "play") {
    setText(".victory-title", language.play.victory.title);
    setText(".victory-message", language.play.victory.message);
    setText(".victory-time", language.play.victory.time);
    setText("#playAgainBtn", language.play.victory.play_again_btn);
    setText(".defeat-title", language.play.defeat.title);
    setText(".defeat-message", language.play.defeat.message);
    setText(".defeat-time", language.play.defeat.time);
    setText("#playAgainLoseBtn", language.play.defeat.play_again_btn);
  }
}

function loadLanguage() {
  const page = document.body.getAttribute("data-page");
  const lang = getCurrentLanguage();
  localStorage.setItem("language", lang); // repairs bad stored values
  const language = window.LANGS && window.LANGS[lang];
  if (!language) {
    console.error(`Could not find language data for "${lang}"`);
    return;
  }
  applyLanguage(language, page);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLanguage);
} else {
  loadLanguage();
}
