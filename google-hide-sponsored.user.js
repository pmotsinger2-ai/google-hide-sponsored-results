// ==UserScript==
// @name         Google Search: Hide Sponsored Results (Safe CSS Version)
// @namespace    https://github.com/GooglyBlox
// @version      2.5
// @description  Hide Google Search ads/sponsored results without breaking the page
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// Search results (bare + www + encrypted)
/// @match       https://google.com/search*
// @match       https://www.google.com/search*
// @match       https://encrypted.google.com/search*
//
// Exclude images / news / local
// @exclude     https://*.google.*/*tbm=isch*
// @exclude     https://*.google.*/*tbm=nws*
// @exclude     https://*.google.*/*tbm=lcl*
//
// Auto-update from GitHub raw
// @downloadURL  https://raw.githubusercontent.com/pmotsinger2-ai/google-hide-sponsored-results/main/google-hide-sponsored.user.js
// @updateURL    https://raw.githubusercontent.com/pmotsinger2-ai/google-hide-sponsored-results/main/google-hide-sponsored.user.js
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ATTR = 'data-hide-google-ads';

  function injectCss() {
    if (document.documentElement.querySelector(`style[${STYLE_ATTR}]`)) return;

    const style = document.createElement('style');
    style.setAttribute(STYLE_ATTR, '1');

    style.textContent = `
      /* Classic top and bottom ad blocks inside the results area */
      #search #tads,
      #search #tadsb,
      #search #taw {
        display: none !important;
      }

      /* Common desktop commercial ad units (top/right/PLAs) */
      #search .commercial-unit-desktop-top,
      #search .commercial-unit-desktop-rhs,
      #search .pla-unit,
      #search .pla-unit-container,
      #search .cu-container,
      #search .ads-ad {
        display: none !important;
      }

      /* Elements explicitly marked as ads/sponsored within the results area */
      #search [data-text-ad],
      #search [data-text-ad="1"],
      #search [data-ad],
      #search [data-ad-type],
      #search [data-ad-client],
      #search [data-ad-index],
      #search [data-ad-position],
      #search [aria-label="Ads"],
      #search [aria-label="Sponsored"],
      #search [aria-label="Sponsored results"],
      #search [aria-label="Ads results"],
      #search [aria-label^="Ads "],
      #search [aria-label^="Sponsored "],
      #search [role="region"][aria-label^="Ads"],
      #search [role="region"][aria-label^="Sponsored"] {
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
