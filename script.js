import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. إعدادات المتجر (اكتب 20 ثم رقم الواتساب بدون صفر في البداية)
const whatsappNumber = "201095458846"
const adminPassword = "1234"; // الرقم السري لدخول الإدارة

// 2. بيانات مشروعك على Firebase (جاهزة ومربوطة)
const firebaseConfig = {
  apiKey: "AIzaSyByqiCKaCltrl1hDL5aNL1b719nSps_JS4",
  authDomain: "ahmed-store-563e8.firebaseapp.com",
  projectId: "ahmed-store-563e8",
  storageBucket: "ahmed-store-563e8.firebasestorage.app",
  messagingSenderId: "14860819332",
  appId: "1:14860819332:web:6c850620404c3d266b5bd1",
  measurementId: "G-8F4Q3WFM2N"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");

let isAdmin = sessionStorage.getItem("ahmed_store_admin") === "true";
let products = [];
let cart = [];
let currentCategory = "all";

const productsGrid = document.getElementById("products-grid");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartModal = document.getElementById("cart-modal");
const productModal = document.getElementById("product-modal");
const adminPanel = document.getElementById("admin-panel");

if (isAdmin) {
  adminPanel.classList.remove("hidden");
}

// الاستماع اللحظي للمنتجات من Firebase
const q = query(productsCol, orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  products = snapshot.docs.map(docItem => ({
    id: docItem.id,
    ...docItem.data()
  }));
  renderProducts();
}, (error) => {
  console.error("Firebase Error:", error);
  productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #dc2626; padding: 20px;">تأكد من تفعيل Firestore Database في وضع الاختبار (Test mode).</p>`;
});

function renderProducts() {
  productsGrid.innerHTML = "";
  const filtered = currentCategory === "all"
    ? products
    : products.filter(p => p.category === currentCategory);

  if (filtered.length === 0) {
    productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 30px; color: #64748b;">لا توجد منتجات في هذا القسم حالياً.</p>`;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-img" onclick="openProductDetails('${product.id}')">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title" onclick="openProductDetails('${product.id}')">${product.name}</h3>
        <p class="product-price">${product.price} جنيه</p>
        <div class="card-actions">
          <button class="btn btn-primary full-width" onclick="buyNow('${product.id}')">اطلب الآن</button>
          <button class="btn btn-outline" onclick="addToCart('${product.id}')" title="أضف للسلة">+ 🛒</button>
          ${isAdmin ? `<button class="btn btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>` : ""}
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// نافذة تفاصيل المنتج
window.openProductDetails = function (id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("pm-image").src = product.image;
  document.getElementById("pm-category").textContent = product.category;
  document.getElementById("pm-title").textContent = product.name;
  document.getElementById("pm-price").textContent = product.price;
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

// ضغط الصورة لتتحفظ بسرعة في قاعدة البيانات
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const maxWidth = 450;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// إضافة منتج جديد وحفظه في Firebase مباشرة
document.getElementById("add-product-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!isAdmin) return;

  const fileInput = document.getElementById("p-image-file");
  if (!fileInput.files[0]) return alert("من فضلك اختر صورة للمنتج.");

  const saveBtn = document.getElementById("save-product-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "جاري النشر...";

  try {
    const compressedImg = await compressImage(fileInput.files[0]);

    await addDoc(productsCol, {
      name: document.getElementById("p-name").value.trim(),
      price: Number(document.getElementById("p-price").value),
      category: document.getElementById("p-category").value,
      description: document.getElementById("p-desc").value.trim(),
      image: compressedImg,
      createdAt: Date.now()
    });

    this.reset();
    alert("تم نشر المنتج بنجاح وظهر الآن لكل العملاء!");
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء الحفظ: تأكد من تفعيل Firestore Database.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "+ نشر المنتج فوراً";
  }
});

// حذف منتج من Firebase مباشرة
window.deleteProduct = async function (id) {
  if (!isAdmin) return;
  if (!confirm("هل تريد حذف هذا المنتج نهائياً من المتجر؟")) return;

  try {
    await deleteDoc(doc(db, "products", id));
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء حذف المنتج.");
  }
};

// السلة والطلب
window.addToCart = function (id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
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
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">&times;</button>
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
  const customerCity = document.getElementById("c-city").value.trim();
  const customerAddress = document.getElementById("c-address").value.trim();

  if (!customerName || !customerPhone || !customerCity || !customerAddress) {
    return alert("من فضلك اكتب الاسم ورقم الموبايل والمحافظة والعنوان بالتفصيل لإتمام الطلب.");
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

  message += `\n💰 *الإجمالي: ${total} جنيه*`;

  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");

  cart = [];
  updateCartUI();
  cartModal.classList.add("hidden");
});

// التحكم ودخول الإدارة
document.getElementById("admin-login-btn").addEventListener("click", () => {
  const pass = prompt("أدخل الرقم السري لإدارة المتجر:");
  if (pass === adminPassword) {
    isAdmin = true;
    sessionStorage.setItem("ahmed_store_admin", "true");
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

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});