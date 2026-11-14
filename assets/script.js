
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       COPYRIGHT YEAR
    ========================================= */

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* =========================================
       HEADER SHADOW
    ========================================= */

    const header = document.getElementById("header");

    function updateHeader() {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 50
        );

    }

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menu = document.getElementById("menu");
    const nav = document.getElementById("nav");

    function closeMenu() {

        if (!menu || !nav) return;

        nav.classList.remove("open");

        menu.setAttribute(
            "aria-expanded",
            "false"
        );

    }

    if (menu && nav) {

        menu.addEventListener("click", function () {

            const isOpen = nav.classList.toggle("open");

            menu.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        nav.querySelectorAll("a").forEach(link => {

            link.addEventListener(
                "click",
                closeMenu
            );

        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });

        document.addEventListener("click", event => {

            if (
                !nav.contains(event.target) &&
                !menu.contains(event.target)
            ) {
                closeMenu();
            }

        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {
                closeMenu();
            }

        });

    }


    /* =========================================
       SCROLL REVEAL ANIMATION
    ========================================= */

    const revealElements =
        document.querySelectorAll("[data-reveal]");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        "IntersectionObserver" in window &&
        !reducedMotion
    ) {

        document.body.classList.add("js-ready");

        const observer = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(entry.target);

                    }

                });

            },

            {
                threshold: 0.08
            }

        );

        revealElements.forEach(element => {

            observer.observe(element);

        });

    }


    /* =========================================
       AUTOMATIC SERVICE SELECTION
    ========================================= */

    document.querySelectorAll("[data-service]").forEach(link => {

        link.addEventListener("click", function () {

            const select = document.querySelector(
                '#contact select[name="service"]'
            );

            if (select) {

                select.value = link.dataset.service;

            }

        });

    });


    /* =========================================
       CONTACT FORM SUBMISSION
    ========================================= */

    const forms =
        document.querySelectorAll(".lead-form");

    forms.forEach(form => {

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            if (form.dataset.sending === "yes") {
                return;
            }

            if (!form.reportValidity()) {
                return;
            }

            const button = form.querySelector(
                'button[type="submit"]'
            );

            const status = form.querySelector(
                ".lead-status"
            );

            if (!button || !status) {
                return;
            }

            status.textContent = "";

            const data = new FormData(form);

            [
                "name",
                "email",
                "phone",
                "service",
                "message"
            ].forEach(key => {

                data.set(
                    key,
                    String(data.get(key) || "").trim()
                );

            });


            /* VALIDATION */

            if (data.get("name").length < 3) {

                status.textContent =
                    "Please enter a valid name.";

                return;

            }

            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    data.get("email")
                )
            ) {

                status.textContent =
                    "Please enter a valid email address.";

                return;

            }

            if (
                !/^[6-9][0-9]{9}$/.test(
                    data.get("phone")
                )
            ) {

                status.textContent =
                    "Please enter a valid 10-digit mobile number.";

                return;

            }

            if (!data.get("service")) {

                status.textContent =
                    "Please select an advertising format.";

                return;

            }

            if (data.get("message").length < 10) {

                status.textContent =
                    "Please enter at least 10 characters in your requirements.";

                return;

            }


            /* LOADING STATE */

            const originalText = button.innerHTML;

            form.dataset.sending = "yes";

            button.disabled = true;

            button.textContent = "Submitting...";


            try {

                const response = await fetch(

                    form.action,

                    {

                        method: "POST",

                        body: data,

                        headers: {
                            "Accept": "application/json"
                        }

                    }

                );

                const result = await response.json();


                /* SUCCESS REDIRECT */

                if (
                    response.ok &&
                    result.status === "success"
                ) {

                    window.location.assign(
                        "thankyou.html"
                    );

                    return;

                }


                /* SERVER ERROR */

                throw new Error(

                    result.message ||
                    "Unable to submit your enquiry."

                );

            } catch (error) {

                status.textContent =

                    error instanceof SyntaxError

                        ? "Server error. Please try again."

                        : error.message ||
                          "Unable to submit. Please try again.";

                button.disabled = false;

                button.innerHTML = originalText;

                delete form.dataset.sending;

            }

        });

    });


    /* RESET FORM ON BACK NAVIGATION */

    window.addEventListener("pageshow", event => {

        if (
            event.persisted &&
            document.querySelector(
                '[data-sending="yes"]'
            )
        ) {

            window.location.reload();

        }

    });

});
