// --- Cover Page Logic ---
const coverPage = document.getElementById("cover-page");
const openLetterBtn = document.getElementById("open-letter-btn");
const mainContent = document.getElementById("main-content");
const body = document.body;
const readingProgressFill = document.getElementById("reading-progress-fill");
const backToTopButton = document.getElementById("back-to-top");
const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
const trackedSections = [...document.querySelectorAll("main section[id]")];

// Elements for scroll reveal
const revealNodes = document.querySelectorAll(".reveal");

const parseDurationMs = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.endsWith("ms")) {
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (trimmed.endsWith("s")) {
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed * 1000 : fallback;
  }
  return fallback;
};

const COVER_HIDE_PROGRESS = 0.72;

const durationCache = new Map();
const getCssDurationMs = (variableName, fallback) => {
  if (durationCache.has(variableName)) {
    return durationCache.get(variableName);
  }

  const duration = parseDurationMs(
    getComputedStyle(document.documentElement).getPropertyValue(variableName),
    fallback,
  );
  durationCache.set(variableName, duration);
  return duration;
};

const getCoverHideDelay = () => {
  const exitDuration = getCssDurationMs("--cover-content-exit-duration", 820);
  return Math.max(0, Math.floor(exitDuration * COVER_HIDE_PROGRESS));
};

const getMainEntryDuration = () => getCssDurationMs("--main-content-entry-duration", 920);

const toPercentWithinViewport = (value, viewportSize) =>
  Math.max(0, Math.min((value / viewportSize) * 100, 100));

const setCoverBurstOrigin = (clientX, clientY) => {
  if (!coverPage || typeof clientX !== "number" || typeof clientY !== "number") {
    return;
  }

  const x = toPercentWithinViewport(clientX, window.innerWidth);
  const y = toPercentWithinViewport(clientY, window.innerHeight);
  coverPage.style.setProperty("--cover-burst-x", `${x}%`);
  coverPage.style.setProperty("--cover-burst-y", `${y}%`);
};

// Setup observer but don't observe yet
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  },
);

// Set transition delays based on DOM order for staggered entrance
revealNodes.forEach((node, index) => {
  // Use index slightly differently to avoid too long delays at the bottom
  const delay = Math.min((index % 10) * 80, 600);
  node.style.transitionDelay = `${delay}ms`;
});

const unlockLetter = (observeDelay = 400, useTransition = true) => {
  if (coverPage) {
    if (useTransition) {
      coverPage.classList.add("is-opening");
      setTimeout(() => {
        coverPage.classList.remove("is-opening");
        coverPage.classList.add("is-hidden");
      }, getCoverHideDelay());
    } else {
      coverPage.classList.add("is-hidden");
    }
  }

  body.classList.remove("is-locked");

  if (mainContent) {
    mainContent.classList.remove("main-content-hidden");
    mainContent.classList.add("main-content-visible");
    if (useTransition) {
      mainContent.classList.add("is-opening");
      setTimeout(() => {
        mainContent.classList.remove("is-opening");
      }, getMainEntryDuration());
    }
  }

  setTimeout(() => {
    revealNodes.forEach((node) => {
      observer.observe(node);
    });
  }, observeDelay);
};

if (openLetterBtn) {
  openLetterBtn.addEventListener("click", (event) => {
    if (coverPage && (coverPage.classList.contains("is-opening") || coverPage.classList.contains("is-hidden"))) {
      return;
    }
    setCoverBurstOrigin(event.clientX, event.clientY);
    unlockLetter();
  });
}

if (window.location.hash && window.location.hash !== "#top") {
  unlockLetter(0, false);
}

// --- Existing Interactions ---
const header = document.querySelector(".site-header");

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;

  if (readingProgressFill) {
    readingProgressFill.style.width = `${progress}%`;
  }

  if (header) {
    header.style.background =
      scrollTop > 24 ? "rgba(7, 17, 31, 0.85)" : "rgba(7, 17, 31, 0.4)";
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", scrollTop > 600);
  }

  if (trackedSections.length && navLinks.length) {
    const offset = 160;
    let currentSectionId = trackedSections[0].id;

    trackedSections.forEach((section) => {
      if (scrollTop >= section.offsetTop - offset) {
        currentSectionId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentSectionId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
};

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI, { passive: true });
updateScrollUI();

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const interactiveCards = document.querySelectorAll(
  ".spotlight-card, .mini-note-card, .overview-panel, .decision-statement, .feature-card, .timeline-content, .strength-card, .roadmap-card, .life-card, .final-card, .industry-card, .industry-facts, .section-glance-item, .acn-history-band, .acn-outlook-band",
);

interactiveCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    card.style.setProperty("--rx", `${-py * 6}deg`); // Increased slightly for more dynamic feel
    card.style.setProperty("--ry", `${px * 8}deg`);
    card.style.setProperty("--mx", `${px * 24}px`);
    card.style.setProperty("--my", `${py * 24}px`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "0px");
    card.style.setProperty("--my", "0px");
  });
});

const magneticButtons = document.querySelectorAll(".button");

magneticButtons.forEach((button) => {
  button.addEventListener("mousemove", (event) => {
    const rect = button.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 16; // Increased pull
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    button.style.transform = `translate(${offsetX}px, ${offsetY - 2}px) scale(1.02)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });
});

// --- Dynamic hero eyebrow date (uses current year.month) ---
(() => {
  try {
    const heroEyebrow = document.querySelector('.hero-copy .eyebrow');
    if (!heroEyebrow) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Preserve any trailing text starting with the first slash (e.g. " / M2 / Career Letter")
    const suffixMatch = heroEyebrow.textContent.match(/\/.+$/);
    const suffix = suffixMatch ? suffixMatch[0].trim() : ' / M2 / Career Letter';

    heroEyebrow.textContent = `${year}.${month} ${suffix}`;
  } catch (e) {
    // Fail silently - UI should degrade gracefully
    // eslint-disable-next-line no-console
    console.error('Failed to set dynamic hero eyebrow date:', e);
  }
})();
