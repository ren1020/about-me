// ===========================================
// 🐾 肉球カーソルシステム（デュアルカーソル対応）
// ===========================================

document.addEventListener("DOMContentLoaded", function () {
  const pawCursor = new PawCursor();

  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    const navLinks = document.querySelectorAll(".nav-menu a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    if (
      link.href.startsWith("http") &&
      !link.href.includes(window.location.hostname)
    ) {
      return;
    }
    if (link.href.startsWith("mailto:")) {
      return;
    }
    if (link.getAttribute("target") === "_blank") {
      return;
    }

    link.addEventListener("click", function (e) {
      if (
        this.href.includes("#") &&
        this.href.split("#")[0] === window.location.href.split("#")[0]
      ) {
        return;
      }

      e.preventDefault();
      const href = this.href;
      document.body.classList.add("page-fade-out");
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const captionText = document.getElementById("caption");

  if (modal) {
    let currentImageIndex = 0;
    let currentImages = [];
    let originThumb = null;

    function getCenteredRect(naturalW, naturalH) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.min(vw - 40, 900);
      const maxH = Math.min(vh - 80, Math.floor(vh * 0.85));
      const ratio = naturalW && naturalH ? naturalW / naturalH : 1;
      let targetW = maxW;
      let targetH = Math.round(targetW / ratio);
      if (targetH > maxH) {
        targetH = maxH;
        targetW = Math.round(targetH * ratio);
      }
      const left = Math.round((vw - targetW) / 2);
      const top = Math.round((vh - targetH) / 2);
      return { left, top, width: targetW, height: targetH };
    }

    function applyRectToModalImage(rect) {
      if (!modalImg) return;
      modalImg.style.position = "fixed";
      modalImg.style.left = rect.left + "px";
      modalImg.style.top = rect.top + "px";
      modalImg.style.width = rect.width + "px";
      modalImg.style.height = rect.height + "px";
      modalImg.style.maxWidth = "none";
      modalImg.style.maxHeight = "none";
      modalImg.style.margin = "0";
      modalImg.style.objectFit = "contain";
      modalImg.style.animation = "none";
      modalImg.style.transition =
        "left .35s ease, top .35s ease, width .35s ease, height .35s ease, transform .35s ease";
      modal.classList.add("inline-mode");
      updateCaptionRect(rect);
      updateNavPositions(rect);
    }

    function updateCaptionRect(rect) {
      if (!captionText) return;
      captionText.style.position = "fixed";
      captionText.style.left = rect.left + "px";
      captionText.style.top = rect.top + rect.height + 8 + "px";
      captionText.style.width = rect.width + "px";
      captionText.style.maxWidth = rect.width + "px";
      captionText.style.bottom = "auto";
      captionText.style.transform = "none";
    }

    function updateNavPositions(rect) {
      if (!prevBtn || !nextBtn) return;
      const vw = window.innerWidth;
      const margin = 8;
      const centerY = Math.round(rect.top + rect.height / 2);

      const prevW = prevBtn.offsetWidth || 44;
      const nextW = nextBtn.offsetWidth || 44;

      let prevLeft = Math.round(rect.left - prevW - 12);
      let nextLeft = Math.round(rect.left + rect.width + 12);

      if (prevLeft < margin) prevLeft = Math.max(rect.left + 8, margin);
      if (nextLeft + nextW > vw - margin)
        nextLeft = Math.max(
          rect.left + rect.width - nextW - 8,
          vw - nextW - margin
        );

      [prevBtn, nextBtn].forEach((btn) => {
        btn.style.position = "fixed";
        btn.style.top = centerY + "px";
        btn.style.transform = "translateY(-50%)";
        btn.style.right = "auto";
        btn.style.zIndex = 1001;
      });

      prevBtn.style.left = prevLeft + "px";
      nextBtn.style.left = nextLeft + "px";
    }

    const galleryImages = document.querySelectorAll(".gallery-image");
    galleryImages.forEach((img) => {
      img.addEventListener("click", function () {
        const hobbyGallery = this.closest(".hobby-card");
        const catGallery = this.closest(".cat-category");

        if (hobbyGallery) {
          currentImages = Array.from(
            hobbyGallery.querySelectorAll(".gallery-image")
          );
        } else if (catGallery) {
          currentImages = Array.from(
            catGallery.querySelectorAll(".gallery-image")
          );
        } else {
          currentImages = Array.from(
            document.querySelectorAll(".gallery-image")
          );
        }

        currentImageIndex = currentImages.indexOf(this);
        originThumb = this;

        const startRect = this.getBoundingClientRect();
        modal.style.display = "block";

        modalImg.src = this.src;
        captionText.textContent =
          this.getAttribute("data-caption") || this.alt || "";

        applyRectToModalImage({
          left: startRect.left,
          top: startRect.top,
          width: startRect.width,
          height: startRect.height,
        });

        const goCenter = () => {
          const target = getCenteredRect(
            modalImg.naturalWidth,
            modalImg.naturalHeight
          );
          requestAnimationFrame(() => applyRectToModalImage(target));
        };
        if (modalImg.complete) {
          goCenter();
        } else {
          modalImg.onload = goCenter;
        }
      });
    });

    function hideModalWithReverse() {
      if (!originThumb) {
        hideModal();
        return;
      }
      const endRect = originThumb.getBoundingClientRect();
      applyRectToModalImage({
        left: endRect.left,
        top: endRect.top,
        width: endRect.width,
        height: endRect.height,
      });
      const onEnd = () => {
        modalImg.removeEventListener("transitionend", onEnd);
        hideModal();
      };
      modalImg.addEventListener("transitionend", onEnd);
    }

    function hideModal() {
      modal.style.display = "none";
      modal.classList.remove("inline-mode");
      if (modalImg) {
        modalImg.style = "";
      }
      originThumb = null;
    }

    function showPrevImage() {
      if (!currentImages.length) return;
      currentImageIndex =
        (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      const prevImg = currentImages[currentImageIndex];
      originThumb = prevImg;
      captionText.textContent =
        prevImg.getAttribute("data-caption") || prevImg.alt || "";
      const applyAfterLoad = () => {
        const target = getCenteredRect(
          modalImg.naturalWidth,
          modalImg.naturalHeight
        );
        applyRectToModalImage(target);
      };
      modalImg.onload = () => {
        applyAfterLoad();
      };
      modalImg.src = prevImg.src;
      if (modalImg.complete) {
        applyAfterLoad();
      }
    }

    function showNextImage() {
      if (!currentImages.length) return;
      currentImageIndex = (currentImageIndex + 1) % currentImages.length;
      const nextImg = currentImages[currentImageIndex];
      originThumb = nextImg;
      captionText.textContent =
        nextImg.getAttribute("data-caption") || nextImg.alt || "";
      const applyAfterLoad = () => {
        const target = getCenteredRect(
          modalImg.naturalWidth,
          modalImg.naturalHeight
        );
        applyRectToModalImage(target);
      };
      modalImg.onload = () => {
        applyAfterLoad();
      };
      modalImg.src = nextImg.src;
      if (modalImg.complete) {
        applyAfterLoad();
      }
    }

    window.addEventListener("resize", () => {
      if (modal.style.display === "block") {
        const target = getCenteredRect(
          modalImg.naturalWidth,
          modalImg.naturalHeight
        );
        applyRectToModalImage(target);
      }
    });

    if (closeModal) {
      closeModal.addEventListener("click", hideModalWithReverse);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrevImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showNextImage();
      });
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        hideModalWithReverse();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (modal.style.display === "block") {
        if (e.key === "Escape") {
          hideModalWithReverse();
        } else if (e.key === "ArrowLeft") {
          showPrevImage();
        } else if (e.key === "ArrowRight") {
          showNextImage();
        }
      }
    });
  }
});

// ===========================================
// 🐾 デュアルカーソルシステム（肉球＋デフォルト）
// ===========================================
class PawCursor {
  constructor() {
    this.cursor = null;
    this.lastPawTime = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.init();
  }

  init() {
    this.cursor = document.createElement("div");
    this.cursor.className = "cat-cursor";
    this.cursor.innerHTML = "🐾";
    this.cursor.style.cssText = `
      position: fixed;
      top: -50px;
      left: -50px;
      font-size: 1.8rem;
      pointer-events: none;
      z-index: 99999;
      transition: transform 0.15s ease, opacity 0.3s ease;
      filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.6));
      user-select: none;
      opacity: 1;
    `;

    // 変換された祖先の影響を受けないよう<html>直下に配置
    document.documentElement.appendChild(this.cursor);

    this.lastMouseX = 0;
    this.lastMouseY = 0;

    document.addEventListener("mousemove", (e) => {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.updateCursorPosition(this.lastMouseX, this.lastMouseY);
      this.createPawTrail(this.lastMouseX, this.lastMouseY);
    });

    // スクロールやホイールで画面が動いても直近座標で再配置
    window.addEventListener(
      "scroll",
      () => this.updateCursorPosition(this.lastMouseX, this.lastMouseY),
      { passive: true }
    );
    window.addEventListener(
      "wheel",
      () => this.updateCursorPosition(this.lastMouseX, this.lastMouseY),
      { passive: true }
    );
    document.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches && e.touches[0];
        if (t) {
          this.lastMouseX = t.clientX;
          this.lastMouseY = t.clientY;
          this.updateCursorPosition(this.lastMouseX, this.lastMouseY);
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      if (this.cursor) {
        this.cursor.style.opacity = "0";
      }
    });

    document.addEventListener("mouseenter", () => {
      if (this.cursor) {
        this.cursor.style.opacity = "1";
      }
    });

    document.addEventListener("mouseover", (e) => {
      if (this.isInteractiveElement(e.target)) {
        this.cursor.classList.add("hover");
        this.cursor.style.transform = "scale(1.4)";
        this.cursor.style.filter =
          "drop-shadow(0 0 18px rgba(255, 0, 150, 0.8))";
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (this.isInteractiveElement(e.target)) {
        this.cursor.classList.remove("hover");
        this.cursor.style.transform = "scale(1)";
        this.cursor.style.filter =
          "drop-shadow(0 0 12px rgba(0, 255, 255, 0.6))";
      }
    });

    document.addEventListener("mousedown", () => {
      this.cursor.classList.add("click");
      this.cursor.style.transform = "scale(0.9)";
      this.cursor.style.filter = "drop-shadow(0 0 20px rgba(0, 255, 0, 0.9))";
    });

    document.addEventListener("mouseup", () => {
      this.cursor.classList.remove("click");
      this.cursor.style.transform = "scale(1)";
      this.cursor.style.filter = "drop-shadow(0 0 12px rgba(0, 255, 255, 0.6))";
    });
  }

  updateCursorPosition(x, y) {
    if (this.cursor) {
      this.cursor.style.left = x + 15 + "px";
      this.cursor.style.top = y + 15 + "px";
      this.cursor.style.transform = this.cursor.style.transform || "scale(1)";
    }
  }

  isInteractiveElement(element) {
    const interactiveTags = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"];
    return (
      interactiveTags.includes(element.tagName) ||
      element.classList.contains("gallery-image") ||
      element.classList.contains("hobby-card") ||
      element.classList.contains("fact-card") ||
      element.classList.contains("hamburger")
    );
  }

  createPawTrail(x, y) {
    const now = Date.now();
    if (now - this.lastPawTime > 200) {
      const paw = document.createElement("div");
      paw.className = "cat-paw-trail";
      paw.innerHTML = "🐾";
      paw.style.cssText = `
        position: fixed;
        left: ${x - 12}px;
        top: ${y - 12}px;
        font-size: 1.2rem;
        pointer-events: none;
        z-index: 99998;
        opacity: 0.8;
        filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.5));
        user-select: none;
        animation: pawTrailFade 1.5s ease-out forwards;
        transform: rotate(${Math.random() * 30 - 15}deg);
      `;

      // 変換された祖先の影響を受けないよう<html>直下に配置
      document.documentElement.appendChild(paw);

      setTimeout(() => {
        if (paw.parentNode) {
          paw.parentNode.removeChild(paw);
        }
      }, 1500);

      this.lastPawTime = now;
    }
  }
}
