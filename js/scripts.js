// ハンバーガーメニューの動作
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // メニュー項目をクリックしたらメニューを閉じる
    const navLinks = document.querySelectorAll(".nav-menu a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
});

// 画像ギャラリーのモーダル機能（hobby.htmlで使用）
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const captionText = document.getElementById("caption");

  if (modal) {
    let currentImageIndex = 0;
    let currentImages = [];

    // 画像をクリックしたときの処理
    const galleryImages = document.querySelectorAll(".gallery-image");
    galleryImages.forEach((img) => {
      img.addEventListener("click", function () {
        const gallery = this.closest(".hobby-card");
        currentImages = Array.from(gallery.querySelectorAll(".gallery-image"));
        currentImageIndex = currentImages.indexOf(this);
        showModal(this.src, this.alt);
      });
    });

    function showModal(src, alt) {
      modal.style.display = "block";
      modalImg.src = src;
      captionText.innerHTML = alt;

      // ナビゲーションボタンの表示/非表示
      if (currentImages.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
      } else {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
      }
    }

    function hideModal() {
      modal.style.display = "none";
    }

    function showPrevImage() {
      if (currentImages.length > 0) {
        currentImageIndex =
          (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        modalImg.src = currentImages[currentImageIndex].src;
        captionText.innerHTML = currentImages[currentImageIndex].alt;
      }
    }

    function showNextImage() {
      if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        modalImg.src = currentImages[currentImageIndex].src;
        captionText.innerHTML = currentImages[currentImageIndex].alt;
      }
    }

    // イベントリスナー
    if (closeModal) {
      closeModal.addEventListener("click", hideModal);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", showPrevImage);
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", showNextImage);
    }

    // モーダルの背景をクリックして閉じる
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        hideModal();
      }
    });

    // ESCキー、左右矢印キーでモーダル操作
    document.addEventListener("keydown", function (e) {
      if (modal.style.display === "block") {
        if (e.key === "Escape") {
          hideModal();
        } else if (e.key === "ArrowLeft") {
          showPrevImage();
        } else if (e.key === "ArrowRight") {
          showNextImage();
        }
      }
    });
  }
});
