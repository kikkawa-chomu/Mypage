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
        coverPage.classList.add("is-hidden");
      }, 420);
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
    }
  }

  setTimeout(() => {
    revealNodes.forEach((node) => {
      observer.observe(node);
    });
  }, observeDelay);
};

if (openLetterBtn) {
  openLetterBtn.addEventListener("click", () => {
    openLetterBtn.disabled = true;
    unlockLetter();
  }, { once: true });
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
  ".spotlight-card, .mini-note-card, .overview-panel, .decision-statement, .feature-card, .timeline-content, .strength-card, .roadmap-card, .life-card, .final-card, .industry-card, .industry-facts, .section-glance-item",
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
