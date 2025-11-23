// ==UserScript==
// @name         Google Search: Hide Sponsored Results (v1.3)
// @namespace    https://github.com/GooglyBlox
// @version      1.3
// @description  Hide Google Search ads/sponsored results on google.com
// @author       GooglyBlox
// @license      MIT
// @run-at       document-start
// @grant        none
//
// Match BOTH bare google.com and www.google.com:
//
 // Search pages
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

  // Heuristics for ad markers (attributes / classes)
  const AD_MARKER_SELECTORS = [
    '[data-text-ad="1"]',
    '[data-ad]',
    'span.U3A9Ac.qV8iec'   // existing known badge class
  ].join(',');

  // Likely container blocks around results/ads
  const AD_CONTAINER_SELECTORS = [
    '#tads',     // top ads block (common)
    '#tadsb',    // bottom ads block (common)
    '.uEierd',
    '.v7W49e',
    '.mnr-c',
    '.xpd',
    '.g',
    '.kp-blk',
    '.Yu2Dnd',
    '.PLy5Wb'
  ].join(',');

  const SPONSORED_WORDS = new Set(["sponsored", "ad", "ads"]);
  const SPONSORED_LABEL_MAX_LEN = 20;

  function getSearchRoot(node) {
    if (!node) return null;
    if (node.querySelector) {
      return node.querySelector('#search') || node;
    }
    return node;
  }

  function isSponsoredLabel(el) {
    if (!el || !el.textContent) return false;
    const text = el.textContent.trim().toLowerCase();
    if (!text || text.length > SPONSORED_LABEL_MAX_LEN) return false;
    return SPONSORED_WORDS.has(text);
  }

  function removeContainerFor(element) {
    if (!element || !element.parentElement) return;
    const container = element.closest(AD_CONTAINER_SELECTORS);
    const target = container || element;
    if (target && target.parentElement) {
      target.remove();
    }
  }

  function clean(root) {
    const searchRoot = getSearchRoot(root || document);
    if (!searchRoot || !searchRoot.querySelectorAll) return;

    // 1) Attribute/class-based ad markers
    searchRoot.querySelectorAll(AD_MARKER_SELECTORS)
      .forEach(removeContainerFor);

    // 2) Known ad/result containers that contain ad markers
    searchRoot.querySelectorAll(AD_CONTAINER_SELECTORS)
      .forEach(container => {
        if (container.querySelector(AD_MARKER_SELECTORS)) {
          container.remove();
        }
      });

    // 3) Small "Sponsored"/"Ad" labels
    //    Restrict to spans and labeled divs to avoid scanning every div.
    searchRoot.querySelectorAll('span, div[role], div[aria-label]')
      .forEach(el => {
        if (isSponsoredLabel(el)) {
          removeContainerFor(el);
        }
      });
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  // Initial pass (whatever exists at document-start)
  clean(document);

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
          const root = (node.closest && node.closest('#search')) || node;
          if (handledRoots.has(root)) return;
          handledRoots.add(root);
          clean(root);
        });
      }
    }

    function scheduleProcessing(mutations) {
      pendingMutations.push(...mutations);
      if (scheduled) return;
      scheduled = true;

      if (typeof window.requestIdleCallback === "function") {
        requestIdleCallback(processMutations, { timeout: 200 });
      } else {
        setTimeout(processMutations, 50);
      }
    }

    const observer = new MutationObserver(scheduleProcessing);

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  });
})();
