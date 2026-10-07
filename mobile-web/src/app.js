import { store, DEMO_USERS, ROHAN, PRIYA, NIKHIL, AFFILIATE_OFFERS } from "./data.js";
import { buildUpiUri, drawUpiQrCanvas, launchUpiApp, isMobileDevice } from "./upi.js";
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testConnection, isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from "./supabase.js";

// Check if URL requests public shared balance link (§2.10)
const urlParams = new URLSearchParams(window.location.search);
const isSharedView = urlParams.get("view") === "shared";
const sharedGroupId = urlParams.get("groupId") || "g1";
const sharedMemberId = urlParams.get("memberId") || "m2";

// Application State
let currentRoute = isSharedView ? "shared_balance" : "home";
let currentTab = "expenses"; // 'expenses', 'balances', 'analytics', 'rules'
let upiSubTab = "apps"; // 'apps' or 'qr'
let expenseSearchQuery = "";
let expenseCategoryFilter = "All";
let onboardingStep = "phone"; // 'phone', 'otp', 'profile'
let onboardingPhone = "";

// DOM Elements
const topbarEl = document.getElementById("app-topbar");
const mainEl = document.getElementById("app-main");
const bottombarEl = document.getElementById("app-bottombar");
const fabAddExpense = document.getElementById("fab-add-expense");
const modalSheet = document.getElementById("modal-sheet");
const sheetTitle = document.getElementById("sheet-title");
const sheetBody = document.getElementById("sheet-body");
const btnCloseSheet = document.getElementById("btn-close-sheet");
const appToast = document.getElementById("app-toast");
const toastText = document.getElementById("toast-text");
const liveClockEl = document.getElementById("live-clock");
const mobileShell = document.getElementById("mobile-shell");
const btnToggleFrame = document.getElementById("btn-toggle-frame");
const btnToggleTheme = document.getElementById("btn-toggle-theme");
const btnQrShare = document.getElementById("btn-qr-share");
const btnSupabaseStatus = document.getElementById("btn-supabase-status");
const cameraFileInput = document.getElementById("camera-file-input");

// Live Clock
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  if (liveClockEl) {
    liveClockEl.textContent = `${hours}:${minutes}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Toast helper
export function showToast(message) {
  if (!appToast || !toastText) return;
  toastText.textContent = message;
  appToast.classList.add("show");
  setTimeout(() => {
    appToast.classList.remove("show");
  }, 3200);
}

// Copy to clipboard helper
function copyText(text, label = "Copied to clipboard") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label}: ${text}`);
  }).catch(() => {
    showToast(`Copied: ${text}`);
  });
}

// Open / Close Bottom Sheet
function openSheet(title, contentHtml, onMount = null) {
  sheetTitle.textContent = title;
  sheetBody.innerHTML = contentHtml;
  modalSheet.classList.add("show");
  if (onMount) {
    try {
      onMount();
    } catch (err) {
      setTimeout(onMount, 10);
    }
  }
}

function closeSheet() {
  modalSheet.classList.remove("show");
}

btnCloseSheet.addEventListener("click", closeSheet);
modalSheet.addEventListener("click", (e) => {
  if (e.target === modalSheet) closeSheet();
});

// Router
export function navigateTo(route, params = {}) {
  currentRoute = route;
  if (params.tab) currentTab = params.tab;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Bottom navigation listeners
bottombarEl.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    const route = item.getAttribute("data-route");
    if (route) {
      if (route === "upi_flow") {
        store.openUpiFlow(ROHAN, 2100.0);
      }
      navigateTo(route);
    }
  });
});

fabAddExpense.addEventListener("click", () => {
  navigateTo("add_expense");
});

// Desktop Bar listeners
if (btnToggleFrame) {
  btnToggleFrame.addEventListener("click", () => {
    mobileShell.classList.toggle("frame-mode");
    const isFrame = mobileShell.classList.contains("frame-mode");
    btnToggleFrame.innerHTML = `<i class="fa-solid fa-mobile-screen"></i> Frame: ${isFrame ? "ON" : "OFF"}`;
  });
}

if (btnToggleTheme) {
  btnToggleTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    store.updateSettings({ themeMode: isDark ? "dark" : "light" });
    showToast(`Switched to ${isDark ? "Dark" : "Light"} mode`);
  });
}

if (btnQrShare) {
  btnQrShare.addEventListener("click", () => {
    const localUrl = window.location.origin;
    openSheet("Open on Smartphone", `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 12px 0;">
        <p style="font-size: 13px; color: var(--text-secondary); text-align: center;">
          Scan with your phone camera to open TicketSplit on mobile over Wi-Fi:
        </p>
        <div class="qr-canvas-box" style="padding: 16px;">
          <canvas id="share-qr-canvas" width="200" height="200"></canvas>
        </div>
        <div style="background: var(--surface-container); padding: 10px 14px; border-radius: 12px; width: 100%; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer;" id="copy-app-link">
          <i class="fa-solid fa-link"></i> ${localUrl}
        </div>
      </div>
    `, () => {
      const cvs = document.getElementById("share-qr-canvas");
      if (cvs) drawUpiQrCanvas(cvs, localUrl, 200);
      document.getElementById("copy-app-link")?.addEventListener("click", () => copyText(localUrl, "App link copied"));
    });
  });
}

if (btnSupabaseStatus) {
  btnSupabaseStatus.addEventListener("click", openSupabaseConfigModal);
}

// -------------------------------------------------------------
// Topbar Rendering
// -------------------------------------------------------------
function renderTopbar() {
  const selectedGroup = store.selectedGroup;
  const user = store.currentUser;

  if (currentRoute === "shared_balance") {
    topbarEl.innerHTML = `
      <div class="topbar-left">
        <div class="topbar-titles">
          <span class="topbar-subtitle">SHARED BALANCE LINK</span>
          <span class="topbar-title">TicketSplit</span>
        </div>
      </div>
      <div class="topbar-actions">
        <span class="badge positive"><i class="fa-solid fa-lock-open"></i> Public Link</span>
      </div>
    `;
    return;
  }

  if (!store.state.isOnboarded) {
    topbarEl.innerHTML = `
      <div class="topbar-left">
        <div class="topbar-titles">
          <span class="topbar-subtitle">GET STARTED</span>
          <span class="topbar-title">TicketSplit</span>
        </div>
      </div>
    `;
    return;
  }

  switch (currentRoute) {
    case "home":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <div class="topbar-titles">
            <span class="topbar-subtitle">OVERVIEW</span>
            <span class="topbar-title">TicketSplit</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-edit-my-upi-top" title="Edit My UPI">
            <i class="fa-solid fa-bolt" style="color: var(--emerald-primary);"></i>
          </button>
          <div class="user-avatar-btn" id="btn-profile" title="Switch User / Profile">
            <img src="${user.avatarUrl}" alt="${user.name}" />
          </div>
        </div>
      `;
      break;

    case "groups":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <div class="topbar-titles">
            <span class="topbar-subtitle">GROUPS</span>
            <span class="topbar-title">All Groups</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-new-group-top" title="Create Group">
            <i class="fa-solid fa-plus"></i>
          </button>
          <div class="user-avatar-btn" id="btn-profile">
            <img src="${user.avatarUrl}" alt="${user.name}" />
          </div>
        </div>
      `;
      break;

    case "group_details":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <button class="topbar-back-btn" id="btn-back">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="topbar-titles">
            <span class="topbar-subtitle">${(selectedGroup.type || 'group').toUpperCase()} • LEDGER</span>
            <span class="topbar-title">${selectedGroup.name}</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-whatsapp-share" title="Share Split on WhatsApp">
            <i class="fa-brands fa-whatsapp" style="color: var(--whatsapp-green); font-size: 18px;"></i>
          </button>
          <div class="user-avatar-btn" id="btn-profile">
            <img src="${user.avatarUrl}" alt="${user.name}" />
          </div>
        </div>
      `;
      break;

    case "add_expense":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <button class="topbar-back-btn" id="btn-back">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="topbar-titles">
            <span class="topbar-subtitle">${selectedGroup.name.toUpperCase()}</span>
            <span class="topbar-title">Add Expense</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-trigger-camera" title="Snap Receipt Photo">
            <i class="fa-solid fa-camera" style="color: var(--indigo-secondary);"></i>
          </button>
        </div>
      `;
      break;

    case "upi_flow":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <button class="topbar-back-btn" id="btn-back">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="topbar-titles">
            <span class="topbar-subtitle">INSTANT SETTLEMENT</span>
            <span class="topbar-title">UPI Handshake Rail</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-upi-info">
            <i class="fa-solid fa-shield-halved" style="color: var(--emerald-primary);"></i>
          </button>
        </div>
      `;
      break;

    case "activity":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <div class="topbar-titles">
            <span class="topbar-subtitle">AUDIT LEDGER</span>
            <span class="topbar-title">Activity Feed</span>
          </div>
        </div>
        <div class="topbar-actions">
          <div class="user-avatar-btn" id="btn-profile">
            <img src="${user.avatarUrl}" alt="${user.name}" />
          </div>
        </div>
      `;
      break;

    case "settings":
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <div class="topbar-titles">
            <span class="topbar-subtitle">PREFERENCES</span>
            <span class="topbar-title">Settings</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-profile">
            <i class="fa-solid fa-user"></i>
          </button>
        </div>
      `;
      break;
  }

  // Attach Topbar Listeners
  document.getElementById("btn-back")?.addEventListener("click", () => {
    if (currentRoute === "add_expense" || currentRoute === "upi_flow") {
      navigateTo("group_details");
    } else {
      navigateTo("groups");
    }
  });

  document.getElementById("btn-profile")?.addEventListener("click", openAuthProfileModal);
  document.getElementById("btn-edit-my-upi-top")?.addEventListener("click", () => openEditUpiModal("personal"));
  document.getElementById("btn-new-group-top")?.addEventListener("click", openNewGroupModal);
  document.getElementById("btn-whatsapp-share")?.addEventListener("click", shareGroupOnWhatsApp);
  document.getElementById("btn-trigger-camera")?.addEventListener("click", () => cameraFileInput.click());
  document.getElementById("btn-upi-info")?.addEventListener("click", () => showToast("Connected to NPCI 256-bit encrypted UPI rail"));
}

// -------------------------------------------------------------
// Screen Router & Render Cycle
// -------------------------------------------------------------
function renderApp() {
  renderTopbar();

  // If viewing public shared balance link
  if (currentRoute === "shared_balance") {
    bottombarEl.style.display = "none";
    fabAddExpense.style.display = "none";
    renderSharedBalanceScreen();
    return;
  }

  // If not logged in / not onboarded, show Phone OTP onboarding
  if (!store.state.isOnboarded) {
    bottombarEl.style.display = "none";
    fabAddExpense.style.display = "none";
    renderPhoneOnboardingScreen();
    return;
  }

  // Bottombar & FAB visibility
  const hideBars = currentRoute === "add_expense" || currentRoute === "upi_flow";
  bottombarEl.style.display = hideBars ? "none" : "flex";
  fabAddExpense.style.display = currentRoute === "home" || currentRoute === "groups" || currentRoute === "group_details" ? "flex" : "none";

  // Update Bottom Nav Active Indicator
  bottombarEl.querySelectorAll(".nav-item").forEach(item => {
    const route = item.getAttribute("data-route");
    item.classList.toggle("active", route === currentRoute);
  });

  switch (currentRoute) {
    case "home":
      renderHomeScreen();
      break;
    case "groups":
      renderGroupsDashboard();
      break;
    case "group_details":
      renderGroupDetails();
      break;
    case "add_expense":
      renderAddExpense();
      break;
    case "upi_flow":
      renderUpiFlow();
      break;
    case "activity":
      renderActivityFeed();
      break;
    case "settings":
      renderSettings();
      break;
  }
}

// -------------------------------------------------------------
// 0. PHONE NUMBER + OTP ONBOARDING FLOW (§2.2–§2.4)
// -------------------------------------------------------------
function renderPhoneOnboardingScreen() {
  if (onboardingStep === "phone") {
    mainEl.innerHTML = `
      <div class="auth-flow-container">
        <div class="auth-hero-icon">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <div>
          <h2 style="font-size: 24px; font-weight: 900; color: var(--text-primary);">Enter Phone Number</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            TicketSplit verifies your account via SMS OTP. Fast, secure, and no password required.
          </p>
        </div>

        <div class="phone-input-row">
          <div class="country-code-pill">🇮🇳 +91</div>
          <input type="tel" class="phone-field" id="onboard-phone-input" placeholder="98765 43210" maxlength="10" value="9876543210" />
        </div>

        <button class="primary-action-btn" id="btn-send-otp">
          <i class="fa-solid fa-paper-plane"></i> Send 6-Digit OTP
        </button>

        <div style="text-align: center; margin-top: 10px;">
          <span style="font-size: 12px; color: var(--text-muted);">Testing locally?</span>
          <button class="desktop-btn" style="width: 100%; justify-content: center; margin-top: 8px;" id="btn-skip-demo-login">
            <i class="fa-solid fa-bolt" style="color: var(--emerald-primary);"></i> Quick Launch as Aarav (Demo)
          </button>
        </div>
      </div>
    `;

    document.getElementById("btn-send-otp")?.addEventListener("click", () => {
      const phone = document.getElementById("onboard-phone-input")?.value?.trim();
      if (!phone || phone.length < 10) {
        showToast("Please enter a valid 10-digit Indian phone number");
        return;
      }
      onboardingPhone = `+91 ${phone}`;
      store.startPhoneOnboarding(onboardingPhone);
      onboardingStep = "otp";
      showToast("OTP sent! (Demo code: 123456)");
      renderPhoneOnboardingScreen();
    });

    document.getElementById("btn-skip-demo-login")?.addEventListener("click", () => {
      store.state.isOnboarded = true;
      store.saveState();
      showToast("Logged in as Aarav (You)!");
      navigateTo("home");
    });
  } else if (onboardingStep === "otp") {
    mainEl.innerHTML = `
      <div class="auth-flow-container">
        <button class="topbar-back-btn" id="btn-back-to-phone" style="margin-bottom: 8px;">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 style="font-size: 24px; font-weight: 900; color: var(--text-primary);">Verify OTP</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            Enter the 6-digit code sent to <strong>${onboardingPhone || '+91 9876543210'}</strong>
          </p>
        </div>

        <div class="otp-boxes-row">
          <input type="text" class="otp-box" maxlength="1" value="1" id="otp-1" />
          <input type="text" class="otp-box" maxlength="1" value="2" id="otp-2" />
          <input type="text" class="otp-box" maxlength="1" value="3" id="otp-3" />
          <input type="text" class="otp-box" maxlength="1" value="4" id="otp-4" />
          <input type="text" class="otp-box" maxlength="1" value="5" id="otp-5" />
          <input type="text" class="otp-box" maxlength="1" value="6" id="otp-6" />
        </div>

        <button class="primary-action-btn" id="btn-verify-otp">
          <i class="fa-solid fa-check"></i> Verify & Continue
        </button>

        <div style="text-align: center; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          Resend OTP in <span style="font-weight: 700; color: var(--emerald-primary);">28s</span>
        </div>
      </div>
    `;

    document.getElementById("btn-back-to-phone")?.addEventListener("click", () => {
      onboardingStep = "phone";
      renderPhoneOnboardingScreen();
    });

    document.getElementById("btn-verify-otp")?.addEventListener("click", () => {
      let code = "";
      for (let i = 1; i <= 6; i++) {
        code += document.getElementById(`otp-${i}`)?.value || "";
      }
      if (store.verifyOtp(code)) {
        onboardingStep = "profile";
        showToast("Phone verified successfully!");
        renderPhoneOnboardingScreen();
      } else {
        showToast("Invalid OTP code. Try: 123456");
      }
    });
  } else if (onboardingStep === "profile") {
    mainEl.innerHTML = `
      <div class="auth-flow-container">
        <div>
          <h2 style="font-size: 24px; font-weight: 900; color: var(--text-primary);">Set Up Your Profile</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            Tell flatmates who is splitting the expenses.
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="text-input" id="profile-name-input" placeholder="e.g. Aarav Verma" value="Aarav Verma" />
        </div>

        <div class="form-group">
          <label class="form-label">Profile Photo (Optional)</label>
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--emerald-primary);" />
            <button class="desktop-btn" id="btn-change-avatar">
              <i class="fa-solid fa-camera"></i> Change Photo
            </button>
          </div>
        </div>

        <button class="primary-action-btn" id="btn-complete-profile">
          <i class="fa-solid fa-arrow-right"></i> Enter TicketSplit
        </button>
      </div>
    `;

    document.getElementById("btn-complete-profile")?.addEventListener("click", () => {
      const name = document.getElementById("profile-name-input")?.value || "Aarav Verma";
      store.completeProfile(name);
      onboardingStep = "phone";
      showToast(`Welcome ${name}! Setup complete.`);
      navigateTo("home");
    });
  }
}

// -------------------------------------------------------------
// PUBLIC SHARED BALANCE LINK WEB VIEW (§2.10)
// -------------------------------------------------------------
function renderSharedBalanceScreen() {
  const group = store.state.groups.find(g => g.id === sharedGroupId) || store.state.groups[0];
  const member = DEMO_USERS.find(m => m.id === sharedMemberId) || ROHAN;
  const balances = store.getGroupBalances(group.id);
  const balanceDebt = balances.find(b => b.member.id === member.id) || { amountYouOwe: 0, amountOwedToYou: 0, isSettled: true };

  mainEl.innerHTML = `
    <div class="page-view">
      <div class="shared-public-card">
        <div class="auth-hero-icon" style="margin: 0 auto;">
          <i class="fa-solid fa-link"></i>
        </div>

        <div>
          <span style="font-size: 12px; font-weight: 800; color: var(--emerald-primary); text-transform: uppercase;">
            SHARED GROUP BALANCE
          </span>
          <h2 style="font-size: 22px; font-weight: 900; color: var(--text-primary); margin-top: 2px;">
            ${group.name}
          </h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            Summary for <strong>${member.name}</strong> (No account required)
          </p>
        </div>

        <div style="background: var(--surface-container); width: 100%; padding: 18px; border-radius: 16px;">
          <div style="font-size: 12px; color: var(--text-secondary);">Your Outstanding Balance</div>
          <div style="font-size: 32px; font-weight: 900; color: ${balanceDebt.isSettled ? 'var(--text-secondary)' : 'var(--emerald-primary)'}; margin: 4px 0;">
            ${balanceDebt.isSettled ? "₹0 (Settled)" : `₹${balanceDebt.amountOwedToYou.toLocaleString()}`}
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">
            Recipient VPA: <strong>${store.currentUser.upiId}</strong>
          </div>
        </div>

        ${!balanceDebt.isSettled ? `
          <button class="primary-action-btn" id="btn-shared-pay-upi">
            <i class="fa-solid fa-bolt"></i> Pay via UPI (GPay / PhonePe)
          </button>
        ` : `
          <div class="badge positive" style="padding: 8px 16px; font-size: 13px;">
            <i class="fa-solid fa-circle-check"></i> This balance is fully settled!
          </div>
        `}

        <div style="border-top: 1px dashed var(--surface-highest); padding-top: 14px; width: 100%;">
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
            Managing flat rent or trip splits with friends?
          </p>
          <button class="desktop-btn" style="width: 100%; justify-content: center; padding: 10px;" id="btn-shared-open-app">
            <i class="fa-solid fa-mobile-screen"></i> Launch Full TicketSplit App
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-shared-pay-upi")?.addEventListener("click", () => {
    executeUpiPayment("GPay", store.currentUser, balanceDebt.amountOwedToYou);
  });

  document.getElementById("btn-shared-open-app")?.addEventListener("click", () => {
    currentRoute = "home";
    renderApp();
  });
}

// -------------------------------------------------------------
// 1. HOME SCREEN
// -------------------------------------------------------------
function renderHomeScreen() {
  const user = store.currentUser;
  const groups = store.state.groups;
  const flatGroup = groups.find(g => g.id === "g1") || groups[0];
  const balances = store.getGroupBalances(flatGroup.id);
  const recentExpenses = store.state.expenses.slice(0, 3);

  mainEl.innerHTML = `
    <div class="page-view">
      <!-- 1. Personalized Greeting Hero -->
      <div class="home-greeting-card">
        <div class="greeting-row">
          <div>
            <span class="greeting-sub">Welcome back,</span>
            <div class="greeting-name">Hello, ${user.name.split(" ")[0]} 👋</div>
          </div>
          <span class="active-flat-pill">
            <i class="fa-solid fa-building"></i> ${flatGroup.name}
          </span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--surface-highest); padding-top: 10px;">
          <span style="font-size: 11px; color: var(--text-secondary);">Your UPI ID: <strong>${user.upiId}</strong></span>
          <button style="font-size: 11px; color: var(--emerald-primary); font-weight: 800; cursor: pointer;" id="btn-home-edit-upi">
            Edit UPI <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </div>

      <!-- 2. High-Priority Rent Due Alert -->
      <div class="urgent-rent-card">
        <div class="rent-urgent-left">
          <div class="rent-urgent-icon">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <div class="rent-urgent-title">Rent Due in ${flatGroup.nextRentDueDays} Days!</div>
            <div class="rent-urgent-sub">Total ₹${flatGroup.monthlyRent.toLocaleString()} • Your share ₹8,000</div>
          </div>
        </div>
        <button class="rent-action-btn" id="btn-home-pay-rent">
          Pay ₹8,000
        </button>
      </div>

      <!-- 3. Net Financial Position Card -->
      <div class="hero-card">
        <div class="hero-top">
          <div>
            <div class="hero-label">CURRENT NET BALANCE</div>
            <div class="hero-amount-row">
              <span class="hero-amount">+₹3,650</span>
              <span class="hero-status-tag">in your favor</span>
            </div>
          </div>
          <div class="live-pill">
            <span class="pulse-dot"></span>
            <span>UPI Active</span>
          </div>
        </div>

        <div class="dual-split-row">
          <div class="split-pill">
            <div class="split-pill-icon receive"><i class="fa-solid fa-arrow-down-left"></i></div>
            <div>
              <div class="split-pill-label">You get back</div>
              <div class="split-pill-val positive">₹4,850</div>
            </div>
          </div>
          <div class="split-pill">
            <div class="split-pill-icon send"><i class="fa-solid fa-arrow-up-right"></i></div>
            <div>
              <div class="split-pill-label">You owe</div>
              <div class="split-pill-val negative">₹1,200</div>
            </div>
          </div>
        </div>

        <!-- Quick Home Action Bar -->
        <div class="quick-actions">
          <div class="action-card" id="home-act-add-exp">
            <div class="action-icon green"><i class="fa-solid fa-receipt"></i></div>
            <span class="action-label">Add Bill</span>
          </div>
          <div class="action-card" id="home-act-settle">
            <div class="action-icon mint"><i class="fa-solid fa-bolt"></i></div>
            <span class="action-label">Settle UPI</span>
          </div>
          <div class="action-card" id="home-act-new-group">
            <div class="action-icon indigo"><i class="fa-solid fa-user-plus"></i></div>
            <span class="action-label">New Group</span>
          </div>
          <div class="action-card" id="home-act-edit-upi">
            <div class="action-icon orange"><i class="fa-solid fa-pen-to-square"></i></div>
            <span class="action-label">Edit UPI</span>
          </div>
        </div>
      </div>

      <!-- 4. Quick Debt Ticker (Bi-directional Balances) -->
      <div class="section-header">
        <span class="section-title">Peer-to-Peer Balances</span>
        <span class="section-badge">${balances.filter(b => !b.isSettled && ((b.amountYouOwe || 0) > 0 || (b.amountOwedToYou || 0) > 0)).length} pending</span>
      </div>

      <div class="debt-ticker-scroll">
        ${balances.map(b => {
          const youOwe = b.amountYouOwe || 0;
          const owesYou = b.amountOwedToYou || 0;
          const isSettled = b.isSettled || (youOwe === 0 && owesYou === 0);
          return `
            <div class="debt-ticker-card" ${youOwe > 0 ? `data-pay-member="${b.member.id}" data-amount="${youOwe}"` : `data-record-received="${b.member.id}" data-amount="${owesYou}"`}>
              <img class="debt-ticker-avatar" src="${b.member.avatarUrl}" alt="${b.member.name}" />
              <div>
                <div class="debt-ticker-name">${b.member.name.replace(/\s*\(You\)/g, '')}</div>
                <div class="debt-ticker-amount" style="color: ${youOwe > 0 ? 'var(--error-red)' : owesYou > 0 ? 'var(--emerald-primary)' : 'var(--text-muted)'}; font-size: 12px; font-weight: 800;">
                  ${isSettled ? "Settled" : youOwe > 0 ? `You owe ₹${youOwe.toLocaleString()} (Pay)` : `Owes you ₹${owesYou.toLocaleString()} (Settle)`}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- 5. Recent Activity Stream -->
      <div class="section-header" style="margin-top: 6px;">
        <span class="section-title">Recent Transactions</span>
        <span style="font-size: 11px; font-weight: 700; color: var(--emerald-primary); cursor: pointer;" id="home-view-all-activity">
          View All
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${recentExpenses.map(exp => `
          <div class="expense-item" style="padding: 10px 14px;">
            <div class="expense-left">
              <div class="category-emoji-box" style="width: 36px; height: 36px; font-size: 18px;">${exp.categoryEmoji || "🧾"}</div>
              <div class="expense-title-col">
                <span class="expense-name" style="font-size: 13px;">${exp.title}</span>
                <span class="expense-desc">${exp.dateText}</span>
              </div>
            </div>
            <div class="expense-right">
              <span class="expense-total" style="font-size: 14px;">₹${exp.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // Attach Home Listeners
  document.getElementById("btn-home-edit-upi")?.addEventListener("click", () => openEditUpiModal("personal"));
  document.getElementById("btn-home-pay-rent")?.addEventListener("click", () => {
    store.openUpiFlow({
      id: "landlord",
      name: "Suresh Sharma (Landlord)",
      initials: "SS",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      upiId: flatGroup.landlordUpi || "suresh.sharma@okaxis"
    }, 8000.0);
    navigateTo("upi_flow");
  });

  document.getElementById("home-act-add-exp")?.addEventListener("click", () => navigateTo("add_expense"));
  document.getElementById("home-act-settle")?.addEventListener("click", () => openSettleSheet(ROHAN, 2100.0));
  document.getElementById("home-act-new-group")?.addEventListener("click", openNewGroupModal);
  document.getElementById("home-act-edit-upi")?.addEventListener("click", () => openEditUpiModal("personal"));
  document.getElementById("home-view-all-activity")?.addEventListener("click", () => navigateTo("activity"));

  mainEl.querySelectorAll(".debt-ticker-card").forEach(card => {
    card.addEventListener("click", () => {
      const isPay = card.hasAttribute("data-pay-member");
      const mId = card.getAttribute("data-pay-member") || card.getAttribute("data-record-received") || card.getAttribute("data-settle-member");
      const amt = parseFloat(card.getAttribute("data-amount")) || 1200;
      const mem = DEMO_USERS.find(m => m.id === mId) || ROHAN;
      if (isPay) {
        openSettleSheet(mem, amt);
      } else {
        openRecordReceivedSheet(mem, amt);
      }
    });
  });

  mainEl.querySelectorAll("[data-pay-expense]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const payerId = btn.getAttribute("data-payer-id");
      const amt = parseFloat(btn.getAttribute("data-amount")) || 1200;
      const mem = DEMO_USERS.find(m => m.id === payerId) || ROHAN;
      openSettleSheet(mem, amt);
    });
  });
}

// -------------------------------------------------------------
// 2. GROUPS DASHBOARD SCREEN
// -------------------------------------------------------------
function renderGroupsDashboard() {
  // Sort groups by recency (§2.5)
  const groups = [...store.state.groups].sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

  mainEl.innerHTML = `
    <div class="page-view">
      <div class="section-header">
        <span class="section-title">Your Active Groups</span>
        <button class="desktop-btn" id="btn-create-group-card">
          <i class="fa-solid fa-plus"></i> New Group
        </button>
      </div>

      <div class="groups-list">
        ${groups.map(group => `
          <div class="group-item-card" data-group-id="${group.id}">
            <div class="group-card-top">
              <div class="group-info">
                <img class="group-thumb" src="${group.imageUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200'}" alt="${group.name}" />
                <div class="group-details">
                  <span class="group-name">${group.typeIcon || '📁'} ${group.name}</span>
                  <span class="group-sub">${group.location}</span>
                </div>
              </div>
              <div>
                ${group.isSettled
                  ? `<span class="badge settled"><i class="fa-solid fa-check"></i> Settled</span>`
                  : group.netBalance >= 0
                    ? `<span class="badge positive">+₹${group.netBalance.toLocaleString()}</span>`
                    : `<span class="badge negative">-₹${Math.abs(group.netBalance).toLocaleString()}</span>`
                }
              </div>
            </div>

            ${group.monthlyRent > 0 ? `
              <div class="rent-banner">
                <div class="rent-banner-text">
                  <span class="rent-banner-title">
                    <i class="fa-regular fa-calendar-check"></i> Rent due (${group.rentDueDateText})
                  </span>
                  <span class="rent-banner-sub">Monthly ₹${group.monthlyRent.toLocaleString()} • Flat UPI: ${group.flatGroupUpiId}</span>
                </div>
                <button class="rent-action-btn" data-action="pay-rent" data-group-id="${group.id}">
                  Pay Share
                </button>
              </div>
            ` : ""}

            <div class="group-footer-row">
              <div class="avatar-stack">
                ${(group.members || []).map(m => `
                  <img class="avatar-stack-item" src="${m.avatarUrl}" alt="${m.name}" title="${m.name}" />
                `).join("")}
              </div>
              <span>${group.lastPaidSummary || `Month spend: ₹${(group.totalSpendMonth || 0).toLocaleString()}`}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  document.getElementById("btn-create-group-card")?.addEventListener("click", openNewGroupModal);

  mainEl.querySelectorAll(".group-item-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-action='pay-rent']")) return;
      const gId = card.getAttribute("data-group-id");
      store.selectGroup(gId);
      navigateTo("group_details");
    });
  });

  mainEl.querySelectorAll("[data-action='pay-rent']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const gId = btn.getAttribute("data-group-id");
      const group = groups.find(g => g.id === gId) || groups[0];
      store.openUpiFlow({
        id: "landlord",
        name: "Landlord Rent Account",
        initials: "LL",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        upiId: group.landlordUpi || "suresh.sharma@okaxis"
      }, 8000.0);
      navigateTo("upi_flow");
    });
  });
}

// -------------------------------------------------------------
// 3. GROUP DETAILS SCREEN (Affiliate Perk Card & Spend Analytics)
// -------------------------------------------------------------
function renderGroupDetails() {
  const group = store.selectedGroup;
  let expenses = store.groupExpenses;
  const balances = store.getGroupBalances(group.id);
  const affiliateOffer = AFFILIATE_OFFERS[group.type || "rent"] || AFFILIATE_OFFERS.rent;
  const analytics = store.getGroupAnalytics(group.id);

  if (expenseSearchQuery) {
    const q = expenseSearchQuery.toLowerCase();
    expenses = expenses.filter(e => e.title.toLowerCase().includes(q) || e.paidByName.toLowerCase().includes(q));
  }
  if (expenseCategoryFilter !== "All") {
    expenses = expenses.filter(e => e.category === expenseCategoryFilter);
  }

  mainEl.innerHTML = `
    <div class="page-view">
      <!-- Group Header Card -->
      <div class="card" style="padding: 16px; border-radius: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: var(--emerald-primary); letter-spacing: 0.5px;">
              ${group.typeIcon || '📁'} ${(group.typeLabel || 'Group').toUpperCase()}
            </span>
            <h2 style="font-size: 20px; font-weight: 900; color: var(--text-primary); margin-top: 2px;">${group.name}</h2>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${group.location}</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="icon-btn" id="btn-edit-flat-upi" title="Edit Flat UPI">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn" id="btn-copy-flat-upi" title="Copy Flat UPI">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 14px;">
          <div style="flex: 1; background: var(--surface-container); padding: 10px 12px; border-radius: 12px;">
            <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary);">FLAT UPI ID</div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary);">${group.flatGroupUpiId || "hsr402@axis"}</div>
          </div>
          <div style="flex: 1; background: var(--surface-container); padding: 10px 12px; border-radius: 12px;">
            <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary);">YOUR BALANCE</div>
            <div style="font-size: 13px; font-weight: 800; color: ${(group.netBalance || 0) > 0 ? 'var(--emerald-primary)' : (group.netBalance || 0) < 0 ? 'var(--error-red)' : 'var(--text-secondary)'};">
              ${(group.netBalance || 0) > 0 ? `+₹${(group.netBalance).toLocaleString()}` : (group.netBalance || 0) < 0 ? `-₹${Math.abs(group.netBalance).toLocaleString()}` : '₹0 (Settled)'}
            </div>
          </div>
        </div>

        <!-- WhatsApp Share Button -->
        <button class="whatsapp-share-btn" style="margin-top: 12px; width: 100%;" id="btn-group-whatsapp-share">
          <i class="fa-brands fa-whatsapp" style="font-size: 17px;"></i> Share Flat Split on WhatsApp
        </button>
      </div>

      <!-- Contextual Native Affiliate / Perk Card (§3.3) -->
      <div class="affiliate-perk-card" id="group-affiliate-card" style="cursor: pointer;">
        <div class="perk-left">
          <div class="perk-icon-box">
            <i class="${affiliateOffer.icon}"></i>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="perk-badge">${affiliateOffer.badge} • ${affiliateOffer.partnerName}</span>
              <span class="investor-tag"><i class="fa-solid fa-gem"></i> §3.3 Affiliate</span>
            </div>
            <div class="perk-title">${affiliateOffer.title}</div>
            <div class="perk-desc">${affiliateOffer.description}</div>
          </div>
        </div>
        <button class="perk-claim-btn" id="btn-claim-perk" data-code="${affiliateOffer.promoCode}" data-url="${affiliateOffer.linkUrl}">
          ${affiliateOffer.promoCode}
        </button>
      </div>

      <!-- Navigation Tabs (Expenses, Balances, Analytics, Rules) -->
      <div class="tabs-header">
        <div class="tab-button ${currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          Expenses (${store.groupExpenses.length})
        </div>
        <div class="tab-button ${currentTab === 'balances' ? 'active' : ''}" data-tab="balances">
          Balances
        </div>
        <div class="tab-button ${currentTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
          <i class="fa-solid fa-chart-pie"></i> Analytics
        </div>
        <div class="tab-button ${currentTab === 'rules' ? 'active' : ''}" data-tab="rules">
          Rules
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="tab-content-area">
        ${renderGroupTabContent(group, expenses, balances, analytics)}
      </div>
    </div>
  `;

  // Attach Listeners
  document.getElementById("btn-copy-flat-upi")?.addEventListener("click", () => {
    copyText(group.flatGroupUpiId || "greenglen402@axisbank", "Flat UPI ID");
  });

  document.getElementById("btn-edit-flat-upi")?.addEventListener("click", () => {
    openEditUpiModal("flat", group.id);
  });

  document.getElementById("btn-group-whatsapp-share")?.addEventListener("click", shareGroupOnWhatsApp);

  document.getElementById("btn-claim-perk")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPerkDetailsSheet(affiliateOffer);
  });

  document.getElementById("group-affiliate-card")?.addEventListener("click", () => {
    openPerkDetailsSheet(affiliateOffer);
  });

  mainEl.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTab = btn.getAttribute("data-tab");
      renderGroupDetails();
    });
  });

  const searchInput = document.getElementById("expense-search-input");
  searchInput?.addEventListener("input", (e) => {
    expenseSearchQuery = e.target.value;
    renderGroupDetails();
  });

  mainEl.querySelectorAll(".filter-cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      expenseCategoryFilter = pill.getAttribute("data-cat");
      renderGroupDetails();
    });
  });

  attachGroupTabListeners(group, analytics);
}

function renderGroupTabContent(group, expenses, balances, analytics) {
  if (currentTab === "expenses") {
    const categories = ["All", "Groceries", "Utilities", "Rent", "Food & Drinks", "Travel"];
    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
          <input type="text" id="expense-search-input" placeholder="Search bill title, payer..." value="${expenseSearchQuery}" />
          ${expenseSearchQuery ? '<i class="fa-solid fa-xmark" style="cursor: pointer;" id="clear-search"></i>' : ''}
        </div>

        <div class="category-scroll-pills" style="padding-bottom: 2px;">
          ${categories.map(c => `
            <button class="category-pill-btn filter-cat-pill ${expenseCategoryFilter === c ? 'active' : ''}" data-cat="${c}">
              ${c}
            </button>
          `).join("")}
        </div>

        ${expenses.length === 0 ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
            No expenses found matching your filter.
          </div>
        ` : expenses.map(exp => `
          <div class="expense-item">
            <div class="expense-left">
              <div class="category-emoji-box">${exp.categoryEmoji || "🧾"}</div>
              <div class="expense-title-col">
                <span class="expense-name">${exp.title}</span>
                <span class="expense-desc">${exp.dateText} • ${exp.splitSummary}</span>
                ${exp.receiptUrl ? `
                  <span class="receipt-pill" style="cursor: pointer;" data-view-receipt="${exp.id}">
                    <i class="fa-solid fa-image"></i> Photo receipt attached
                  </span>
                ` : exp.receiptName ? `
                  <span class="receipt-pill"><i class="fa-solid fa-paperclip"></i> ${exp.receiptName}</span>
                ` : ""}
              </div>
            </div>
            <div class="expense-right">
              <span class="expense-total">₹${exp.totalAmount.toLocaleString()}</span>
              ${exp.youGetBackAmount > 0
                ? `<span class="expense-share positive">+₹${exp.youGetBackAmount.toFixed(0)} back</span>`
                : exp.youOweAmount > 0
                  ? `<span class="expense-share negative">-₹${exp.youOweAmount.toFixed(0)} owe</span>
                     <button class="pay-expense-btn" data-pay-expense="${exp.id}" data-payer-id="${exp.paidByMemberId}" data-amount="${exp.youOweAmount}">
                       <i class="fa-solid fa-bolt"></i> Pay ₹${exp.youOweAmount.toFixed(0)}
                     </button>`
                  : `<span class="expense-share" style="color: var(--text-muted);">Settled</span>`
              }
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } else if (currentTab === "balances") {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p style="font-size: 12px; color: var(--text-secondary); padding: 0 4px;">
          All cross-debts simplified into instant UPI payments:
        </p>
        ${balances.map(b => `
          <div class="balance-item">
            <div class="balance-member-info">
              <img class="balance-avatar" src="${b.member.avatarUrl}" alt="${b.member.name}" />
              <div>
                <div class="balance-name">${b.member.name.replace(/\s*\(You\)/g, '')}</div>
                <div class="balance-upi-id" data-edit-member-upi="${b.member.id}">
                  <span>${b.member.upiId}</span> <i class="fa-solid fa-pen" style="font-size: 10px;"></i>
                </div>
              </div>
            </div>
            <div>
              ${(b.amountYouOwe || 0) > 0 ? `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                  <span class="badge negative" style="font-size: 10px;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> You owe ₹${b.amountYouOwe.toLocaleString()}
                  </span>
                  <button class="settle-btn-pay" data-pay-member="${b.member.id}" data-amount="${b.amountYouOwe}">
                    <i class="fa-solid fa-bolt"></i> Pay ₹${b.amountYouOwe.toLocaleString()}
                  </button>
                </div>
              ` : (b.amountOwedToYou || 0) > 0 ? `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                  <span class="badge positive" style="font-size: 10px;">
                    <i class="fa-solid fa-arrow-down-left-and-up-right-to-center"></i> Owes you ₹${b.amountOwedToYou.toLocaleString()}
                  </span>
                  <div style="display: flex; gap: 6px;">
                    <button class="remind-btn-sm" data-remind-member="${b.member.id}" data-amount="${b.amountOwedToYou}">
                      <i class="fa-brands fa-whatsapp"></i> Remind
                    </button>
                    <button class="settle-btn-primary" style="padding: 6px 12px; font-size: 11px;" data-record-received="${b.member.id}" data-amount="${b.amountOwedToYou}">
                      <i class="fa-solid fa-check"></i> Settle
                    </button>
                  </div>
                </div>
              ` : `
                <span class="badge settled"><i class="fa-solid fa-check"></i> Settled</span>
              `}
            </div>
          </div>
        `).join("")}
        <button class="desktop-btn" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; margin-top: 6px;" id="btn-open-add-member">
          <i class="fa-solid fa-user-plus" style="color: var(--emerald-primary);"></i> Add Member / Flatmate to Group
        </button>
      </div>
    `;
  } else if (currentTab === "analytics") {
    // Group Spend Analytics Chart (§8.2 Q4 Roadmap)
    return `
      <div class="analytics-card">
        <div class="analytics-header">
          <div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">
                TOTAL GROUP SPEND
              </span>
              <span class="investor-tag"><i class="fa-solid fa-chart-line"></i> §8.2 Analytics</span>
            </div>
            <div class="analytics-total-val">₹${analytics.totalSpend.toLocaleString()}</div>
          </div>
          <span class="badge positive">${analytics.expenseCount} Bills Logged</span>
        </div>

        <!-- 2x2 Executive KPI Grid -->
        <div class="analytics-kpi-grid">
          <div class="analytics-kpi-card">
            <span class="analytics-kpi-label">Avg / Flatmate</span>
            <span class="analytics-kpi-val">₹${analytics.avgPerPerson.toLocaleString()}</span>
            <span class="analytics-kpi-sub">Across ${analytics.memberCount || 3} members</span>
          </div>
          <div class="analytics-kpi-card">
            <span class="analytics-kpi-label">Highest Expense</span>
            <span class="analytics-kpi-val">${analytics.highestExpense ? `₹${analytics.highestExpense.totalAmount.toLocaleString()}` : "₹0"}</span>
            <span class="analytics-kpi-sub">${analytics.highestExpense ? analytics.highestExpense.title : "None"}</span>
          </div>
          <div class="analytics-kpi-card">
            <span class="analytics-kpi-label">Primary Spend</span>
            <span class="analytics-kpi-val">${analytics.categoryBreakdown[0] ? analytics.categoryBreakdown[0].category : "None"}</span>
            <span class="analytics-kpi-sub">${analytics.categoryBreakdown[0] ? `${analytics.categoryBreakdown[0].percentage}% of total` : ""}</span>
          </div>
          <div class="analytics-kpi-card">
            <span class="analytics-kpi-label">Pending Debts</span>
            <span class="analytics-kpi-val">${balances.filter(b => !b.isSettled && b.amountOwedToYou > 0).length} Active</span>
            <span class="analytics-kpi-sub">Smart debt minimization</span>
          </div>
        </div>

        <!-- Stacked Multi-Segment Progress Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">
              Category Spend Breakdown
            </div>
            <span style="font-size: 10px; color: var(--emerald-primary); font-weight: 700;">Tap row to filter bills</span>
          </div>
          <div class="stacked-progress-bar">
            ${analytics.categoryBreakdown.map(c => `
              <div class="progress-segment ${
                c.category === 'Groceries' ? 'segment-groceries' :
                c.category === 'Rent' ? 'segment-rent' :
                c.category === 'Food & Drinks' ? 'segment-food' :
                c.category === 'Travel' ? 'segment-travel' : 'segment-utilities'
              }" style="width: ${c.percentage}%; background: ${c.color || '#00855d'};" title="${c.category}: ${c.percentage}%"></div>
            `).join("")}
          </div>
        </div>

        <!-- Breakdown List -->
        <div style="display: flex; flex-direction: column;">
          ${analytics.categoryBreakdown.map(c => `
            <div class="analytics-cat-row" style="cursor: pointer;" data-analytics-filter-cat="${c.category}" title="Click to view ${c.category} bills">
              <div class="analytics-cat-left">
                <span>${c.emoji}</span>
                <span>${c.category}</span>
                <i class="fa-solid fa-arrow-right" style="font-size: 10px; color: var(--text-muted); opacity: 0.6;"></i>
              </div>
              <div class="analytics-cat-right">
                <span style="color: var(--text-secondary); font-size: 11px;">${c.percentage}%</span>
                <span>₹${c.amount.toLocaleString()}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Top Payer Leaderboard -->
        <div style="border-top: 1px dashed var(--surface-highest); padding-top: 12px;">
          <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            <i class="fa-solid fa-trophy" style="color: #f59e0b;"></i> Group Contribution Leaderboard
          </div>
          ${analytics.memberBreakdown.map((m, idx) => `
            <div class="top-payer-card">
              <div class="top-payer-card-header">
                <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">
                  #${idx + 1} ${m.name}
                </span>
                <span style="font-size: 13px; font-weight: 800; color: var(--emerald-primary);">
                  ₹${m.amount.toLocaleString()} (${m.percentage}%)
                </span>
              </div>
              <div class="leaderboard-share-bar">
                <div class="leaderboard-share-fill" style="width: ${m.percentage}%;"></div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button class="secondary-btn" id="btn-export-csv" style="flex: 1; padding: 10px; font-size: 11px; font-weight: 700;">
            <i class="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button class="whatsapp-share-btn" id="btn-share-analytics-wa" style="flex: 1; padding: 10px; font-size: 11px;">
            <i class="fa-brands fa-whatsapp"></i> Share Report
          </button>
        </div>

        <div style="background: rgba(75, 65, 225, 0.05); border: 1px solid rgba(75, 65, 225, 0.15); border-radius: 10px; padding: 10px; font-size: 11px; color: var(--indigo-secondary); line-height: 1.4;">
          <i class="fa-solid fa-lightbulb"></i> <strong>Investor Architecture Note (§8.2):</strong> Spend analytics directly powers contextual affiliate recommendation algorithms (§3.3) to maximize click-through without intrusive ads.
        </div>
      </div>
    `;
  } else {
    // Flat Rules & Rent Tab
    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: var(--tertiary-orange);">RENT RAIL</span>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Landlord UPI Account</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${group.landlordUpi || "suresh.sharma@okaxis"}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="icon-btn" id="btn-edit-landlord-upi" title="Edit Landlord UPI">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="icon-btn" id="btn-copy-landlord-upi" title="Copy Landlord UPI">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="setting-row">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Rent Auto-Split & Reminders</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Alert flatmates 4 days prior to 1st</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggle-rent-reminders" ${group.remindersOn ? "checked" : ""} />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Smart Debt Minimization</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Combine multiple cross-debts into 1 payment</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggle-smart-debt" ${group.smartDebtMinimization ? "checked" : ""} />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Rent Autopay Approval</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Auto execute landlord UPI transfer when pooled</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggle-rent-auto" ${group.rentPaymentAutomation ? "checked" : ""} />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;
  }
}

function attachGroupTabListeners(group, analytics = null) {
  mainEl.querySelectorAll("[data-pay-expense]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const payerId = btn.getAttribute("data-payer-id");
      const amount = parseFloat(btn.getAttribute("data-amount"));
      const payer = DEMO_USERS.find(m => m.id === payerId) ||
                    group.members.find(m => m.id === payerId) ||
                    ROHAN;
      openSettleSheet(payer, amount);
    });
  });

  mainEl.querySelectorAll("[data-pay-member]").forEach(btn => {
    btn.addEventListener("click", () => {
      const memberId = btn.getAttribute("data-pay-member");
      const amount = parseFloat(btn.getAttribute("data-amount"));
      const member = DEMO_USERS.find(m => m.id === memberId) ||
                     group.members.find(m => m.id === memberId) ||
                     ROHAN;
      openSettleSheet(member, amount);
    });
  });

  mainEl.querySelectorAll("[data-remind-member]").forEach(btn => {
    btn.addEventListener("click", () => {
      const memberId = btn.getAttribute("data-remind-member");
      const amount = parseFloat(btn.getAttribute("data-amount"));
      const member = DEMO_USERS.find(m => m.id === memberId) || group.members.find(m => m.id === memberId) || ROHAN;
      const cleanName = member.name.replace(/\s*\(You\)/g, '').split(" ")[0];
      const text = `Hey ${cleanName}! Friendly reminder from TicketSplit: your pending share for ${group.name} is ₹${amount.toLocaleString()}. You can pay via UPI to ${store.currentUser.upiId}. Thanks!`;
      const url = `https://wa.me/${(member.phoneNumber || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  });

  mainEl.querySelectorAll("[data-record-received]").forEach(btn => {
    btn.addEventListener("click", () => {
      const memberId = btn.getAttribute("data-record-received");
      const amount = parseFloat(btn.getAttribute("data-amount"));
      const member = DEMO_USERS.find(m => m.id === memberId) || group.members.find(m => m.id === memberId) || ROHAN;
      openRecordReceivedSheet(member, amount);
    });
  });

  mainEl.querySelectorAll("[data-settle-member]").forEach(btn => {
    btn.addEventListener("click", () => {
      const memberId = btn.getAttribute("data-settle-member");
      const amount = parseFloat(btn.getAttribute("data-amount"));
      const member = DEMO_USERS.find(m => m.id === memberId) || group.members.find(m => m.id === memberId) || ROHAN;
      openSettleSheet(member, amount);
    });
  });

  mainEl.querySelectorAll("[data-edit-member-upi]").forEach(el => {
    el.addEventListener("click", () => {
      const mId = el.getAttribute("data-edit-member-upi");
      openEditUpiModal("member", mId);
    });
  });

  document.getElementById("btn-copy-landlord-upi")?.addEventListener("click", () => {
    copyText(group.landlordUpi || "suresh.sharma@okaxis", "Landlord UPI ID");
  });

  document.getElementById("btn-edit-landlord-upi")?.addEventListener("click", () => {
    openEditUpiModal("landlord", group.id);
  });

  document.getElementById("toggle-rent-reminders")?.addEventListener("change", () => {
    store.toggleRentReminder(group.id);
    showToast("Rent reminder settings updated");
  });

  document.getElementById("toggle-smart-debt")?.addEventListener("change", () => {
    store.toggleSmartDebt(group.id);
    showToast("Smart debt minimization updated");
  });

  document.getElementById("toggle-rent-auto")?.addEventListener("change", () => {
    store.toggleRentAutomation(group.id);
    showToast("Rent Autopay approval preferences saved");
  });

  document.getElementById("clear-search")?.addEventListener("click", () => {
    expenseSearchQuery = "";
    renderGroupDetails();
  });

  document.getElementById("btn-open-add-member")?.addEventListener("click", () => {
    openAddMemberModal(group.id);
  });

  // Analytics Category Tap -> Switch to Expenses tab & Filter
  mainEl.querySelectorAll("[data-analytics-filter-cat]").forEach(row => {
    row.addEventListener("click", () => {
      const cat = row.getAttribute("data-analytics-filter-cat");
      expenseCategoryFilter = cat;
      currentTab = "expenses";
      showToast(`Showing ${cat} expenses`);
      renderGroupDetails();
    });
  });

  // Export CSV
  document.getElementById("btn-export-csv")?.addEventListener("click", () => {
    const csvContent = store.exportGroupSpendCsv(group.id);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ticketsplit-${group.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-spend.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Group spend CSV exported successfully!");
  });

  // Share Analytics on WhatsApp
  document.getElementById("btn-share-analytics-wa")?.addEventListener("click", () => {
    if (!analytics) return;
    let waMsg = `📊 *TicketSplit Spend Analytics — ${group.name}*\n\n`;
    waMsg += `💰 *Total Spend:* ₹${analytics.totalSpend.toLocaleString()}\n`;
    waMsg += `👥 *Average / Person:* ₹${analytics.avgPerPerson.toLocaleString()}\n`;
    waMsg += `🧾 *Total Bills:* ${analytics.expenseCount}\n\n`;
    waMsg += `*Top Categories:*\n`;
    analytics.categoryBreakdown.forEach(c => {
      waMsg += `• ${c.emoji} ${c.category}: ₹${c.amount.toLocaleString()} (${c.percentage}%)\n`;
    });
    waMsg += `\n*Top Spenders:*\n`;
    analytics.memberBreakdown.forEach((m, i) => {
      waMsg += `${i + 1}. ${m.name}: ₹${m.amount.toLocaleString()} (${m.percentage}%)\n`;
    });
    waMsg += `\nGenerated by TicketSplit (Zero Custody UPI Split Companion)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`, "_blank");
  });
}

function shareGroupOnWhatsApp() {
  const group = store.selectedGroup;
  const balances = store.getGroupBalances(group.id);
  const sharedLink = `${window.location.origin}/?view=shared&groupId=${group.id}&memberId=${ROHAN.id}`;

  let text = `🏠 *TicketSplit Summary — ${group.name}*\n\n`;
  text += `📅 *Month Total:* ₹${(group.totalSpendMonth || 0).toLocaleString()}\n`;
  if (group.monthlyRent > 0) {
    text += `⚡ *Rent Due:* ₹${group.monthlyRent.toLocaleString()} (${group.rentDueDateText})\n`;
    text += `Landlord UPI: ${group.landlordUpi}\n`;
  }
  text += `\n*Pending Balances:*\n`;
  balances.forEach(b => {
    if (!b.isSettled && b.amountOwedToYou > 0) {
      text += `• ${b.member.name} owes ₹${b.amountOwedToYou.toLocaleString()} (UPI: ${b.member.upiId})\n`;
    }
  });
  text += `\n👉 *View & Settle without app:* ${sharedLink}`;

  openSheet("Share on WhatsApp", `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <p style="font-size: 13px; color: var(--text-secondary);">Pre-formatted WhatsApp message for flatmates with direct shared balance link:</p>
      <div style="background: var(--surface-container); padding: 12px; border-radius: 12px; font-size: 12px; font-family: monospace; white-space: pre-wrap;">${text}</div>
      <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(text)}" target="_blank" class="whatsapp-share-btn" style="text-decoration: none;">
        <i class="fa-brands fa-whatsapp" style="font-size: 18px;"></i> Open in WhatsApp
      </a>
      <button class="desktop-btn" style="justify-content: center; padding: 12px;" id="btn-copy-wa-text">
        <i class="fa-regular fa-copy"></i> Copy Text & Link
      </button>
    </div>
  `, () => {
    document.getElementById("btn-copy-wa-text")?.addEventListener("click", () => {
      copyText(text, "WhatsApp message & link copied");
    });
  });
}

// -------------------------------------------------------------
// 4. ADD EXPENSE SCREEN (4 Split Tabs (§2.8), Camera Upload)
// -------------------------------------------------------------
let expenseFormState = {
  amount: "2840",
  title: "Monthly Groceries & Bisleri cans",
  category: "Groceries",
  categoryEmoji: "🛒",
  paidById: "m1",
  splitMode: "Equally", // "Equally" | "Unequally" | "By Percent" | "Itemized"
  memberSplits: {},
  includedMemberIds: ["m1", "m2", "m3", "m4"],
  receiptName: "grocery_bill_oct.jpg",
  receiptUrl: null
};

const CATEGORIES = [
  { name: "Groceries", emoji: "🛒" },
  { name: "Utilities", emoji: "⚡" },
  { name: "Rent & Maid", emoji: "🏠" },
  { name: "Food & Drinks", emoji: "🍕" },
  { name: "Travel", emoji: "🚕" },
  { name: "Fun & Movies", emoji: "🎟️" }
];

cameraFileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      expenseFormState.receiptUrl = evt.target.result;
      expenseFormState.receiptName = file.name;
      showToast(`Receipt photo attached: ${file.name}`);
      if (currentRoute === "add_expense") {
        renderAddExpense();
      }
    };
    reader.readAsDataURL(file);
  }
});

function renderAddExpense() {
  const group = store.selectedGroup;
  const members = group.members || DEMO_USERS;
  const parsedAmount = parseFloat(expenseFormState.amount) || 0;
  const splitCount = Math.max(1, expenseFormState.includedMemberIds.length);
  const perPerson = parsedAmount / splitCount;

  mainEl.innerHTML = `
    <div class="page-view">
      <!-- Big Amount Input Hero -->
      <div class="amount-input-hero">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">ENTER TOTAL AMOUNT</span>
        <div class="amount-currency-row">
          <span class="currency-sym">₹</span>
          <input type="number" class="big-amount-field" id="expense-amount-input" value="${expenseFormState.amount}" placeholder="0" />
        </div>
        <div class="split-preview-chip">
          ${expenseFormState.splitMode === "Equally"
            ? `₹${perPerson.toFixed(2)} / person (${splitCount} members)`
            : `${expenseFormState.splitMode} Split Mode Active`
          }
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Description / Merchant</label>
        <input type="text" class="text-input" id="expense-title-input" value="${expenseFormState.title}" placeholder="e.g. Swiggy, Broadband, Blinkit..." />
      </div>

      <!-- Category Quick Chips (§2.8) -->
      <div class="form-group">
        <label class="form-label">Category Quick Chips</label>
        <div class="category-scroll-pills">
          ${CATEGORIES.map(cat => `
            <button class="category-pill-btn ${expenseFormState.category === cat.name ? 'active' : ''}" data-cat-name="${cat.name}" data-cat-emoji="${cat.emoji}">
              <span>${cat.emoji}</span>
              <span>${cat.name}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Receipt Camera Box -->
      ${expenseFormState.receiptUrl ? `
        <div class="receipt-preview-box">
          <img src="${expenseFormState.receiptUrl}" alt="Receipt Preview" />
          <div class="receipt-remove-btn" id="btn-remove-receipt">
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
      ` : `
        <div class="ocr-box" id="btn-snap-receipt-box">
          <div class="ocr-info">
            <div class="ocr-icon">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <div class="ocr-title">Snap or Upload Receipt</div>
              <div class="ocr-sub">${expenseFormState.receiptName || "Click to snap photo with phone camera or upload image"}</div>
            </div>
          </div>
          <i class="fa-solid fa-plus" style="color: var(--indigo-secondary); font-size: 16px;"></i>
        </div>
      `}

      <!-- Paid By Selector -->
      <div class="form-group">
        <label class="form-label">Paid by</label>
        <select class="text-input" id="expense-paidby-select">
          ${members.map(m => `
            <option value="${m.id}" ${expenseFormState.paidById === m.id ? "selected" : ""}>
              ${m.name.replace(/\s*\(You\)/g, '')} ${m.isCurrentUser ? "(You)" : ""}
            </option>
          `).join("")}
        </select>
      </div>

      <!-- 4 Split Method Tabs (§2.8) -->
      <div class="form-group">
        <label class="form-label">Split Method</label>
        <div class="split-mode-selector">
          <div class="split-mode-tab ${expenseFormState.splitMode === 'Equally' ? 'active' : ''}" data-mode="Equally">
            Equal (=)
          </div>
          <div class="split-mode-tab ${expenseFormState.splitMode === 'Unequally' ? 'active' : ''}" data-mode="Unequally">
            Custom (₹)
          </div>
          <div class="split-mode-tab ${expenseFormState.splitMode === 'By Percent' ? 'active' : ''}" data-mode="By Percent">
            Percent (%)
          </div>
          <div class="split-mode-tab stub" id="btn-split-itemized">
            Itemized <span class="stub-badge">v1.1</span>
          </div>
        </div>
      </div>

      <!-- Members Split Checklist -->
      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label class="form-label">Members Share</label>
          <span style="font-size: 11px; color: var(--emerald-primary); font-weight: 700; cursor: pointer;" id="btn-select-all-members">
            Select All
          </span>
        </div>

        <div class="split-members-list">
          ${members.map(m => {
            const isChecked = expenseFormState.includedMemberIds.includes(m.id);
            const customVal = expenseFormState.memberSplits[m.id] !== undefined
              ? expenseFormState.memberSplits[m.id]
              : expenseFormState.splitMode === "By Percent" ? (100 / splitCount).toFixed(0) : perPerson.toFixed(0);

            return `
              <div class="split-member-row" data-member-id="${m.id}">
                <div class="split-member-left">
                  <div class="custom-checkbox ${isChecked ? 'checked' : ''}" data-toggle-check="${m.id}">
                    ${isChecked ? '<i class="fa-solid fa-check"></i>' : ''}
                  </div>
                  <img class="split-member-avatar" src="${m.avatarUrl}" alt="${m.name}" />
                  <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                    ${m.name.replace(/\s*\(You\)/g, '')} ${m.isCurrentUser ? "(You)" : ""}
                  </span>
                </div>

                <div>
                  ${expenseFormState.splitMode === "Equally" ? `
                    <span style="font-size: 13px; font-weight: 700; color: ${isChecked ? 'var(--text-primary)' : 'var(--text-muted)'};">
                      ${isChecked ? `₹${perPerson.toFixed(2)}` : '₹0.00'}
                    </span>
                  ` : expenseFormState.splitMode === "Unequally" ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="font-size: 12px; font-weight: 700;">₹</span>
                      <input type="number" class="split-input-small" data-split-input="${m.id}" value="${customVal}" />
                    </div>
                  ` : `
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <input type="number" class="split-input-small" data-split-input="${m.id}" value="${customVal}" />
                      <span style="font-size: 12px; font-weight: 700;">%</span>
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Save Button -->
      <button class="primary-action-btn" id="btn-save-expense">
        <i class="fa-solid fa-receipt"></i> Save Expense
      </button>
    </div>
  `;

  // Attach Listeners
  const amtInput = document.getElementById("expense-amount-input");
  amtInput?.addEventListener("input", (e) => {
    expenseFormState.amount = e.target.value;
  });

  document.getElementById("expense-title-input")?.addEventListener("input", (e) => {
    expenseFormState.title = e.target.value;
  });

  mainEl.querySelectorAll(".category-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      expenseFormState.category = btn.getAttribute("data-cat-name");
      expenseFormState.categoryEmoji = btn.getAttribute("data-cat-emoji");
      renderAddExpense();
    });
  });

  document.getElementById("btn-snap-receipt-box")?.addEventListener("click", () => {
    cameraFileInput.click();
  });

  document.getElementById("btn-remove-receipt")?.addEventListener("click", () => {
    expenseFormState.receiptUrl = null;
    expenseFormState.receiptName = null;
    renderAddExpense();
  });

  document.getElementById("expense-paidby-select")?.addEventListener("change", (e) => {
    expenseFormState.paidById = e.target.value;
  });

  mainEl.querySelectorAll(".split-mode-tab[data-mode]").forEach(tab => {
    tab.addEventListener("click", () => {
      expenseFormState.splitMode = tab.getAttribute("data-mode");
      renderAddExpense();
    });
  });

  document.getElementById("btn-split-itemized")?.addEventListener("click", () => {
    showToast("Itemized OCR line-item split is in development for v1.1!");
  });

  mainEl.querySelectorAll("[data-toggle-check]").forEach(chk => {
    chk.addEventListener("click", (e) => {
      e.stopPropagation();
      const mId = chk.getAttribute("data-toggle-check");
      if (expenseFormState.includedMemberIds.includes(mId)) {
        if (expenseFormState.includedMemberIds.length > 1) {
          expenseFormState.includedMemberIds = expenseFormState.includedMemberIds.filter(id => id !== mId);
        } else {
          showToast("At least 1 member must be included");
        }
      } else {
        expenseFormState.includedMemberIds.push(mId);
      }
      renderAddExpense();
    });
  });

  mainEl.querySelectorAll("[data-split-input]").forEach(input => {
    input.addEventListener("input", (e) => {
      const mId = input.getAttribute("data-split-input");
      expenseFormState.memberSplits[mId] = parseFloat(e.target.value) || 0;
    });
  });

  document.getElementById("btn-select-all-members")?.addEventListener("click", () => {
    expenseFormState.includedMemberIds = members.map(m => m.id);
    renderAddExpense();
  });

  document.getElementById("btn-save-expense")?.addEventListener("click", () => {
    const amt = parseFloat(expenseFormState.amount);
    if (!amt || amt <= 0) {
      showToast("Please enter a valid amount");
      return;
    }

    const payer = members.find(m => m.id === expenseFormState.paidById) || store.currentUser;

    store.addExpense({
      groupId: group.id,
      title: expenseFormState.title || "Group Expense",
      amount: amt,
      paidByMember: payer,
      category: expenseFormState.category,
      categoryEmoji: expenseFormState.categoryEmoji,
      splitMode: expenseFormState.splitMode,
      memberSplits: expenseFormState.memberSplits,
      includedMemberIds: expenseFormState.includedMemberIds,
      receiptName: expenseFormState.receiptName,
      receiptUrl: expenseFormState.receiptUrl
    });

    showToast(`Saved expense ₹${amt.toLocaleString()} (${expenseFormState.splitMode})!`);
    navigateTo("group_details", { tab: "expenses" });
  });
}

// -------------------------------------------------------------
// 5. SETTLE UP INTENT & VERIFICATION HANDSHAKE (§2.9)
// -------------------------------------------------------------
function renderUpiFlow() {
  const payee = store.state.settlePayee || ROHAN;
  const amount = store.state.settleAmount || 2100.0;
  const steps = store.state.settlementSteps;
  const upiUri = buildUpiUri(payee.upiId, payee.name, amount);

  mainEl.innerHTML = `
    <div class="page-view">
      <div class="upi-hero-card">
        <div class="payee-header">
          <div class="payee-meta">
            <img class="payee-avatar-lg" src="${payee.avatarUrl}" alt="${payee.name}" />
            <div>
              <div class="payee-name">${payee.name}</div>
              <div class="payee-vpa" id="btn-copy-payee-vpa">
                <span>${payee.upiId}</span> <i class="fa-regular fa-copy"></i>
              </div>
            </div>
          </div>
          <span class="npci-badge"><i class="fa-solid fa-shield-check"></i> NPCI Verified</span>
        </div>

        <div class="upi-amount-block">
          <span class="upi-amount-title">Settlement Amount</span>
          <span class="upi-amount-value">₹${amount.toLocaleString()}</span>
        </div>
      </div>

      <div class="tabs-header">
        <div class="tab-button ${upiSubTab === 'apps' ? 'active' : ''}" id="tab-upi-apps">
          <i class="fa-solid fa-mobile-screen"></i> UPI Apps
        </div>
        <div class="tab-button ${upiSubTab === 'qr' ? 'active' : ''}" id="tab-upi-qr">
          <i class="fa-solid fa-qrcode"></i> Scan QR Code
        </div>
      </div>

      <div id="upi-mode-content">
        ${upiSubTab === "apps" ? `
          <div class="upi-apps-list">
            <div class="upi-app-tile" data-app="gpay">
              <span class="upi-app-badge">INSTANT</span>
              <div class="upi-app-left">
                <div class="upi-app-logo gpay">GPay</div>
                <div class="upi-app-details">
                  <span class="upi-app-name">Google Pay</span>
                  <span class="upi-app-note">Pay directly via GPay Intent</span>
                </div>
              </div>
              <i class="fa-solid fa-arrow-right" style="color: var(--text-muted);"></i>
            </div>

            <div class="upi-app-tile" data-app="phonepe">
              <div class="upi-app-left">
                <div class="upi-app-logo phonepe">पे</div>
                <div class="upi-app-details">
                  <span class="upi-app-name">PhonePe</span>
                  <span class="upi-app-note">Pay via PhonePe App</span>
                </div>
              </div>
              <i class="fa-solid fa-arrow-right" style="color: var(--text-muted);"></i>
            </div>

            <div class="upi-app-tile" data-app="paytm">
              <div class="upi-app-left">
                <div class="upi-app-logo paytm">Paytm</div>
                <div class="upi-app-details">
                  <span class="upi-app-name">Paytm UPI</span>
                  <span class="upi-app-note">Wallet or Bank transfer</span>
                </div>
              </div>
              <i class="fa-solid fa-arrow-right" style="color: var(--text-muted);"></i>
            </div>

            <div class="upi-app-tile" data-app="bhim">
              <div class="upi-app-left">
                <div class="upi-app-logo bhim"><i class="fa-solid fa-bolt"></i></div>
                <div class="upi-app-details">
                  <span class="upi-app-name">BHIM UPI / Any UPI App</span>
                  <span class="upi-app-note">Standard NPCI UPI deeplink</span>
                </div>
              </div>
              <i class="fa-solid fa-arrow-right" style="color: var(--text-muted);"></i>
            </div>
          </div>
          <div style="background: rgba(0, 133, 93, 0.08); border: 1px dashed rgba(0, 133, 93, 0.3); border-radius: 12px; padding: 10px 12px; font-size: 11px; color: var(--emerald-primary); display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span><i class="fa-solid fa-qrcode"></i> <strong>Desktop or Phone Scanner:</strong> Tap <strong>Scan QR Code</strong> above to pay instantly.</span>
            <button class="desktop-btn" style="font-size: 10px; padding: 4px 8px;" id="btn-quick-switch-qr">Open QR</button>
          </div>
        ` : `
          <div class="qr-container">
            <div class="qr-canvas-box">
              <canvas id="live-upi-qr-canvas" width="200" height="200"></canvas>
            </div>
            <span class="qr-caption">Scan with GPay, PhonePe, Paytm, CRED or BHIM</span>
          </div>
        `}
      </div>

      <div class="timeline-card">
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">
          Settlement Rail Tracker
        </div>

        <div style="display: flex; flex-direction: column;">
          ${steps.map((step, idx) => `
            <div class="timeline-step">
              ${idx < steps.length - 1 ? '<div class="timeline-line"></div>' : ''}
              <div class="step-marker ${step.status.toLowerCase()}">
                ${step.status === 'COMPLETED' ? '<i class="fa-solid fa-check"></i>' : idx + 1}
              </div>
              <div class="step-content">
                <div class="step-header">
                  <span class="step-title">${step.title}</span>
                  <span class="step-badge ${step.status.toLowerCase()}">${step.timeOrBadge}</span>
                </div>
                <span class="step-desc">${step.description}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 4px;">
        <button class="primary-action-btn" style="flex: 2; margin-top: 0;" id="btn-execute-upi-settle">
          <i class="fa-solid fa-bolt"></i> Pay via UPI Now
        </button>
        <button class="desktop-btn" style="flex: 1; padding: 14px; border-radius: 20px; font-size: 13px; justify-content: center;" id="btn-enter-utr">
          Manual UTR
        </button>
      </div>
    </div>
  `;

  if (upiSubTab === "qr") {
    const canvas = document.getElementById("live-upi-qr-canvas");
    if (canvas) drawUpiQrCanvas(canvas, upiUri, 200);
  }

  // Attach Listeners
  document.getElementById("btn-copy-payee-vpa")?.addEventListener("click", () => copyText(payee.upiId, "Payee VPA"));
  document.getElementById("tab-upi-apps")?.addEventListener("click", () => {
    upiSubTab = "apps";
    renderUpiFlow();
  });
  document.getElementById("tab-upi-qr")?.addEventListener("click", () => {
    upiSubTab = "qr";
    renderUpiFlow();
  });
  document.getElementById("btn-quick-switch-qr")?.addEventListener("click", () => {
    upiSubTab = "qr";
    renderUpiFlow();
  });

  mainEl.querySelectorAll("[data-app]").forEach(tile => {
    tile.addEventListener("click", () => {
      const app = tile.getAttribute("data-app");
      executeUpiPayment(app, payee, amount);
    });
  });

  document.getElementById("btn-execute-upi-settle")?.addEventListener("click", () => {
    executeUpiPayment("GPay", payee, amount);
  });

  document.getElementById("btn-enter-utr")?.addEventListener("click", () => {
    openSheet("Record Bank UTR Reference", `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <p style="font-size: 13px; color: var(--text-secondary);">Enter the 12-digit UTR or Reference number from your bank SMS/app:</p>
        <input type="text" class="text-input" id="input-utr" placeholder="e.g. 429188201945" value="429188201945" />
        <button class="primary-action-btn" id="btn-confirm-utr">
          <i class="fa-solid fa-check"></i> Verify & Settle Ledger
        </button>
      </div>
    `, () => {
      document.getElementById("btn-confirm-utr")?.addEventListener("click", () => {
        const utrVal = document.getElementById("input-utr")?.value || "429188201945";
        store.settleMemberDebt(payee.id, utrVal);
        closeSheet();
        showToast(`Settled with UTR ${utrVal}!`);
        navigateTo("group_details", { tab: "balances" });
      });
    });
  });
}

// Settle Up: "Did the payment go through?" Handshake (§2.9 Step 3)
function triggerPaymentConfirmationDialog(payee, amount) {
  setTimeout(() => {
    openSheet("Confirm UPI Settlement", `
      <div style="display: flex; flex-direction: column; gap: 16px; text-align: center;">
        <div style="font-size: 40px; color: var(--emerald-primary);">
          <i class="fa-solid fa-circle-question"></i>
        </div>
        <div>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Did the payment go through?</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            Payment of <strong>₹${amount.toLocaleString()}</strong> to <strong>${payee.name}</strong> (${payee.upiId}).
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="primary-action-btn" style="flex: 1; margin-top: 0;" id="btn-handshake-yes">
            <i class="fa-solid fa-check"></i> Yes, Mark Settled
          </button>
          <button class="danger-btn" style="flex: 1;" id="btn-handshake-no">
            No / Cancelled
          </button>
        </div>
      </div>
    `, () => {
      document.getElementById("btn-handshake-yes")?.addEventListener("click", () => {
        store.settleMemberDebt(payee.id, "UPI_INTENT_SUCCESS");
        closeSheet();
        showToast("Settled! Ledger updated and balance zeroed.");
        setTimeout(() => {
          openSettlementCelebrationModal(payee, amount);
        }, 200);
      });

      document.getElementById("btn-handshake-no")?.addEventListener("click", () => {
        closeSheet();
        showToast("Balance stays pending. You can retry settlement anytime.");
      });
    });
  }, 700);
}

// -------------------------------------------------------------
// 6. ACTIVITY FEED
// -------------------------------------------------------------
function renderActivityFeed() {
  const expenses = store.state.expenses;

  mainEl.innerHTML = `
    <div class="page-view">
      <div class="card" style="padding: 16px;">
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Activity & History</h2>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
          Chronological ledger of all splits, settlements, and rent transfers.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${expenses.map(exp => `
          <div class="expense-item">
            <div class="expense-left">
              <div class="category-emoji-box">${exp.categoryEmoji || "🧾"}</div>
              <div class="expense-title-col">
                <span class="expense-name">${exp.title}</span>
                <span class="expense-desc">${exp.dateText} • ${exp.splitSummary}</span>
              </div>
            </div>
            <div class="expense-right">
              <span class="expense-total">₹${exp.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 7. SETTINGS SCREEN
// -------------------------------------------------------------
function renderSettings() {
  const settings = store.state.settings || {};
  const user = store.currentUser;
  const isSupabase = isSupabaseConfigured();

  mainEl.innerHTML = `
    <div class="page-view">
      <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 18px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${user.avatarUrl}" alt="${user.name}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--emerald-primary);" />
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary);">${user.name}</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${user.upiId}</p>
            <span class="badge positive" style="margin-top: 6px;">
              <i class="fa-solid fa-circle-check"></i> Phone Verified
            </span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-direction: column; align-items: flex-end;">
          <button class="desktop-btn" id="btn-edit-my-name-settings">
            <i class="fa-solid fa-user-pen"></i> Edit Name
          </button>
          <button class="desktop-btn" id="btn-edit-my-upi-settings">
            <i class="fa-solid fa-pen"></i> Edit UPI
          </button>
        </div>
      </div>

      <div class="card">
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Automation Preferences
        </div>

        <div class="setting-row">
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Auto-Sync from SMS</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Parse Swiggy, Blinkit, and bank alerts</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="set-sms" ${settings.autoSmsSync ? "checked" : ""} />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Push Notifications</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Alert on bill splits and settlements</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="set-notifs" ${settings.pushNotifications ? "checked" : ""} />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">
          Data & Privacy
        </div>

        <button class="danger-btn" id="btn-clear-user-usages">
          <i class="fa-solid fa-eraser"></i> Clear My Transactions & Debts
        </button>

        <button class="desktop-btn" style="width: 100%; justify-content: center; padding: 12px; color: var(--text-muted);" id="btn-reset-demo">
          <i class="fa-solid fa-rotate-left"></i> Reset to Default Demo Data
        </button>

        <button class="desktop-btn" style="width: 100%; justify-content: center; padding: 12px; color: var(--error-red); border-color: var(--error-container);" id="btn-logout-phone">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn-edit-my-upi-settings")?.addEventListener("click", () => openEditUpiModal("personal"));

  document.getElementById("set-sms")?.addEventListener("change", (e) => {
    store.updateSettings({ autoSmsSync: e.target.checked });
    showToast("SMS Sync preference saved");
  });

  document.getElementById("set-notifs")?.addEventListener("change", (e) => {
    store.updateSettings({ pushNotifications: e.target.checked });
    showToast("Notification preference saved");
  });

  document.getElementById("btn-clear-user-usages")?.addEventListener("click", () => {
    if (confirm("Clear your personal transaction history and reset your group balance to zero?")) {
      store.clearUserUsages();
      showToast("User usages and personal history cleared!");
      renderSettings();
    }
  });

  document.getElementById("btn-reset-demo")?.addEventListener("click", () => {
    if (confirm("Restore all groups, members, and expenses to default demo state?")) {
      store.resetAllData();
      showToast("All data restored to defaults!");
      renderSettings();
    }
  });

  document.getElementById("btn-edit-my-name-settings")?.addEventListener("click", () => {
    openSheet("Edit Your Name", `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <label class="form-label">Full Name</label>
        <input type="text" class="text-input" id="inp-settings-name" value="${user.name.replace(/\s*\(You\)/g, '')}" placeholder="Enter your full name" />
        <button class="primary-action-btn" id="btn-save-settings-name">
          <i class="fa-solid fa-check"></i> Save Name
        </button>
      </div>
    `, () => {
      document.getElementById("btn-save-settings-name")?.addEventListener("click", () => {
        const val = document.getElementById("inp-settings-name")?.value || "";
        if (val.trim()) {
          store.updateUserName(val.trim());
          closeSheet();
          showToast(`Name updated to ${val.trim()}!`);
          renderApp();
        }
      });
    });
  });

  document.getElementById("btn-logout-phone")?.addEventListener("click", () => {
    store.logout();
    onboardingStep = "phone";
    showToast("Logged out successfully");
    renderApp();
  });
}

// -------------------------------------------------------------
// MODALS
// -------------------------------------------------------------

function openPerkDetailsSheet(offer) {
  openSheet(`${offer.partnerName} Perk`, `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="perk-icon-box" style="width: 50px; height: 50px; font-size: 22px; border-radius: 14px;">
          <i class="${offer.icon}"></i>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="perk-badge">${offer.badge}</span>
            <span class="investor-tag"><i class="fa-solid fa-gem"></i> §3.3 Affiliate</span>
          </div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${offer.title}</h3>
        </div>
      </div>

      <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
        ${offer.description}
      </div>

      <div style="background: var(--surface-low); border: 1px dashed var(--surface-highest); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">PROMO COUPON CODE</div>
          <div style="font-size: 18px; font-weight: 900; color: var(--emerald-primary); letter-spacing: 1px;">${offer.promoCode}</div>
        </div>
        <button class="primary-action-btn" style="margin-top: 0; padding: 8px 16px; width: auto;" id="btn-modal-copy-code">
          <i class="fa-solid fa-copy"></i> Copy Code
        </button>
      </div>

      <div style="font-size: 11px; color: var(--text-muted);">
        <i class="fa-solid fa-circle-check" style="color: var(--emerald-primary);"></i> <strong>Terms:</strong> ${offer.terms || "Valid on partner bookings. Instant discount applied at checkout."}
      </div>

      <div style="background: rgba(75, 65, 225, 0.06); border: 1px solid rgba(75, 65, 225, 0.18); border-radius: 12px; padding: 10px 12px; font-size: 11px; color: var(--indigo-secondary); line-height: 1.4;">
        <i class="fa-solid fa-chart-pie"></i> <strong>Investor Architecture (§3.3 Monetization Engine):</strong> Zero fund custody model. TicketSplit earns <strong>${offer.commissionRate || "10-15% commission"}</strong> per conversion, maintaining a clean, ad-free group ledger experience.
      </div>

      <div style="display: flex; gap: 8px;">
        <a href="${offer.linkUrl}" target="_blank" class="primary-action-btn" style="margin-top: 0; text-align: center; text-decoration: none; flex: 1;" id="btn-open-partner-link">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Partner Web / App
        </a>
        <button class="danger-btn" style="flex: 1;" id="btn-close-perk-modal">Close</button>
      </div>
    </div>
  `, () => {
    document.getElementById("btn-modal-copy-code")?.addEventListener("click", () => copyText(offer.promoCode, "Coupon Code"));
    document.getElementById("btn-close-perk-modal")?.addEventListener("click", closeSheet);
    document.getElementById("btn-open-partner-link")?.addEventListener("click", () => {
      copyText(offer.promoCode, "Coupon copied");
      closeSheet();
    });
  });
}

function openSettlementCelebrationModal(payee, amount) {
  const settleOffer = AFFILIATE_OFFERS.settlement;
  openSheet("Payment Settled", `
    <div class="settlement-celebration-sheet">
      <div class="celebration-icon-box">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div>
        <h3 style="font-size: 19px; font-weight: 800; color: var(--text-primary);">Settlement Confirmed!</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          Paid <strong>₹${amount.toLocaleString()}</strong> to <strong>${payee.name}</strong> (${payee.upiId}). Cross-debt zeroed out!
        </p>
      </div>

      <!-- Contextual Post-Settlement Perk Card (§3.3) -->
      <div class="affiliate-perk-card" style="text-align: left; background: rgba(0, 133, 93, 0.06); border: 1px solid rgba(0, 133, 93, 0.25); cursor: pointer;" id="btn-settlement-perk-card">
        <div class="perk-left">
          <div class="perk-icon-box" style="background: rgba(0, 133, 93, 0.15); color: var(--emerald-primary);">
            <i class="${settleOffer.icon}"></i>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span class="perk-badge" style="background: rgba(0, 133, 93, 0.2); color: var(--emerald-primary);">
                ${settleOffer.badge}
              </span>
              <span class="investor-tag"><i class="fa-solid fa-gem"></i> §3.3</span>
            </div>
            <div class="perk-title">${settleOffer.title}</div>
            <div class="perk-desc">${settleOffer.description}</div>
          </div>
        </div>
        <button class="perk-claim-btn" id="btn-copy-settle-code" style="background: var(--emerald-primary);">
          ${settleOffer.promoCode}
        </button>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="whatsapp-share-btn" style="flex: 1;" id="btn-share-settle-slip">
          <i class="fa-brands fa-whatsapp"></i> Share Slip
        </button>
        <button class="primary-action-btn" style="flex: 1; margin-top: 0;" id="btn-done-celebrate">
          Done
        </button>
      </div>
    </div>
  `, () => {
    document.getElementById("btn-copy-settle-code")?.addEventListener("click", () => {
      copyText(settleOffer.promoCode, "Settlement Coupon Code");
      window.open(settleOffer.linkUrl, "_blank");
    });
    document.getElementById("btn-settlement-perk-card")?.addEventListener("click", () => {
      openPerkDetailsSheet(settleOffer);
    });
    document.getElementById("btn-share-settle-slip")?.addEventListener("click", () => {
      const msg = `✅ *TicketSplit Settlement Confirmation*\nPaid ₹${amount.toLocaleString()} to ${payee.name} (${payee.upiId}) via UPI.\nLedger balance is zeroed.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    });
    document.getElementById("btn-done-celebrate")?.addEventListener("click", () => {
      closeSheet();
      navigateTo("group_details", { tab: "balances" });
    });
  });
}

function openDesktopUpiAssistant(appName, payee, amount, uri) {
  openSheet(`Pay with ${appName.toUpperCase()}`, `
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;">
      <div style="background: rgba(0, 133, 93, 0.08); border-radius: 14px; padding: 12px 14px; width: 100%; text-align: left; border: 1px solid rgba(0, 133, 93, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: var(--emerald-primary);">SETTLEMENT AMOUNT</span>
          <span style="font-size: 9.5px; font-weight: 800; background: var(--surface-highest); padding: 2px 8px; border-radius: 4px; color: var(--text-secondary);">DESKTOP QR PAY</span>
        </div>
        <div style="font-size: 26px; font-weight: 900; color: var(--text-primary); margin-top: 4px;">
          ₹${amount.toLocaleString()}
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
          Payee: <strong>${payee.name}</strong> • <code>${payee.upiId}</code>
        </div>
      </div>

      <div style="background: var(--surface-low); border: 1px solid var(--surface-highest); border-radius: 16px; padding: 14px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--text-primary);">
          <i class="fa-solid fa-camera"></i> Scan with your smartphone's ${appName.toUpperCase()} / GPay / PhonePe:
        </div>
        <div class="qr-canvas-box" style="padding: 10px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
          <canvas id="desktop-assistant-qr" width="200" height="200"></canvas>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">
          Point your phone camera or any UPI scanner directly at this screen
        </span>
      </div>

      <div style="display: flex; gap: 8px; width: 100%;">
        <button class="desktop-btn" style="flex: 1; justify-content: center; font-size: 11px; padding: 10px;" id="btn-copy-assistant-vpa">
          <i class="fa-solid fa-copy"></i> Copy VPA
        </button>
        <button class="desktop-btn" style="flex: 1; justify-content: center; font-size: 11px; padding: 10px;" id="btn-copy-assistant-link">
          <i class="fa-solid fa-link"></i> Copy UPI Link
        </button>
      </div>

      <div style="border-top: 1px dashed var(--surface-highest); padding-top: 12px; width: 100%;">
        <button class="primary-action-btn" style="margin-top: 0; width: 100%;" id="btn-desktop-confirm-paid">
          <i class="fa-solid fa-circle-check"></i> I've Completed Payment via Phone
        </button>
      </div>
    </div>
  `, () => {
    const cvs = document.getElementById("desktop-assistant-qr");
    if (cvs) drawUpiQrCanvas(cvs, uri, 200);

    document.getElementById("btn-copy-assistant-vpa")?.addEventListener("click", () => copyText(payee.upiId, "Payee VPA"));
    document.getElementById("btn-copy-assistant-link")?.addEventListener("click", () => copyText(uri, "UPI Intent URI"));

    document.getElementById("btn-desktop-confirm-paid")?.addEventListener("click", () => {
      store.settleMemberDebt(payee.id, "UPI_QR_SCANNED");
      closeSheet();
      showToast("Settled! Ledger updated and balance zeroed.");
      setTimeout(() => {
        openSettlementCelebrationModal(payee, amount);
      }, 200);
    });
  });
}

function executeUpiPayment(appName, payee, amount) {
  const result = launchUpiApp(appName, payee.upiId, payee.name, amount);

  if (result.isMobile) {
    showToast(`Opening ${appName.toUpperCase()} on mobile...`);
    triggerPaymentConfirmationDialog(payee, amount);
  } else {
    // Desktop environment: open assistant with dynamic scannable QR code & copy options
    openDesktopUpiAssistant(appName, payee, amount, result.uri);
  }
}

function openEditUpiModal(type = "personal", targetId = null) {
  let modalTitle = "Edit Your UPI ID";
  let defaultVal = store.currentUser.upiId;
  let subtitle = "This is the UPI ID other flatmates will send settlements to.";

  if (type === "flat") {
    modalTitle = "Edit Flat UPI Account";
    defaultVal = store.selectedGroup.flatGroupUpiId || "greenglen402@axisbank";
    subtitle = "Shared UPI ID used for pooled flat expenses and utility bills.";
  } else if (type === "landlord") {
    modalTitle = "Edit Landlord UPI Account";
    defaultVal = store.selectedGroup.landlordUpi || "suresh.sharma@okaxis";
    subtitle = "UPI ID where monthly flat rent will be transferred.";
  } else if (type === "member") {
    const mem = DEMO_USERS.find(m => m.id === targetId) || ROHAN;
    modalTitle = `Edit UPI for ${mem.name}`;
    defaultVal = mem.upiId;
    subtitle = `Update UPI ID used when you pay ${mem.name}.`;
  }

  openSheet(modalTitle, `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <p style="font-size: 13px; color: var(--text-secondary);">${subtitle}</p>
      <div class="form-group">
        <label class="form-label">UPI VPA / ID</label>
        <input type="text" class="text-input" id="edit-upi-input" value="${defaultVal}" placeholder="username@bank" />
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        Popular bank suffixes: @okaxis, @okhdfcbank, @paytm, @ybl, @ibl
      </div>
      <button class="primary-action-btn" id="btn-save-upi">
        <i class="fa-solid fa-check"></i> Save UPI ID
      </button>
    </div>
  `, () => {
    document.getElementById("btn-save-upi")?.addEventListener("click", () => {
      const newVal = document.getElementById("edit-upi-input")?.value?.trim();
      if (!newVal || !newVal.includes("@")) {
        showToast("Please enter a valid UPI ID (e.g. user@bank)");
        return;
      }

      if (type === "personal") {
        store.updatePersonalUpi(newVal);
        showToast(`Your UPI ID updated to ${newVal}`);
      } else if (type === "flat") {
        store.updateFlatUpi(targetId || store.selectedGroup.id, newVal);
        showToast(`Flat UPI updated to ${newVal}`);
      } else if (type === "landlord") {
        store.updateLandlordUpi(targetId || store.selectedGroup.id, newVal);
        showToast(`Landlord UPI updated to ${newVal}`);
      } else if (type === "member") {
        store.updateMemberUpi(targetId, newVal);
        showToast(`Member UPI updated to ${newVal}`);
      }
      closeSheet();
      renderApp();
    });
  });
}

function openAuthProfileModal() {
  const curUser = store.currentUser;

  openSheet("User Login & Profile", `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Active Profile Name Quick-Edit -->
      <div style="background: var(--surface-container); padding: 14px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">
          Your Profile Name
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" class="text-input" id="inp-quick-edit-name" value="${curUser.name.replace(/\s*\(You\)/g, '')}" placeholder="Your Full Name" style="padding: 10px 12px; font-size: 14px; font-weight: 700;" />
          <button class="primary-action-btn" id="btn-quick-save-name" style="width: auto; padding: 0 16px; margin: 0; font-size: 13px; white-space: nowrap;">
            <i class="fa-solid fa-check"></i> Save
          </button>
        </div>
      </div>

      <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">
        1-Tap Quick Switch Flatmates:
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${DEMO_USERS.map(u => `
          <div class="user-switch-card ${u.id === curUser.id ? 'active' : ''}" data-switch-user="${u.id}">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${u.avatarUrl}" alt="${u.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
              <div>
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${u.name.replace(/\s*\(You\)/g, '')} ${u.id === curUser.id ? '(You)' : ''}</div>
                <div style="font-size: 11px; color: var(--text-secondary);">${u.upiId}</div>
              </div>
            </div>
            ${u.id === curUser.id ? '<span class="badge positive"><i class="fa-solid fa-check"></i> Active</span>' : ''}
          </div>
        `).join("")}
      </div>

      <div style="border-top: 1px dashed var(--surface-highest); padding-top: 12px;">
        <button class="desktop-btn" style="width: 100%; justify-content: center;" id="btn-open-phone-onboard">
          <i class="fa-solid fa-mobile-screen"></i> Log In With Different Mobile Number
        </button>
      </div>
    </div>
  `, () => {
    document.getElementById("btn-quick-save-name")?.addEventListener("click", () => {
      const newName = document.getElementById("inp-quick-edit-name")?.value || "";
      if (newName.trim()) {
        store.updateUserName(newName.trim());
        closeSheet();
        showToast(`Profile name updated to ${newName.trim()}!`);
        renderApp();
      }
    });

    mainEl.querySelectorAll("[data-switch-user]").forEach(card => {
      card.addEventListener("click", () => {
        const uId = card.getAttribute("data-switch-user");
        const u = DEMO_USERS.find(user => user.id === uId);
        if (u) {
          store.loginAs(u);
          closeSheet();
          showToast(`Switched active user to ${u.name.replace(/\s*\(You\)/g, '')}`);
          renderApp();
        }
      });
    });

    document.getElementById("btn-open-phone-onboard")?.addEventListener("click", () => {
      closeSheet();
      store.logout();
      onboardingStep = "phone";
      renderApp();
    });
  });
}

function openNewGroupModal() {
  openSheet("Create New Group", `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="form-group">
        <label class="form-label">Group Name</label>
        <input type="text" class="text-input" id="inp-group-name" placeholder="e.g. Manali Trip, Flat 502..." value="Manali Winter Trip 🏔️" />
      </div>

      <!-- Required Group Type Selector (§2.6) -->
      <div class="form-group">
        <label class="form-label">Group Type (Required)</label>
        <select class="text-input" id="inp-group-type">
          <option value="trip">🏖️ Trip (Travel & Hotel Offers)</option>
          <option value="rent">🏠 Rent / Flatshare (Rent & Furniture)</option>
          <option value="office">☕ Office Team (Food & Lunch Deals)</option>
          <option value="event">🎟️ Event / Outing (Ticket Cashback)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Add Members (Phone Number or Name)</label>
        <input type="text" class="text-input" id="inp-group-members" placeholder="+91 9811122233, Rohan, Priya" value="Rohan, Priya" />
      </div>

      <button class="primary-action-btn" id="btn-confirm-new-group">
        <i class="fa-solid fa-plus"></i> Create & Launch Group
      </button>
    </div>
  `, () => {
    document.getElementById("btn-confirm-new-group")?.addEventListener("click", () => {
      const name = document.getElementById("inp-group-name")?.value;
      const type = document.getElementById("inp-group-type")?.value || "trip";

      if (!name) {
        showToast("Please enter a group name");
        return;
      }

      const newG = store.addNewGroup({
        name,
        type,
        location: `${type.toUpperCase()} Group`
      });

      closeSheet();
      showToast(`Group "${newG.name}" created!`);
      navigateTo("group_details");
    });
  });
}

function openAddMemberModal(groupId) {
  const group = store.state.groups.find(g => g.id === groupId) || store.selectedGroup;

  openSheet(`Add Member to ${group.name}`, `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: rgba(0, 133, 93, 0.08); border-radius: 12px; padding: 10px 12px; font-size: 11.5px; color: var(--emerald-primary); line-height: 1.4;">
        <i class="fa-solid fa-circle-info"></i> <strong>Zero-Friction Architecture:</strong> Flatmates do not need to install the app. They get added to the ledger and receive a WhatsApp shared link to view & pay via UPI without creating an account.
      </div>

      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" class="text-input" id="inp-add-member-name" placeholder="e.g. Vikramaditya, Ananya..." />
      </div>

      <div class="form-group">
        <label class="form-label">Phone Number (For WhatsApp Link & SMS)</label>
        <input type="tel" class="text-input" id="inp-add-member-phone" placeholder="+91 98XXXXXXXX" value="+91 " />
      </div>

      <div class="form-group">
        <label class="form-label">UPI ID / VPA (Optional)</label>
        <input type="text" class="text-input" id="inp-add-member-upi" placeholder="e.g. name@okhdfcbank" />
      </div>

      <button class="primary-action-btn" id="btn-submit-add-member">
        <i class="fa-solid fa-user-plus"></i> Add to Group Ledger
      </button>
    </div>
  `, () => {
    document.getElementById("btn-submit-add-member")?.addEventListener("click", () => {
      const name = document.getElementById("inp-add-member-name")?.value?.trim();
      const phone = document.getElementById("inp-add-member-phone")?.value?.trim();
      const upi = document.getElementById("inp-add-member-upi")?.value?.trim();

      if (!name) {
        showToast("Please enter the member's name");
        return;
      }

      const newM = store.addMemberToGroup(group.id, {
        name,
        phoneNumber: phone || "+91 9800011122",
        upiId: upi || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@okaxis`
      });

      closeSheet();
      showToast(`${newM.name} added to ${group.name}!`);
      renderGroupDetails();
    });
  });
}

function openSupabaseConfigModal() {
  const conf = getStoredSupabaseConfig();

  openSheet("Supabase Backend Settings", `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <p style="font-size: 13px; color: var(--text-secondary);">
        Connect your Supabase project for real-time cloud database storage across phones and browsers:
      </p>

      <div class="form-group">
        <label class="form-label">Supabase Project URL</label>
        <input type="text" class="text-input" id="sb-url-input" value="${conf.url}" placeholder="https://xyzcompany.supabase.co" />
      </div>

      <div class="form-group">
        <label class="form-label">Supabase Anon Key</label>
        <input type="password" class="text-input" id="sb-key-input" value="${conf.anonKey}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="primary-action-btn" style="flex: 1; margin-top: 0;" id="btn-save-supabase">
          <i class="fa-solid fa-plug"></i> Connect & Save
        </button>
        <button class="desktop-btn" style="padding: 12px;" id="btn-test-supabase">
          Test Link
        </button>
      </div>

      <div style="border-top: 1px dashed var(--surface-highest); padding-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">Supabase SQL Schema Script:</span>
          <button class="desktop-btn" style="font-size: 11px; padding: 4px 8px;" id="btn-copy-sql-schema">
            <i class="fa-regular fa-copy"></i> Copy SQL
          </button>
        </div>
        <p style="font-size: 11px; color: var(--text-muted);">
          Run this schema in your Supabase Dashboard SQL Editor to create tables for profiles, groups, expenses, and settlements.
        </p>
      </div>
    </div>
  `, () => {
    document.getElementById("btn-save-supabase")?.addEventListener("click", () => {
      const url = document.getElementById("sb-url-input")?.value;
      const key = document.getElementById("sb-key-input")?.value;
      saveStoredSupabaseConfig(url, key);
      closeSheet();
      showToast("Supabase credentials saved!");
      renderApp();
    });

    document.getElementById("btn-test-supabase")?.addEventListener("click", async () => {
      showToast("Testing connection to Supabase...");
      const res = await testConnection();
      showToast(res.message);
    });

    document.getElementById("btn-copy-sql-schema")?.addEventListener("click", () => {
      copyText(SUPABASE_SQL_SCHEMA, "Supabase SQL Schema");
    });
  });
}

function openSettleSheet(payee, amount) {
  // Safeguard: If this member actually owes the current user, route to incoming settlement flow!
  const group = store.state.groups.find(g => g.id === (store.state.selectedGroupId || "g1")) || store.selectedGroup;
  const balances = store.getGroupBalances(group ? group.id : "g1");
  const bal = balances.find(b => b.member.id === payee.id);
  if (bal && (bal.amountOwedToYou || 0) > 0 && (bal.amountYouOwe || 0) === 0) {
    openRecordReceivedSheet(payee, bal.amountOwedToYou);
    return;
  }

  const cleanName = payee.name.replace(/\s*\(You\)/g, '');
  openSheet(`Pay ${cleanName}`, `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--surface-container); padding: 14px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--error-red); text-transform: uppercase;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Outgoing Payment
          </div>
          <div style="font-size: 24px; font-weight: 900; color: var(--error-red); margin-top: 2px;">₹${amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
            You owe ${cleanName} for group expenses
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: var(--text-muted);">Payee VPA</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); cursor: pointer;" id="sheet-vpa-copy">
            ${payee.upiId} <i class="fa-regular fa-copy"></i>
          </div>
        </div>
      </div>

      <div class="upi-apps-list">
        <div class="upi-app-tile" id="sheet-opt-fullflow">
          <div class="upi-app-left">
            <div class="upi-app-logo bhim"><i class="fa-solid fa-bolt"></i></div>
            <div class="upi-app-details">
              <span class="upi-app-name">Open Full Payment Flow</span>
              <span class="upi-app-note">Interactive QR & settlement step tracker</span>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 12px;"></i>
        </div>

        <div class="upi-app-tile" id="sheet-opt-gpay">
          <span class="upi-app-badge">INSTANT</span>
          <div class="upi-app-left">
            <div class="upi-app-logo gpay">GPay</div>
            <div class="upi-app-details">
              <span class="upi-app-name">Google Pay</span>
              <span class="upi-app-note">Launch direct UPI intent to ${cleanName}</span>
            </div>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--text-muted); font-size: 12px;"></i>
        </div>
      </div>
    </div>
  `, () => {
    document.getElementById("sheet-vpa-copy")?.addEventListener("click", () => copyText(payee.upiId, "Payee VPA"));
    document.getElementById("sheet-opt-fullflow")?.addEventListener("click", () => {
      closeSheet();
      store.openUpiFlow(payee, amount);
      navigateTo("upi_flow");
    });
    document.getElementById("sheet-opt-gpay")?.addEventListener("click", () => {
      closeSheet();
      executeUpiPayment("GPay", payee, amount);
    });
  });
}

function openRecordReceivedSheet(member, amount) {
  const curUser = store.currentUser;
  const cleanName = member.name.replace(/\s*\(You\)/g, '').trim();
  const firstName = cleanName.split(" ")[0];
  const group = store.state.groups.find(g => g.id === (store.state.selectedGroupId || "g1")) || store.selectedGroup;
  const groupName = group ? group.name : "Flat 402";
  const upiUri = buildUpiUri(curUser.upiId, curUser.name, amount, `${groupName} settlement`);

  openSheet(`Settle with ${cleanName}`, `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--surface-container); padding: 14px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: var(--emerald-primary); text-transform: uppercase;">
            <i class="fa-solid fa-arrow-down-left-and-up-right-to-center"></i> Incoming Settlement
          </div>
          <div style="font-size: 24px; font-weight: 900; color: var(--emerald-primary); margin-top: 2px;">₹${amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
            ${cleanName} owes you this pending amount
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: var(--text-muted);">Your Receiving UPI</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); cursor: pointer;" id="sheet-my-vpa-copy">
            ${curUser.upiId} <i class="fa-regular fa-copy"></i>
          </div>
        </div>
      </div>

      <div class="upi-apps-list">
        <!-- 1. Mark as Paid / Received -->
        <div class="upi-app-tile" id="sheet-opt-mark-received" style="border: 1.5px solid var(--emerald-primary); background: rgba(0, 105, 72, 0.05); cursor: pointer;">
          <div class="upi-app-left">
            <div class="upi-app-logo" style="background: var(--emerald-primary); color: #fff; font-size: 18px; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <div class="upi-app-details">
              <span class="upi-app-name" style="color: var(--emerald-primary); font-weight: 800;">✓ Mark as Received / Paid</span>
              <span class="upi-app-note">1-tap settle: ${firstName} already paid via UPI, Cash or Bank</span>
            </div>
          </div>
          <span class="badge positive" style="font-size: 10px;">INSTANT</span>
        </div>

        <!-- 2. Show My QR Code to Member -->
        <div class="upi-app-tile" id="sheet-opt-receive-qr" style="cursor: pointer;">
          <div class="upi-app-left">
            <div class="upi-app-logo bhim" style="display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <div class="upi-app-details">
              <span class="upi-app-name">Show My UPI QR Code</span>
              <span class="upi-app-note">Let ${firstName} scan your phone screen to pay you</span>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 12px;"></i>
        </div>

        <!-- 3. WhatsApp UPI Pay Link -->
        <div class="upi-app-tile" id="sheet-opt-receive-wa" style="cursor: pointer;">
          <div class="upi-app-left">
            <div class="upi-app-logo" style="background: #25D366; color: white; display: flex; align-items: center; justify-content: center;">
              <i class="fa-brands fa-whatsapp"></i>
            </div>
            <div class="upi-app-details">
              <span class="upi-app-name">Send 1-Tap Link on WhatsApp</span>
              <span class="upi-app-note">Direct payment link to your UPI (${curUser.upiId})</span>
            </div>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--text-muted); font-size: 12px;"></i>
        </div>
      </div>
    </div>
  `, () => {
    document.getElementById("sheet-my-vpa-copy")?.addEventListener("click", () => copyText(curUser.upiId, "Your UPI ID"));

    document.getElementById("sheet-opt-mark-received")?.addEventListener("click", () => {
      closeSheet();
      store.settleMemberDebt(member.id, "DIRECT_PAYMENT", true, amount);
      showToast(`✓ Settled! Recorded ₹${amount.toLocaleString()} received from ${cleanName}`);
      renderApp();
    });

    document.getElementById("sheet-opt-receive-qr")?.addEventListener("click", () => {
      closeSheet();
      openMyReceiveQrModal(member, amount);
    });

    document.getElementById("sheet-opt-receive-wa")?.addEventListener("click", () => {
      closeSheet();
      const text = `Hey ${firstName}! Friendly reminder from TicketSplit: your pending share for ${groupName} is ₹${amount.toLocaleString()}. You can pay via UPI to ${curUser.upiId} or tap: ${upiUri}. Thanks!`;
      const url = `https://wa.me/${(member.phoneNumber || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  });
}

function openMyReceiveQrModal(member, amount) {
  const curUser = store.currentUser;
  const cleanName = member.name.replace(/\s*\(You\)/g, '').trim();
  const firstName = cleanName.split(" ")[0];
  const group = store.state.groups.find(g => g.id === (store.state.selectedGroupId || "g1")) || store.selectedGroup;
  const groupName = group ? group.name : "Flat 402";
  const upiUri = buildUpiUri(curUser.upiId, curUser.name, amount, `${groupName} settlement`);

  openSheet(`Scan & Pay to ${curUser.name.split(' ')[0]}`, `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;">
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
        Ask <strong>${cleanName}</strong> to scan this QR with GPay, PhonePe, Paytm or BHIM
      </p>

      <div style="background: #ffffff; padding: 14px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; justify-content: center; align-items: center;">
        <canvas id="receive-upi-canvas" width="220" height="220"></canvas>
      </div>

      <div style="background: var(--surface-container); width: 100%; padding: 12px 14px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div style="text-align: left;">
          <div style="font-size: 11px; color: var(--text-muted);">Amount & Receiving VPA</div>
          <div style="font-size: 15px; font-weight: 900; color: var(--emerald-primary);">₹${amount.toLocaleString()}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${curUser.upiId}</div>
        </div>
        <button class="desktop-btn" style="padding: 6px 12px; font-size: 11px;" id="btn-copy-receive-vpa">
          <i class="fa-regular fa-copy"></i> Copy
        </button>
      </div>

      <button class="primary-action-btn" id="btn-confirm-receive-qr" style="margin-top: 4px;">
        <i class="fa-solid fa-circle-check"></i> I Received ₹${amount.toLocaleString()}
      </button>
    </div>
  `, () => {
    const canvas = document.getElementById("receive-upi-canvas");
    if (canvas) {
      drawUpiQrCanvas(canvas, upiUri, 220);
    }
    document.getElementById("btn-copy-receive-vpa")?.addEventListener("click", () => {
      copyText(curUser.upiId, "Your Receiving VPA");
    });
    document.getElementById("btn-confirm-receive-qr")?.addEventListener("click", () => {
      closeSheet();
      store.settleMemberDebt(member.id, "UPI_QR_RECEIVED", true, amount);
      showToast(`✓ Settled! Recorded ₹${amount.toLocaleString()} received from ${cleanName}.`);
      renderApp();
    });
  });
}

// Subscribe to store state updates
store.subscribe(() => {
  renderApp();
});

// Boot initial screen
renderApp();
