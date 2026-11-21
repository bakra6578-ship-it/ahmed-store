const whatsappNumber = "01095458846"; // اكتب 20 ثم رقم الواتساب بدون صفر في البداية
const adminPassword = "1234"; // الرقم السري لدخول الإدارة

const defaultProducts = [
  {
    id: 1,
    name: "كريم فاتيكا للشعر بالصبار والجرجير لتغذية وحماية الشعر (210 مل)",
    price: 85,
    oldPrice: 105,
    category: "كريمات الشعر",
    description: "كريم تصفيف وتغذية الشعر الغني بخلاصة الصبار والجرجير والزيتون لترطيب الشعر ومنع التساقط والتقصف.",
    reviews: 184,
    bestseller: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220'><rect width='300' height='220' fill='%23f0fdf4'/><rect x='95' y='45' width='110' height='24' rx='6' fill='%2315803d'/><rect x='90' y='67' width='120' height='105' rx='16' fill='%2322c55e'/><rect x='100' y='85' width='100' height='65' rx='8' fill='%23ffffff'/><text x='150' y='113' font-family='Tahoma,Arial' font-size='16' font-weight='bold' fill='%2315803d' text-anchor='middle'>Vatika</text><text x='150' y='135' font-family='Tahoma,Arial' font-size='12' fill='%23166534' text-anchor='middle'>كريم فاتيكا للشعر</text></svg>"
  },
  {
    id: 2,
    name: "زيت شعر دابر أملا الأصلي لتقوية وتطويل الشعر (200 مل)",
    price: 95,
    oldPrice: 120,
    category: "زيوت الشعر",
    description: "زيت أملا الطبيعي الغني بمستخلص الأملا لتغذية بصيلات الشعر من الجذور حتى الأطراف وزيادة الكثافة واللمعان.",
    reviews: 230,
    bestseller: true,
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220'><rect width='300' height='220' fill='%23ecfdf5'/><rect x='132' y='25' width='36' height='22' rx='4' fill='%23ca8a04'/><path d='M125 47 L175 47 L188 85 L188 180 Q188 192 175 192 L125 192 Q112 192 112 180 L112 85 Z' fill='%23166534'/><rect x='120' y='95' width='60' height='70' rx='6' fill='%23fef08a'/><text x='150' y='125' font-family='Tahoma,Arial' font-size='15' font-weight='bold' fill='%2314532d' text-anchor='middle'>AMLA</text><text x='150' y='146' font-family='Tahoma,Arial' font-size='11' fill='%23166534' text-anchor='middle'>زيت دابر أملا</text></svg>"
  }
];

function initAhmedStore() {
  let isAdmin = sessionStorage.getItem("ahmed_store_admin") === "true";
  let products = isAdmin
    ? (JSON.parse(localStorage.getItem("ahmed_store_hair_draft")) || [...defaultProducts])
    : [...defaultProducts];

  let cart = [];
  let currentCategory = "all";
  let searchQuery = "";
  let sortBy = "featured";

  const productsGrid = document.getElementById("products-grid");
  const resultsCount = document.getElementById("results-count");
  const cartCount = document.getElementById("cart-count");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartModal = document.getElementById("cart-modal");
  const productModal = document.getElementById("product-modal");
  const adminPanel = document.getElementById("admin-panel");

  if (isAdmin) {
    adminPanel.classList.remove("hidden");
  }

  function renderProducts() {
    productsGrid.innerHTML = "";

    let filtered = products.filter(p => {
      const matchCat = currentCategory === "all" || p.category === currentCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    resultsCount.textContent = `عرض ${filtered.length} منتج${currentCategory !== "all" ? ` في قسم "${currentCategory}"` : ""}`;

    if (filtered.length === 0) {
      productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 30px; background: #fff; border-radius: 8px;">لا توجد منتجات مطابقة لبحثك حالياً.</p>`;
      return;
    }

    filtered.forEach(product => {
      const hasDiscount = product.oldPrice && product.oldPrice > product.price;
      const discountPercent = hasDiscount
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        ${product.bestseller ? `<span class="bestseller-tag">الأكثر مبيعاً</span>` : ""}
        <div>
          <div class="product-img-box" onclick="openProductDetails(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-img">
          </div>
          <span class="product-category">${product.category}</span>
          <h3 class="product-title" onclick="openProductDetails(${product.id})">${product.name}</h3>
          <div class="amz-stars">★★★★★ <span>(${product.reviews || 45})</span></div>
          <div class="price-row">
            <span class="product-price">${product.price} <small>جنيه</small></span>
            ${hasDiscount ? `<span class="old-price">${product.oldPrice} جنيه</span>` : ""}
            ${hasDiscount ? `<span class="discount-badge">خصم ${discountPercent}%</span>` : ""}
          </div>
          <p class="prime-line"><span class="prime-check">✓ توصيل سريع</span> — الدفع عند الاستلام</p>
        </div>
        <div class="card-actions">
          <button class="btn-amz-yellow full-width" onclick="addToCart(${product.id})">أضف إلى العربة</button>
          <button class="btn-amz-orange full-width" onclick="buyNow(${product.id})">اشترِ الآن</button>
          ${isAdmin ? `<button class="btn-delete-admin full-width" onclick="deleteProduct(${product.id})">🗑️ حذف المنتج</button>` : ""}
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  window.openProductDetails = function (id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("pm-image").src = product.image;
    document.getElementById("pm-category").textContent = product.category;
    document.getElementById("pm-title").textContent = product.name;
    document.getElementById("pm-rating").innerHTML = `★★★★★ <span>(${product.reviews || 45} تقييم عملاء)</span>`;
    document.getElementById("pm-price").textContent = product.price;
    document.getElementById("pm-old-price").textContent =
      product.oldPrice && product.oldPrice > product.price ? `${product.oldPrice} جنيه` : "";
    document.getElementById("pm-desc").textContent =
      product.description || "منتج أصلي عالي الجودة من Ahmed Store مع خدمة التوصيل السريع.";

    document.getElementById("pm-add-btn").onclick = () => {
      window.addToCart(product.id);
      productModal.classList.add("hidden");
    };

    document.getElementById("pm-buy-btn").onclick = () => {
      productModal.classList.add("hidden");
      window.buyNow(product.id);
    };

    productModal.classList.remove("hidden");
  };

  function compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const maxWidth = 550;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.getElementById("add-product-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!isAdmin) return;

    const fileInput = document.getElementById("p-image-file");
    if (!fileInput.files[0]) return alert("من فضلك اختر صورة للمنتج.");

    const compressedImg = await compressImage(fileInput.files[0]);
    const oldPriceVal = Number(document.getElementById("p-old-price").value);

    const newProduct = {
      id: Date.now(),
      name: document.getElementById("p-name").value.trim(),
      price: Number(document.getElementById("p-price").value),
      oldPrice: oldPriceVal > 0 ? oldPriceVal : null,
      category: document.getElementById("p-category").value,
      description: document.getElementById("p-desc").value.trim(),
      reviews: Math.floor(Math.random() * 90) + 15,
      bestseller: true,
      image: compressedImg
    };

    products.unshift(newProduct);
    localStorage.setItem("ahmed_store_hair_draft", JSON.stringify(products));
    renderProducts();
    this.reset();
    alert("تم إضافة المنتج بنجاح! اضغط على (تحميل ملف script.js المحدّث) وارفعه على GitHub ليظهر للزوار.");
  });

  window.deleteProduct = function (id) {
    if (!isAdmin) return;
    if (!confirm("هل تريد حذف هذا المنتج نهائياً؟")) return;
    products = products.filter(p => p.id !== id);
    localStorage.setItem("ahmed_store_hair_draft", JSON.stringify(products));
    renderProducts();
  };

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
      cartItemsContainer.innerHTML = "<p>عربة التسوق فارغة حالياً.</p>";
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

  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) return alert("عربة التسوق فارغة! اختر منتجاً أولاً.");

    const customerName = document.getElementById("c-name").value.trim();
    const customerPhone = document.getElementById("c-phone").value.trim();
    const customerCity = document.getElementById("c-city").value.trim();
    const customerAddress = document.getElementById("c-address").value.trim();

    if (!customerName || !customerPhone || !customerCity || !customerAddress) {
      return alert("من فضلك املأ جميع بيانات التوصيل (الاسم، الموبايل، المحافظة، والعنوان).");
    }

    let message = "🛍️ *طلب جديد من Ahmed Store*\n\n";
    message += "👤 *بيانات العميل:*\n";
    message += `• الاسم: ${customerName}\n`;
    message += `• الموبايل: ${customerPhone}\n`;
    message += `• المحافظة: ${customerCity}\n`;
    message += `• العنوان: ${customerAddress}\n\n`;
    message += "📦 *المنتجات المطلوبة:*\n";

    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      message += `${index + 1}- ${item.name} (الكمية: ${item.qty}) = ${itemTotal} جنيه\n`;
    });

    message += `\n💰 *الإجمالي المطلوب: ${total} جنيه*`;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");

    cart = [];
    updateCartUI();
    cartModal.classList.add("hidden");
  });

  function syncCategoryButtons(cat) {
    currentCategory = cat;
    document.getElementById("search-category").value = cat;
    document.querySelectorAll(".subnav-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.category === cat);
    });
    renderProducts();
  }

  document.querySelectorAll(".subnav-btn").forEach(btn => {
    btn.addEventListener("click", () => syncCategoryButtons(btn.dataset.category));
  });

  document.getElementById("search-category").addEventListener("change", (e) => {
    syncCategoryButtons(e.target.value);
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  document.getElementById("search-btn").addEventListener("click", () => {
    searchQuery = document.getElementById("search-input").value;
    renderProducts();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("sort-select").addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderProducts();
  });

  document.getElementById("admin-login-btn").addEventListener("click", () => {
    const pass = prompt("أدخل الرقم السري لإدارة المتجر:");
    if (pass === adminPassword) {
      isAdmin = true;
      sessionStorage.setItem("ahmed_store_admin", "true");
      localStorage.setItem("ahmed_store_hair_draft", JSON.stringify(products));
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

  document.getElementById("close-product-btn").addEventListener("click", () => {
    productModal.classList.add("hidden");
  });

  renderProducts();
}

initAhmedStore();