// ==UserScript==
// @name         Google Search: Hide Sponsored Results (Safe CSS Version)
// @namespace    https://github.com/GooglyBlox
// @version      2.0
// @version      2.2
// @description  Hide Google Search ads/sponsored results without breaking the page
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// @match       https://www.google.com/search*
// @match       https://www.google.com/webhp*
// @match       https://encrypted.google.com/search*
//
// @exclude     https://*.google.*/*tbm=isch*
// @exclude     https://*.google.*/*tbm=nws*
// @exclude     https://*.google.*/*tbm=lcl*
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ATTR = 'data-hide-google-ads';

  function injectCss() {
    if (document.documentElement.querySelector('style[data-hide-google-ads]')) return;
    if (document.documentElement.querySelector(`style[${STYLE_ATTR}]`)) return;

    const style = document.createElement('style');
    style.setAttribute('data-hide-google-ads', '1');
    style.setAttribute(STYLE_ATTR, '1');

    style.textContent = `
      /* Classic top and bottom ad blocks */
      #tads,
      #tadsb {
      #tadsb,
      #taw {
        display: none !important;
      }

      /* Common desktop commercial ad units */
      .commercial-unit-desktop-top,
      .commercial-unit-desktop-rhs,
      .pla-unit,
      .cu-container {
      .cu-container,
      .ads-ad,
      .Krnil,
      .uEierd,
      .VjDLd,
      .GLI8Bc {
        display: none !important;
      }

      /* Generic ad markers Google uses in many layouts */
      [data-text-ad],
      [data-text-ad="1"],
      [data-ad],
      [data-ad-type],
      [aria-label="Ads"],
      [aria-label="Sponsored"],
      [aria-label^="Ads "],
      [aria-label^="Sponsored "],
      [aria-label="Ads results"],
      [aria-label="Sponsored results"],
      [role="region"][aria-label^="Ads"],
      [role="region"][aria-label^="Sponsored"] {
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
