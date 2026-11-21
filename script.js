// 1. بيانات المنتجات الافتراضية (لو أول مرة تفتح المتجر)
const defaultProducts = [
  {
    id: 1,
    name: "سماعة رأس لاسلكية",
    price: 850,
    category: "إلكترونيات",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
  },
  {
    id: 2,
    name: "ساعة يد كلاسيك",
    price: 1200,
    category: "إكسسوارات",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
  },
  {
    id: 3,
    name: "تيشيرت قطن أساسي",
    price: 350,
    category: "أزياء",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"
  }
];

// استرجاع المنتجات المحفوظة في المتصفح أو استخدام الافتراضية
let products = JSON.parse(localStorage.getItem("store_products")) || defaultProducts;
let cart = [];
let currentCategory = "all";

// 2. الإمساك بعناصر الصفحة (DOM Elements)
const productsGrid = document.getElementById("products-grid");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartModal = document.getElementById("cart-modal");
const adminPanel = document.getElementById("admin-panel");

// 3. دالة عرض المنتجات على الشاشة
function renderProducts() {
  productsGrid.innerHTML = "";

  // فلترة المنتجات حسب القسم المختار
  const filtered = currentCategory === "all"
    ? products
    : products.filter(p => p.category === currentCategory);

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">${product.price} ج.م</p>
        <div class="card-actions">
          <button class="btn btn-primary full-width" onclick="addToCart(${product.id})">أضف للسلة</button>
          <button class="btn btn-danger" onclick="deleteProduct(${product.id})">حذف</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// 4. إضافة منتج جديد من الفورم
document.getElementById("add-product-form").addEventListener("submit", function (e) {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const name = document.getElementById("p-name").value;
  const price = Number(document.getElementById("p-price").value);
  const category = document.getElementById("p-category").value;
  const image = document.getElementById("p-image").value || "https://via.placeholder.com/300x180?text=Product";

  const newProduct = {
    id: Date.now(), // رقم تعريفي فريد
    name,
    price,
    category,
    image
  };

  products.push(newProduct);
  saveAndRender();
  this.reset(); // تفريغ خانات الفورم
});

// 5. حذف منتج
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  saveAndRender();
}

// حفظ المنتجات في المتصفح وإعادة رسمها
function saveAndRender() {
  localStorage.setItem("store_products", JSON.stringify(products));
  renderProducts();
}

// 6. إدارة سلة المشتريات
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  // تحديث عداد السلة
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;

  // عرض المنتجات داخل السلة
  cartItemsContainer.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>السلة فارغة حالياً.</p>";
  } else {
    cart.forEach(item => {
      totalPrice += item.price * item.qty;
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <p>${item.price} ج.م × ${item.qty}</p>
          </div>
          <strong>${item.price * item.qty} ج.م</strong>
        </div>
      `;
    });
  }

  cartTotal.textContent = totalPrice;
}

// 7. التحكم في الأزرار والنوافذ
document.getElementById("toggle-admin-btn").addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
});

document.getElementById("cart-btn").addEventListener("click", () => {
  updateCartUI();
  cartModal.classList.remove("hidden");
});

document.getElementById("close-cart-btn").addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) return alert("السلة فارغة!");
  alert("تم استلام طلبك بنجاح! شكراً لتسوقك معنا.");
  cart = [];
  updateCartUI();
  cartModal.classList.add("hidden");
});

// أزرار الفلترة
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

// تشغيل المتجر عند فتح الصفحة
renderProducts();