(function () {
  "use strict";

  var WHATSAPP_NUMBER = "263772909417";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var isPhone = window.matchMedia("(max-width: 860px)").matches;

  // Hero video: phone-sized file on phones; skipped entirely for reduced motion or data saver (the poster image shows instead).
  var hero = document.querySelector(".hero-video");
  if (hero && !reduceMotion && !saveData) {
    hero.src = isPhone ? hero.dataset.srcMobile : hero.dataset.srcDesktop;
    hero.play().catch(function () {});
  }

  // Section loops: load and play only while on screen, pause when scrolled away.
  var loops = document.querySelectorAll("video.loop");
  if (!reduceMotion && !saveData && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; }
          v.play().catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.15 });
    loops.forEach(function (v) { io.observe(v); });
  }

  // Only one video plays at a time: starting the tour pauses the loops.
  var tour = document.querySelector(".tour-video");
  if (tour) {
    tour.addEventListener("play", function () {
      loops.forEach(function (v) { v.pause(); });
      if (hero) { hero.pause(); }
    });
  }

  // Header turns solid once you scroll past the hero.
  var header = document.getElementById("header");
  var heroSection = document.querySelector(".hero");
  function onScroll() {
    var limit = heroSection ? heroSection.offsetHeight - 80 : 400;
    header.classList.toggle("is-solid", window.scrollY > limit);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Phone menu.
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  function closeMenu() {
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); } });

  // "Ask about ..." buttons preselect the package in the form.
  var form = document.getElementById("enquiry-form");
  document.querySelectorAll("[data-package]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      form.elements["package"].value = btn.dataset.package;
    });
  });

  // Enquiry form: checks the essentials, then opens WhatsApp with the details filled in.
  var errorBox = document.getElementById("form-error");
  form.addEventListener("input", function (e) {
    e.target.removeAttribute("aria-invalid");
    errorBox.hidden = true;
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var missing = [];
    if (!f.names.value.trim()) { missing.push(f.names); }
    if (!f.phone.value.trim()) { missing.push(f.phone); }
    if (missing.length) {
      missing.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });
      errorBox.textContent = "Add your names and a WhatsApp number so we can reply.";
      errorBox.hidden = false;
      missing[0].focus();
      return;
    }
    var lines = [
      "Hello Swan Creek, I'd like to enquire about a 2027 wedding.",
      "",
      "Names: " + f.names.value.trim(),
      "WhatsApp: " + f.phone.value.trim(),
      "Package: " + f["package"].value,
      "Preferred date: " + (f.date.value.trim() || "Flexible"),
      "Estimated guests: " + (f.guests.value.trim() || "Not sure yet"),
      "Planning from: " + f.from.value
    ];
    if (f.notes.value.trim()) { lines.push("", f.notes.value.trim()); }
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");
  });
})();
