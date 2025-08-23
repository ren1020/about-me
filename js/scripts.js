// ===========================================
// 🐾 肉球カーソルシステム（デュアルカーソル対応）
// ===========================================

// 統合されたDOMContentLoaded処理
document.addEventListener("DOMContentLoaded", function () {
  // 🐾 肉球カーソルシステムを初期化
  const pawCursor = new PawCursor();

  // ページ読み込み完了時にloadedクラスを追加
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  // ハンバーガーメニューの動作
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

  // 画像ギャラリーのモーダル機能（hobby.html、cat.htmlで使用）
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const captionText = document.getElementById("caption");

  if (modal) {
    let currentImageIndex = 0;
    let currentImages = [];
    let originThumb = null; // クリック元

    // サムネの中心を保ったまま拡大するためのターゲット矩形を計算
    function getTargetRectFromThumb(thumb, naturalW, naturalH) {
      const rect = thumb.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.min(vw - 40, 900);
      const maxH = Math.min(vh - 80, Math.floor(vh * 0.85));

      // 画像比率を保ってフィット
      const ratio =
        naturalW && naturalH ? naturalW / naturalH : rect.width / rect.height;
      let targetW = maxW;
      let targetH = Math.round(targetW / ratio);
      if (targetH > maxH) {
        targetH = maxH;
        targetW = Math.round(targetH * ratio);
      }

      // 中心を維持したまま配置（画面外にはみ出しにくいようにクリップ）
      let left = Math.round(centerX - targetW / 2);
      let top = Math.round(centerY - targetH / 2);
      left = Math.max(20, Math.min(left, vw - targetW - 20));
      top = Math.max(20, Math.min(top, vh - targetH - 20));

      return { left, top, width: targetW, height: targetH };
    }

    // 表示中のビューポート中央に配置するターゲット矩形
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
      // CSSの既定値を無効化
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
      captionText.style.bottom = "auto"; // CSSのbottom指定を打ち消す
      captionText.style.transform = "none";
    }

    function updateNavPositions(rect) {
      if (!prevBtn || !nextBtn) return;
      const vw = window.innerWidth;
      const margin = 8;
      const centerY = Math.round(rect.top + rect.height / 2);

      // 事前にサイズ取得（未描画時のフォールバック）
      const prevW = prevBtn.offsetWidth || 44;
      const nextW = nextBtn.offsetWidth || 44;

      // 基本は画像の外側に配置
      let prevLeft = Math.round(rect.left - prevW - 12);
      let nextLeft = Math.round(rect.left + rect.width + 12);

      // はみ出し時は画像内側へクランプ
      if (prevLeft < margin) prevLeft = Math.max(rect.left + 8, margin);
      if (nextLeft + nextW > vw - margin)
        nextLeft = Math.max(
          rect.left + rect.width - nextW - 8,
          vw - nextW - margin
        );

      // 共通スタイル
      [prevBtn, nextBtn].forEach((btn) => {
        btn.style.position = "fixed";
        btn.style.top = centerY + "px";
        btn.style.transform = "translateY(-50%)";
        btn.style.right = "auto"; // 既定のrightを打ち消す
        btn.style.zIndex = 1001;
      });

      prevBtn.style.left = prevLeft + "px";
      nextBtn.style.left = nextLeft + "px";
    }

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
          // その他の場合：全ての画像を取得
          currentImages = Array.from(
            document.querySelectorAll(".gallery-image")
          );
        }

        currentImageIndex = currentImages.indexOf(this);
        originThumb = this;

        // 最初はサムネと同じ位置・サイズから開始
        const startRect = this.getBoundingClientRect();
        modal.style.display = "block";
        // スクロールは許可する（body の overflow は変更しない）

        modalImg.src = this.src;
        captionText.textContent =
          this.getAttribute("data-caption") || this.alt || "";

        // 初期位置を適用
        applyRectToModalImage({
          left: startRect.left,
          top: startRect.top,
          width: startRect.width,
          height: startRect.height,
        });

        // 画像ロード後、ビューポート中央へアニメーション
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
      // トランジション終了後に非表示
      const onEnd = () => {
        modalImg.removeEventListener("transitionend", onEnd);
        hideModal();
      };
      modalImg.addEventListener("transitionend", onEnd);
    }

    function hideModal() {
      modal.style.display = "none";
      // body のスクロール制御は行わない
      modal.classList.remove("inline-mode");
      // リセット
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

    // ウィンドウサイズ変更時はビューポート中央に再配置
    window.addEventListener("resize", () => {
      if (modal.style.display === "block") {
        const target = getCenteredRect(
          modalImg.naturalWidth,
          modalImg.naturalHeight
        );
        applyRectToModalImage(target);
      }
    });

    // モーダルを閉じる
    if (closeModal) {
      closeModal.addEventListener("click", hideModalWithReverse);
    }

    // 前の画像
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrevImage();
      });
    }

    // 次の画像
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showNextImage();
      });
    }

    // モーダルの背景をクリックしたら閉じる
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        hideModalWithReverse();
      }
    });

    // キーボードでの操作
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
    console.log("🐾 肉球カーソルシステム初期化中...");
    console.log("📍 デフォルトカーソルと肉球カーソルの両方が表示されます");

    // 肉球カーソル要素を作成
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

    document.body.appendChild(this.cursor);
    console.log("🐾 肉球カーソル要素を作成しました");

    // マウス座標を保持する変数
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // マウス移動イベント
    document.addEventListener("mousemove", (e) => {
      // ビューポート座標を使用（position: fixedに最適）
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.updateCursorPosition(this.lastMouseX, this.lastMouseY);
      this.createPawTrail(this.lastMouseX, this.lastMouseY);
    });

    // マウスがページから離れた時の処理
    document.addEventListener("mouseleave", () => {
      if (this.cursor) {
        this.cursor.style.opacity = "0";
      }
    });

    // マウスがページに戻った時の処理
    document.addEventListener("mouseenter", () => {
      if (this.cursor) {
        this.cursor.style.opacity = "1";
      }
    });

    // マウスエンター（ホバー）イベント
    document.addEventListener("mouseover", (e) => {
      if (this.isInteractiveElement(e.target)) {
        this.cursor.classList.add("hover");
        this.cursor.style.transform = "scale(1.4)";
        this.cursor.style.filter =
          "drop-shadow(0 0 18px rgba(255, 0, 150, 0.8))";
      }
    });

    // マウスリーブイベント
    document.addEventListener("mouseout", (e) => {
      if (this.isInteractiveElement(e.target)) {
        this.cursor.classList.remove("hover");
        this.cursor.style.transform = "scale(1)";
        this.cursor.style.filter =
          "drop-shadow(0 0 12px rgba(0, 255, 255, 0.6))";
      }
    });

    // マウスクリックイベント
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

    console.log("🐾 肉球カーソルイベントリスナーを設定しました");
  }

  updateCursorPosition(x, y) {
    if (this.cursor) {
      // 肉球をマウスポインターの右下に少しずらして配置
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
    // 足跡は200ms間隔で作成（より頻繁に）
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

      document.body.appendChild(paw);

      // 1.5秒後に足跡を削除
      setTimeout(() => {
        if (paw.parentNode) {
          paw.parentNode.removeChild(paw);
        }
      }, 1500);

      this.lastPawTime = now;
    }
  }
}
