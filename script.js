const whatsappNumber = "201000000000"; // اكتب 20 ثم رقم الواتساب بدون صفر في البداية
const adminPassword = "1234"; // الرقم السري لدخول الإدارة (غيّره لأي رقم تحبه)

const defaultProducts = [
  {
    id: 1,
    name: "سماعة بلوتوث لاسلكية",
    price: 950,
    category: "إلكترونيات",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
  },
  {
    id: 2,
    name: "ساعة يد كلاسيك",
    price: 1350,
    category: "إكسسوارات",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
  },
  {
    id: 3,
    name: "تيشيرت قطن",
    price: 400,
    category: "ملابس",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"
  }
];

function initAhmedStore() {
  let isAdmin = sessionStorage.getItem("ahmed_store_admin") === "true";
  let products = isAdmin
    ? (JSON.parse(localStorage.getItem("ahmed_store_draft")) || [...defaultProducts])
    : [...defaultProducts];

  let cart = [];
  let currentCategory = "all";

  const productsGrid = document.getElementById("products-grid");
  const cartCount = document.getElementById("cart-count");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartModal = document.getElementById("cart-modal");
  const adminPanel = document.getElementById("admin-panel");

  if (isAdmin) {
    adminPanel.classList.remove("hidden");
  }

  function renderProducts() {
    productsGrid.innerHTML = "";
    const filtered = currentCategory === "all"
      ? products
      : products.filter(p => p.category === currentCategory);

    filtered.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300x200?text=Ahmed+Store'">
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">${product.price} جنيه</p>
          <div class="card-actions">
            <button class="btn btn-primary full-width" onclick="buyNow(${product.id})">اطلب الآن</button>
            <button class="btn btn-outline" onclick="addToCart(${product.id})" title="أضف للسلة">+ 🛒</button>
            ${isAdmin ? `<button class="btn btn-danger" onclick="deleteProduct(${product.id})">حذف</button>` : ""}
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  // ضغط الصورة المختارة من الجهاز لتعمل بسلاسة داخل المتجر
  function compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const maxWidth = 500;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // إضافة منتج جديد (للإدارة فقط)
  document.getElementById("add-product-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!isAdmin) return;

    const fileInput = document.getElementById("p-image-file");
    if (!fileInput.files[0]) return alert("من فضلك اختر صورة للمنتج.");

    const compressedImg = await compressImage(fileInput.files[0]);

    const newProduct = {
      id: Date.now(),
      name: document.getElementById("p-name").value.trim(),
      price: Number(document.getElementById("p-price").value),
      category: document.getElementById("p-category").value,
      image: compressedImg
    };

    products.push(newProduct);
    localStorage.setItem("ahmed_store_draft", JSON.stringify(products));
    renderProducts();
    this.reset();
    alert("تم إضافة المنتج! لا تنسَ الضغط على زر (تحميل ملف script.js) ورفعه على GitHub ليظهر لكل العملاء.");
  });

  window.deleteProduct = function (id) {
    if (!isAdmin) return;
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    products = products.filter(p => p.id !== id);
    localStorage.setItem("ahmed_store_draft", JSON.stringify(products));
    renderProducts();
  };

  // تحميل ملف script.js جاهز للنشر على GitHub
  document.getElementById("download-script-btn").addEventListener("click", () => {
    const fileContent =
      `const whatsappNumber = ${JSON.stringify(whatsappNumber)};\n` +
      `const adminPassword = ${JSON.stringify(adminPassword)};\n\n` +
      `const defaultProducts = ${JSON.stringify(products, null, 2)};\n\n` +
      `${initAhmedStore.toString()}\n\n` +
      `initAhmedStore();\n`;

    const blob = new Blob([fileContent], { type: "application/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "script.js";
    link.click();
  });

  // السلة والطلب
  window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
  };

  window.buyNow = function (id) {
    window.addToCart(id);
    cartModal.classList.remove("hidden");
  };

  window.removeFromCart = function (id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>السلة فارغة حالياً.</p>";
    } else {
      cart.forEach(item => {
        total += item.price * item.qty;
        cartItemsContainer.innerHTML += `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <p>${item.price} جنيه × ${item.qty}</p>
            </div>
            <div>
              <strong>${item.price * item.qty} جنيه</strong>
              <button class="remove-item-btn" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
          </div>
        `;
      });
    }
    cartTotal.textContent = total;
  }

  // إرسال الطلب على واتساب
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) return alert("السلة فارغة! اختر منتجاً أولاً.");

    const customerName = document.getElementById("c-name").value.trim();
    const customerPhone = document.getElementById("c-phone").value.trim();
    const customerAddress = document.getElementById("c-address").value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
      return alert("من فضلك اكتب الاسم ورقم الموبايل والعنوان بالتفصيل لإتمام الطلب.");
    }

    let message = "🛍️ *طلب جديد من Ahmed Store*\n\n";
    message += "👤 *بيانات العميل:*\n";
    message += `• الاسم: ${customerName}\n`;
    message += `• الموبايل: ${customerPhone}\n`;
    message += `• العنوان: ${customerAddress}\n\n`;
    message += "📦 *المنتجات المطلوبة:*\n";

    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      message += `${index + 1}- ${item.name} (الكمية: ${item.qty}) = ${itemTotal} جنيه\n`;
    });

    message += `\n💰 *الإجمالي: ${total} جنيه*`;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");

    cart = [];
    updateCartUI();
    cartModal.classList.add("hidden");
  });

  // أزرار التحكم ودخول الإدارة
  document.getElementById("admin-login-btn").addEventListener("click", () => {
    const pass = prompt("أدخل الرقم السري لإدارة المتجر:");
    if (pass === adminPassword) {
      isAdmin = true;
      sessionStorage.setItem("ahmed_store_admin", "true");
      localStorage.setItem("ahmed_store_draft", JSON.stringify(products));
      adminPanel.classList.remove("hidden");
      renderProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (pass !== null) {
      alert("الرقم السري غير صحيح!");
    }
  });

  document.getElementById("logout-admin-btn").addEventListener("click", () => {
    isAdmin = false;
    sessionStorage.removeItem("ahmed_store_admin");
    adminPanel.classList.add("hidden");
    renderProducts();
  });

  document.getElementById("cart-btn").addEventListener("click", () => {
    updateCartUI();
    cartModal.classList.remove("hidden");
  });

  document.getElementById("close-cart-btn").addEventListener("click", () => {
    cartModal.classList.add("hidden");
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active").classList.remove("active");
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });

  renderProducts();
}

initAhmedStore();