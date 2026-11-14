/* UMNNI ADVERTISING - CUSTOM JAVASCRIPT */

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("js-loaded");

  const animatedElements = document.querySelectorAll("[data-animate]");

  const animationObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        animationObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animatedElements.forEach(function (element) {
    animationObserver.observe(element);
  });

  const counters = document.querySelectorAll(".counter");

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  function runCounter(counter) {
    const target = Number(counter.getAttribute("data-target"));
    let current = 0;
    const increment = target / 90;

    function updateCounter() {
      current += increment;

      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + "+";
      }
    }

    updateCounter();
  }

  const progressBars = document.querySelectorAll(".progress-fill");

  const progressObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute("data-width");
        entry.target.style.width = width;
        progressObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  progressBars.forEach(function (bar) {
    progressObserver.observe(bar);
  });


  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const button = newsletterForm.querySelector("button");
      const oldText = button.innerHTML;

      button.innerHTML = "Done ✓";
      newsletterForm.reset();

      setTimeout(function () {
        button.innerHTML = oldText;
      }, 2200);
    });
  }

  const internalLinks = document.querySelectorAll("a[href^='#']");

  internalLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        event.preventDefault();

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});

window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  if (window.scrollY > 80) {
    navbar.classList.add("shadow-xl");
  } else {
    navbar.classList.remove("shadow-xl");
  }
});
// =====================================================
// PROCESS CARD AUTO ACTIVE ANIMATION
// 1 card orange hota hai, fir 2-3 sec baad next card.
// Previous card normal ho jata hai.
// =====================================================

const processSection = document.getElementById("process");
const processCards = document.querySelectorAll(".process-card");

let processIndex = 0;
let processStarted = false;
let processInterval;

function resetProcessCards() {
  processCards.forEach(function (card) {
    card.classList.remove(
      "bg-brandOrange",
      "shadow-orangeGlow",
      "-translate-y-3",
      "border-brandOrange"
    );

    card.classList.add(
      "bg-lightOrange",
      "border-orange-100"
    );

    card.querySelector(".process-title").classList.remove("text-white");
    card.querySelector(".process-title").classList.add("text-deepBlack");

    card.querySelector(".process-text").classList.remove("text-white");
    card.querySelector(".process-text").classList.add("text-gray-700");

    card.querySelector(".process-number").classList.remove("text-white/30");
    card.querySelector(".process-number").classList.add("text-brandOrange/25");
  });
}

function activateProcessCard(index) {
  resetProcessCards();

  const card = processCards[index];

  card.classList.remove(
    "bg-lightOrange",
    "border-orange-100"
  );

  card.classList.add(
    "bg-brandOrange",
    "shadow-orangeGlow",
    "-translate-y-3",
    "border-brandOrange"
  );

  card.querySelector(".process-title").classList.remove("text-deepBlack");
  card.querySelector(".process-title").classList.add("text-white");

  card.querySelector(".process-text").classList.remove("text-gray-700");
  card.querySelector(".process-text").classList.add("text-white");

  card.querySelector(".process-number").classList.remove("text-brandOrange/25");
  card.querySelector(".process-number").classList.add("text-white/30");
}

if (processSection && processCards.length > 0) {
  const processObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !processStarted) {
          processStarted = true;

          activateProcessCard(processIndex);

          processInterval = setInterval(function () {
            processIndex++;

            if (processIndex >= processCards.length) {
              processIndex = 0;
            }

            activateProcessCard(processIndex);
          }, 2500);
        }
      });
    },
    {
      threshold: 0.35
    }
  );

  processObserver.observe(processSection);
}
// MOBILE MENU

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// CLOSE MENU AFTER CLICK

document.querySelectorAll(".mobile-link").forEach(link => {

  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
  });

});

// PERFECT SCROLL OFFSET

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

  anchor.addEventListener("click", function (e) {

    const href = this.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);

    if (!target) return;

    e.preventDefault();

    const headerHeight = 90;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });

  });

});
/* =====================================================
   UMNNI FORM VALIDATION + AJAX SUBMIT
   This JS works for both forms because both forms use:
   class="lead-form"
===================================================== */

document.querySelectorAll(".lead-form").forEach((form, index) => {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (form.dataset.sending === "yes") return;
    clearErrors(form);

    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    const button = form.querySelector('button[type="submit"]');

    let isValid = true;

    if (!name.value.trim() || name.value.trim().length < 3) {
      showError(name, "Please enter a valid name");
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, "Please enter a valid email");
      isValid = false;
    }

    if (!/^[6-9]\d{9}$/.test(phone.value.trim())) {
      showError(phone, "Please enter a valid 10 digit mobile number");
      isValid = false;
    }

    if (
      !service.value ||
      service.value === "Choose Service" ||
      service.value === "Interested Service"
    ) {
      showError(service, "Please select a service");
      isValid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, "Please write at least 10 characters");
      isValid = false;
    }

    if (!isValid) return;

    const formData = new FormData(form);
    formData.set("form_source", index === 0 ? "Auto Advertising Hero Form" : "Auto Advertising Contact Form");

    const oldText = button.innerHTML;
    form.dataset.sending = "yes";
    button.disabled = true;
    button.innerHTML = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      const resultText = await response.text();


      const result = JSON.parse(resultText);

      if (response.ok && result.status === "success") {
        window.location.assign("thankyou.html");
        return;
      } else {
        alert(result.message);
        button.innerHTML = oldText;
        button.disabled = false;
        delete form.dataset.sending;
      }

    } catch (error) {
      console.error("Form Error:", error);
      alert("Unable to submit your enquiry. Please try again.");
      button.innerHTML = oldText;
      button.disabled = false;
        delete form.dataset.sending;
    }
  });
});

function showError(input, message) {
  input.classList.add("border-red-500");

  const error = document.createElement("p");
  error.className = "form-error text-red-600 text-sm font-semibold mt-1";
  error.innerText = message;

  input.insertAdjacentElement("afterend", error);
}

function clearErrors(form) {
  form.querySelectorAll(".form-error").forEach(error => error.remove());

  form.querySelectorAll("input, select, textarea").forEach(input => {
    input.classList.remove("border-red-500");
  });
}