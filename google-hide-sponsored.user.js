// ==UserScript==
// @name         Google Search: Hide Sponsored Results (Minimal CSS)
// @namespace    https://github.com/GooglyBlox
// @version      2.2
// @description  Hide Google Search ads/sponsored results (Gemini etc.) using CSS only
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// Run on both bare and www google search
// @match       https://google.com/search*
// @match       https://www.google.com/search*
// @match       https://encrypted.google.com/search*
//
// Optional: also run on /webhp (results page variant)
// @match       https://google.com/webhp*
// @match       https://www.google.com/webhp*
//
// Auto-update from GitHub raw (your repo)
// @downloadURL  https://raw.githubusercontent.com/pmotsinger2-ai/google-hide-sponsored-results/main/google-hide-sponsored.user.js
// @updateURL    https://raw.githubusercontent.com/pmotsinger2-ai/google-hide-sponsored-results/main/google-hide-sponsored.user.js
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ATTR = 'data-hide-google-ads';

  function injectCss() {
    // Don’t inject twice
    if (document.documentElement.querySelector(`style[${STYLE_ATTR}]`)) return;

    const style = document.createElement('style');
    style.setAttribute(STYLE_ATTR, '1');

    style.textContent = `
      /* Classic top and bottom ad blocks */
      #tads,
      #tadsb {
        display: none !important;
      }

      /* Common desktop commercial ad units (top block, right rail, PLAs, etc.) */
      .commercial-unit-desktop-top,
      .commercial-unit-desktop-rhs,
      .pla-unit,
      .cu-container {
        display: none !important;
      }

      /* Elements explicitly marked as ads.
         We intentionally *do not* touch generic "Sponsored" containers,
         because Google sometimes reuses those around non-ad UI. */
      [data-text-ad],
      [data-text-ad="1"],
      [data-ad],
      [data-ad-type],
      [aria-label="Ads"],
      [role="region"][aria-label^="Ads"] {
        display: none !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCss, { once: true });
  } else {
    injectCss();
  }
})();
