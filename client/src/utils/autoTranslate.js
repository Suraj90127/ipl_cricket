const WIDGET_ID = 'google_translate_element';
const RETRY_INTERVAL_MS = 300;
const MAX_ATTEMPTS = 40; // allow a bit more time for slow widget loads


function getWidgetSelect() {
  return document.querySelector(`#${WIDGET_ID} select`);
}

// Force reset Google Translate widget to a specific language for up to 10 seconds
function forceWidgetLanguage(lang) {
  const start = Date.now();
  function tryForce() {
    const select = getWidgetSelect();
    if (select && select.value !== lang) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      setTimeout(() => {
        select.dispatchEvent(new Event('change'));
      }, 150);
    }
    if (!select || select.value !== lang) {
      if (Date.now() - start < 20000) { // 20 seconds
        setTimeout(tryForce, 500);
      }
    }
  }
  tryForce();
}

// Attempts to set the Google Translate widget language. Resolves with true on success.
export function setGoogleLanguage(lang) {
  const targetLang = lang || 'en';
  return new Promise((resolve) => {
    let attempts = 0;
    const trySet = () => {
      const select = getWidgetSelect();
      attempts += 1;
      if (select) {
        // set twice to avoid flakiness
        if (select.value !== targetLang) {
          select.value = targetLang;
        }
        select.dispatchEvent(new Event('change'));
        setTimeout(() => {
          select.dispatchEvent(new Event('change'));
        }, 150);
        // Extra: force selected language if not set after 500ms
        setTimeout(() => forceWidgetLanguage(targetLang), 500);
        resolve(true);
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        resolve(false);
        return;
      }
      setTimeout(trySet, RETRY_INTERVAL_MS);
    };
    trySet();
  });
}

export async function applyStoredLanguage() {
  let lang = localStorage.getItem('lang');
  if (!lang) {
    lang = 'en';
    localStorage.setItem('lang', lang);
  }
  // Always force selected language on first load
  setTimeout(() => forceWidgetLanguage(lang), 1000);
  return setGoogleLanguage(lang);
}