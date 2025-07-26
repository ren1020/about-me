// ページフェード効果
document.addEventListener("DOMContentLoaded", function () {
  // ページ読み込み完了時にloadedクラスを追加
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  // すべてのリンクにフェードアウト効果を追加
  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {
    // 外部リンクや特殊なリンクは除外
    if (
      link.href.startsWith("http") &&
      !link.href.includes(window.location.hostname)
    ) {
      return; // 外部リンクはスキップ
    }
    if (link.href.startsWith("mailto:")) {
      return; // メールリンクはスキップ
    }
    if (link.getAttribute("target") === "_blank") {
      return; // 新しいタブで開くリンクはスキップ
    }

    link.addEventListener("click", function (e) {
      // 同じページ内のリンク（#付き）は除外
      if (
        this.href.includes("#") &&
        this.href.split("#")[0] === window.location.href.split("#")[0]
      ) {
        return;
      }

      e.preventDefault();
      const href = this.href;

      // フェードアウト効果
      document.body.classList.add("page-fade-out");

      // 少し遅れてページを移動
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });
});

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

// 画像ギャラリーのモーダル機能（hobby.html、cat.htmlで使用）
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
        // hobby.htmlの場合とcat.htmlの場合で異なるコンテナを探す
        const hobbyGallery = this.closest(".hobby-card");
        const catGallery = this.closest(".cat-category");

        if (hobbyGallery) {
          // hobby.htmlの場合
          currentImages = Array.from(
            hobbyGallery.querySelectorAll(".gallery-image")
          );
        } else if (catGallery) {
          // cat.htmlの場合：同じカテゴリ内の画像を取得
          currentImages = Array.from(
            catGallery.querySelectorAll(".gallery-image")
          );
        } else {
          // その他の場合：全ての画像を対象にする
          currentImages = Array.from(
            document.querySelectorAll(".gallery-image")
          );
        }

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
