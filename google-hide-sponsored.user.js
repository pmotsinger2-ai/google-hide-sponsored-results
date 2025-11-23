// ==UserScript==
// @name         Google Search: Hide Sponsored Results (v1.5 dumb hammer)
// @namespace    https://github.com/GooglyBlox
// @version      1.5
// @description  Aggressively hide Google Search sponsored results on google.com
// @author       GooglyBlox
// @license      MIT
// @run-at       document-end
// @grant        none
//
// Matches: bare + www + encrypted search + webhp
// @match       https://google.com/search*
// @match       https://www.google.com/search*
// @match       https://encrypted.google.com/search*
// @match       https://google.com/webhp*
// @match       https://www.google.com/webhp*
//
// Exclude images / news / local
// @exclude     https://google.com/*tbm=isch*
// @exclude     https://www.google.com/*tbm=isch*
// @exclude     https://google.com/*tbm=nws*
// @exclude     https://www.google.com/*tbm=nws*
// @exclude     https://google.com/*tbm=lcl*
// @exclude     https://www.google.com/*tbm=lcl*
// ==/UserScript==

(function () {
  "use strict";

  const LABEL_PATTERNS = [
    "sponsored",
    "sponsored result",
    "sponsored results",
    "sponsored result:",
    "sponsored results:"
  ];

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isSponsoredText(text) {
    const t = normalize(text);
    if (!t) return false;
    return LABEL_PATTERNS.some(p => t === p || t.startsWith(p + " "));
  }

  function getSearchRoot() {
    return document.querySelector("#search") || document.body || document.documentElement;
  }

  // Walk up from the label to a larger container and remove it.
  function removeBlockFromLabel(labelEl) {
    if (!labelEl) return;

    let node = labelEl;
    let lastGood = null;

    for (let i = 0; i < 10 && node && node !== document.body && node !== document.documentElement; i++) {
      // Heuristic: prefer ancestors that look like result / block containers
      const rect = node.getBoundingClientRect();
      const linkCount = node.querySelectorAll("a").length;

      if (rect.height > 60 && linkCount >= 1) {
        lastGood = node;
      }

      node = node.parentElement;
    }

    const target = lastGood || labelEl.parentElement || labelEl;
    if (target && target.parentElement) {
      target.parentElement.removeChild(target);
    }
  }

  function sweep() {
    const root = getSearchRoot();
    if (!root || !root.querySelectorAll) return;

    const candidates = root.querySelectorAll("h1, h2, h3, div, span, button");

    candidates.forEach(el => {
      if (!el.isConnected) return;

      const text = el.textContent;
      const aria = el.getAttribute && el.getAttribute("aria-label");

      if (isSponsoredText(text) || isSponsoredText(aria)) {
        removeBlockFromLabel(el);
      }
    });
  }

  // Initial pass
  sweep();

  // React to dynamic updates
  const observer = new MutationObserver(() => {
    // Just sweep everything; simpler and still cheap enough.
    sweep();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Backup: periodic sweep in case Google does something weird with virtual DOM
  setInterval(sweep, 2000);
})();
