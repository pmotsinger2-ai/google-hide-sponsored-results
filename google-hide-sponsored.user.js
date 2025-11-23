// ==UserScript==
// @name         Google Search: Hide Sponsored Results (Safe CSS Version)
// @namespace    https://github.com/GooglyBlox
// @version      2.4
// @description  Hide Google Search ads/sponsored results without breaking the page
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// Search results (bare + www + encrypted)
/// @match       https://google.com/search*
/// @match       https://www.google.com/search*
/// @match       https://encrypted.google.com/search*
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
      /* Scope EVERYTHING to the results area so we don't touch the search box */
      #search {

        /* Classic top and bottom ad blocks */
        #tads,
        #tadsb,
        #taw {
          display: none !important;
        }

        /* Common desktop commercial ad units (top/right/PLAs) */
        .commercial-unit-desktop-top,
        .commercial-unit-desktop-rhs,
        .pla-unit,
        .pla-unit-container,
        .cu-container,
        .ads-ad {
          display: none !important;
        }

        /* Elements explicitly marked as ads/sponsored */
        [data-text-ad],
        [data-text-ad="1"],
        [data-ad],
        [data-ad-type],
        [data-ad-client],
        [data-ad-index],
        [data-ad-position],
        [aria-label="Ads"],
        [aria-label="Sponsored"],
        [aria-label="Sponsored results"],
        [aria-label="Ads results"],
        [aria-label^="Ads "],
        [aria-label^="Sponsored "],
        [role="region"][aria-label^="Ads"],
        [role="region"][aria-label^="Sponsored"] {
          display: none !important;
        }
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
