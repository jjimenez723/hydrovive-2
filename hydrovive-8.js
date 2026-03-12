const header = document.querySelector(".site-header");
    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");
    const revealItems = document.querySelectorAll(".reveal");
    const consultDrawer = document.getElementById("consultDrawer");
    const openDrawerButtons = document.querySelectorAll("[data-open-drawer]");
    const closeDrawerButton = document.getElementById("closeDrawer");
    const resetDrawerButton = document.getElementById("resetDrawer");
    const consultForm = document.getElementById("consultForm");
    const successCard = document.getElementById("successCard");
    const successMessage = document.getElementById("successMessage");
    const serviceInterest = document.getElementById("serviceInterest");
    const preferredDate = document.getElementById("preferredDate");
    const preferredWindow = document.getElementById("preferredWindow");
    const summaryService = document.getElementById("summaryService");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");
    const dayOptions = document.getElementById("dayOptions");
    const schedulerCta = document.getElementById("schedulerCta");
    const hero = document.querySelector(".hero");
    const floatingCta = document.querySelector(".floating-cta");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const metricValues = document.querySelectorAll(".metric-value");
    const tiltTargets = document.querySelectorAll(".stage-primary, .principles-card, .arrival-card, .metric-card, .signal-card, .service-card, .journey-card, .demo-card, .membership-card, .process-card, .contact-panel, .detail-card");
    const navLinks = Array.from(siteNav.querySelectorAll("a[href^='#']"));
    const observedSections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const schedulerState = {
      service: "Private consultation",
      time: "9:00 AM",
      date: null
    };

    const campaignData = {
      recovery: {
        audience: "Post-op families",
        window: "Spring launch",
        title: "A smoother first 72 hours after surgery.",
        copy: "Introduce a bundled story around transport, discharge support, and in-home recovery oversight so families immediately understand the value of having a trusted clinical presence from the very first handoff.",
        cta: "Suggested CTA: Request your private recovery plan"
      },
      welcome: {
        audience: "New members",
        window: "Always-on",
        title: "Begin with a calm, guided first month of care.",
        copy: "Position the Surrogate Family Membership as a reassuring first step for households who want regular presence, strong communication, and visible member benefits from day one.",
        cta: "Suggested CTA: Explore membership onboarding"
      },
      seasonal: {
        audience: "Existing clients",
        window: "Seasonal",
        title: "Feature wellness support without breaking the luxury tone.",
        copy: "Promote hydration, B12, or massage as thoughtful enhancements to ongoing care rather than stand-alone discount offers, keeping the brand refined and clinically credible.",
        cta: "Suggested CTA: Add a wellness service to your care plan"
      }
    };

    function formatChipDate(date) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      }).format(date);
    }

    function formatLongDate(date) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      }).format(date);
    }

    function formatInputDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }

    function buildDayOptions() {
      const dates = Array.from({ length: 5 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        return date;
      });

      schedulerState.date = dates[0];
      dayOptions.innerHTML = dates.map((date, index) => {
        return `
          <button class="option-chip ${index === 0 ? "active" : ""}" type="button" data-day-option="${formatInputDate(date)}">
            <strong>${formatChipDate(date)}</strong>
            <span>${index === 0 ? "Soonest" : "Preferred"}</span>
          </button>
        `;
      }).join("");

      dayOptions.querySelectorAll("[data-day-option]").forEach((button) => {
        button.addEventListener("click", () => {
          dayOptions.querySelectorAll("[data-day-option]").forEach((chip) => chip.classList.remove("active"));
          button.classList.add("active");
          schedulerState.date = new Date(button.dataset.dayOption + "T09:00:00");
          syncSchedulerSummary();
        });
      });
    }

    function syncSchedulerSummary() {
      summaryService.textContent = schedulerState.service;
      summaryTime.textContent = schedulerState.time;
      summaryDate.textContent = schedulerState.date ? formatLongDate(schedulerState.date) : "Select a day";
      serviceInterest.value = schedulerState.service;
      preferredWindow.value = schedulerState.time;
      preferredDate.value = schedulerState.date ? formatInputDate(schedulerState.date) : "";
    }

    function openDrawer() {
      consultDrawer.classList.add("is-open");
      consultDrawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");
    }

    function closeDrawer() {
      consultDrawer.classList.remove("is-open");
      consultDrawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("drawer-open");
    }

    function resetConsultForm() {
      consultForm.reset();
      successCard.classList.remove("active");
      serviceInterest.value = schedulerState.service;
      preferredWindow.value = schedulerState.time;
      preferredDate.value = schedulerState.date ? formatInputDate(schedulerState.date) : "";
    }

    function animateMetricValue(element) {
      const rawValue = element.textContent.trim();
      const match = rawValue.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
      if (!match) {
        return;
      }

      const prefix = match[1];
      const target = Number(match[2]);
      const suffix = match[3];
      const duration = 1400;
      const startTime = performance.now();

      function step(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
        element.textContent = prefix + value + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = rawValue;
        }
      }

      requestAnimationFrame(step);
    }

    function setupMetricObserver() {
      if (!metricValues.length || !("IntersectionObserver" in window)) {
        return;
      }

      const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          animateMetricValue(entry.target);
          metricObserver.unobserve(entry.target);
        });
      }, { threshold: 0.55 });

      metricValues.forEach((metric) => metricObserver.observe(metric));
    }

    function setupTiltCards() {
      tiltTargets.forEach((card) => {
        card.setAttribute("data-tilt", "");
      });

      if (prefersReducedMotion.matches) {
        return;
      }

      tiltTargets.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const bounds = card.getBoundingClientRect();
          const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
          const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
          const rotateX = offsetY * -8;
          const rotateY = offsetX * 10;

          card.classList.add("tilt-active");
          card.style.transform = "perspective(1200px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
        });

        card.addEventListener("pointerleave", () => {
          card.classList.remove("tilt-active");
          card.style.transform = "";
        });
      });
    }

    function setupHeroParallax() {
      if (!hero || prefersReducedMotion.matches) {
        return;
      }

      hero.addEventListener("pointermove", (event) => {
        const bounds = hero.getBoundingClientRect();
        const ratioX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const ratioY = (event.clientY - bounds.top) / bounds.height - 0.5;

        hero.style.setProperty("--copy-shift-x", (ratioX * -10).toFixed(2) + "px");
        hero.style.setProperty("--copy-shift-y", (ratioY * -8).toFixed(2) + "px");
        hero.style.setProperty("--stage-shift-x", (ratioX * 12).toFixed(2) + "px");
        hero.style.setProperty("--stage-shift-y", (ratioY * 16).toFixed(2) + "px");
        hero.style.setProperty("--stage-rotate-x", (ratioY * -4).toFixed(2) + "deg");
        hero.style.setProperty("--stage-rotate-y", (ratioX * 6).toFixed(2) + "deg");
      });

      hero.addEventListener("pointerleave", () => {
        hero.style.removeProperty("--copy-shift-x");
        hero.style.removeProperty("--copy-shift-y");
        hero.style.removeProperty("--stage-shift-x");
        hero.style.removeProperty("--stage-shift-y");
        hero.style.removeProperty("--stage-rotate-x");
        hero.style.removeProperty("--stage-rotate-y");
      });
    }

    function updateFloatingCta() {
      if (!floatingCta) {
        return;
      }

      floatingCta.classList.toggle("is-hidden", window.scrollY < 520 || consultDrawer.classList.contains("is-open"));
    }

    function setupActiveNavigation() {
      if (!observedSections.length || !("IntersectionObserver" in window)) {
        return;
      }

      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", isActive);
          });
        });
      }, { threshold: 0.35, rootMargin: "-18% 0px -52% 0px" });

      observedSections.forEach((section) => navObserver.observe(section));
    }

    buildDayOptions();
    syncSchedulerSummary();
    setupMetricObserver();
    setupTiltCards();
    setupHeroParallax();
    setupActiveNavigation();
    updateFloatingCta();

    document.querySelectorAll("[data-service-option]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-service-option]").forEach((pill) => pill.classList.remove("active"));
        button.classList.add("active");
        schedulerState.service = button.dataset.serviceOption;
        syncSchedulerSummary();
      });
    });

    document.querySelectorAll("[data-time-option]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-time-option]").forEach((chip) => chip.classList.remove("active"));
        button.classList.add("active");
        schedulerState.time = button.dataset.timeOption;
        syncSchedulerSummary();
      });
    });

    schedulerCta.addEventListener("click", () => {
      syncSchedulerSummary();
      openDrawer();
    });

    openDrawerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        syncSchedulerSummary();
        openDrawer();
      });
    });

    closeDrawerButton.addEventListener("click", closeDrawer);
    resetDrawerButton.addEventListener("click", resetConsultForm);

    consultDrawer.addEventListener("click", (event) => {
      if (event.target === consultDrawer) {
        closeDrawer();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });

    consultForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const contactName = document.getElementById("contactName").value.trim() || "Your household";
      const requestedDate = preferredDate.value ? new Date(preferredDate.value + "T09:00:00") : schedulerState.date;
      const readableDate = requestedDate ? formatLongDate(requestedDate) : "your preferred date";

      successMessage.textContent = contactName + " is scheduled for a " + serviceInterest.value.toLowerCase() + " conversation on " + readableDate + " at " + preferredWindow.value + ". We'll use these details to guide the next step.";
      successCard.classList.add("active");
    });

    document.querySelectorAll("[data-portal-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-portal-tab]").forEach((tab) => {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        });
        document.querySelectorAll(".portal-panel").forEach((panel) => panel.classList.remove("active"));

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        const panel = document.getElementById("portal-" + button.dataset.portalTab);
        if (panel) {
          panel.classList.add("active");
        }
      });
    });

    document.querySelectorAll(".campaign-button").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".campaign-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        const config = campaignData[button.dataset.campaign];
        document.getElementById("campaignAudience").textContent = config.audience;
        document.getElementById("campaignWindow").textContent = config.window;
        document.getElementById("campaignTitle").textContent = config.title;
        document.getElementById("campaignCopy").textContent = config.copy;
        document.getElementById("campaignCta").textContent = config.cta;
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
      updateFloatingCta();
    });

    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

