// ==UserScript==
// @name         Google Search: Hide Sponsored Results (v1.4)
// @namespace    https://github.com/GooglyBlox
// @version      1.4
// @description  Hide Google Search ads / sponsored results on google.com
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// Search pages (bare + www)
// @match       https://google.com/search*
// @match       https://www.google.com/search*
// @match       https://encrypted.google.com/search*
//
// Home / webhp variants
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

  const SPONSORED_LABELS = new Set([
    "sponsored",
    "sponsored results",
    "sponsored results:",
    "sponsored products",
    "sponsored ads"
  ]);

  function getSearchRoot(node) {
    if (!node) return null;
    if (node.querySelector) {
      return node.querySelector("#search") || node;
    }
    return node;
  }

  function normalize(text) {
    return (text || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function isSponsoredHeading(el) {
    if (!el) return false;

    const text = normalize(el.textContent);
    if (SPONSORED_LABELS.has(text)) return true;

    const aria = normalize(el.getAttribute?.("aria-label"));
    if (aria && SPONSORED_LABELS.has(aria)) return true;

    return false;
  }

  function looksLikeHideButton(el) {
    if (!el) return false;
    const text = normalize(el.textContent);
    return text.includes("hide sponsored");
  }

  function containsAdLinks(container) {
    if (!container || !container.querySelector) return false;
    return !!container.querySelector(
      'a[href*="googleadservices.com"], a[href*="adurl="], a[href*="aclk"]'
    );
  }

  function findAdContainer(start) {
    let node = start;
    for (let depth = 0; depth < 10 && node && node !== document.body; depth++) {
      if (containsAdLinks(node)) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function removeNode(node) {
    if (node && node.parentElement) {
      node.parentElement.removeChild(node);
    }
  }

  function removeSponsoredBlocks(root) {
    const searchRoot = getSearchRoot(root || document);
    if (!searchRoot || !searchRoot.querySelectorAll) return;

    // 1) Anything already labeled with a sponsored aria-label or role region
    searchRoot
      .querySelectorAll(
        'div[aria-label*="Sponsored"], section[aria-label*="Sponsored"], div[aria-label*="Ads"], section[aria-label*="Ads"]'
      )
      .forEach(block => {
        const container = findAdContainer(block) || block;
        removeNode(container);
      });

    // 2) Headings / labels saying "Sponsored results"
    searchRoot
      .querySelectorAll("h2, h3, div, span")
      .forEach(el => {
        if (!isSponsoredHeading(el)) return;
        const container = findAdContainer(el) || el.parentElement || el;
        removeNode(container);
      });

    // 3) Buttons like "Hide sponsored results"
    searchRoot
      .querySelectorAll("button")
      .forEach(btn => {
        if (!looksLikeHideButton(btn)) return;
        const container = findAdContainer(btn) || btn.parentElement || btn;
        removeNode(container);
      });
  }

  // Initial pass
  removeSponsoredBlocks(document);

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(() => {
    const target = document.body || document.documentElement;
    if (!target) return;

    let scheduled = false;
    let pendingMutations = [];

    function processMutations() {
      scheduled = false;
      const mutations = pendingMutations;
      pendingMutations = [];

      const handledRoots = new Set();

      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const root =
            (node.closest && node.closest("#search")) || node;
          if (handledRoots.has(root)) return;
          handledRoots.add(root);
          removeSponsoredBlocks(root);
        });
      }
    }

    function schedule(mutations) {
      pendingMutations.push(...mutations);
      if (scheduled) return;
      scheduled = true;
      setTimeout(processMutations, 50);
    }

    const observer = new MutationObserver(schedule);

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  });
})();
