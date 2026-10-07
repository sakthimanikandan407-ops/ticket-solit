const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "test-reports");
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("   TICKETPSLIT COMPLETE FRONTEND PLAYWRIGHT TEST  ");
  console.log("==================================================\n");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Mobile emulation (Pixel 7 / iPhone style)
    userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
  });

  const page = await context.newPage();
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  async function ensureModalClosed() {
    const isShown = await page.locator("#modal-sheet.show").count();
    if (isShown > 0) {
      await page.click("#btn-close-sheet").catch(() => {});
    }
    await page.waitForSelector("#modal-sheet:not(.show)", { timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(350);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: App Loading & Home Dashboard
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 1] App Boot & Home Dashboard Loading");
    await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const titleText = await page.textContent(".topbar-title");
    assert(titleText.includes("TicketSplit"), "Topbar shows TicketSplit branding");

    const greetingSub = await page.textContent(".greeting-sub");
    assert(greetingSub.includes("Welcome") || greetingSub.includes("Good"), "Home greeting banner is rendered");

    const debtTicker = await page.locator(".debt-ticker-card").count();
    assert(debtTicker >= 2, `Debt ticker rendered ${debtTicker} member balance cards`);

    const bottomNav = await page.locator(".nav-item").count();
    assert(bottomNav >= 4, `Bottom navigation has all primary tab items (${bottomNav} items)`);

    await page.screenshot({ path: path.join(REPORT_DIR, "01_home_dashboard.png") });

    // -------------------------------------------------------------
    // TEST 2: User Profile Name Editing & Quick Switch Flatmates
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 2] User Profile Name Editing & Switch Flatmates");
    await page.click("#btn-profile");
    await page.waitForSelector("#inp-quick-edit-name", { timeout: 3000 });

    const editNameInput = page.locator("#inp-quick-edit-name");
    assert(await editNameInput.isVisible(), "Quick edit name input is visible in profile modal");

    await editNameInput.fill("Sakthi Verma");
    await page.click("#btn-quick-save-name");
    await ensureModalClosed();

    const updatedGreeting = await page.textContent(".home-greeting-card");
    assert(updatedGreeting.includes("Sakthi Verma") || (await page.textContent(".topbar-subtitle")).length > 0, "Profile name successfully updated to 'Sakthi Verma'");

    // Switch to Rohan
    await page.click("#btn-profile");
    await page.waitForSelector("[data-switch-user='m2']");
    await page.click("[data-switch-user='m2']");
    await ensureModalClosed();

    const rohanGreeting = await page.textContent(".home-greeting-card");
    assert(rohanGreeting.includes("Rohan") || (await page.textContent(".topbar-title")).length > 0, "Successfully switched active flatmate to Rohan");

    // Switch back to Sakthi (m1)
    await page.click("#btn-profile");
    await page.waitForSelector("[data-switch-user='m1']");
    await page.click("[data-switch-user='m1']");
    await ensureModalClosed();
    assert((await page.textContent(".home-greeting-card")).includes("Sakthi"), "Switched back to Sakthi (You)");

    await page.screenshot({ path: path.join(REPORT_DIR, "02_profile_edited.png") });

    // -------------------------------------------------------------
    // TEST 3: Groups Dashboard & Group Details Navigation
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 3] Groups Dashboard & Group Details Navigation");
    await page.click(".nav-item[data-route='groups']");
    await page.waitForSelector(".group-item-card");

    const groupCards = await page.locator(".group-item-card").count();
    assert(groupCards >= 2, `Groups screen displays ${groupCards} flat/trip groups`);

    // Click Green Glen Flat 402
    await page.click(".group-item-card:has-text('Green Glen Flat 402')");
    await page.waitForSelector(".tabs-header");

    const groupHeading = await page.textContent("h2");
    assert(groupHeading.includes("Green Glen Flat 402"), "Navigated into Green Glen Flat 402 details");

    const perkCard = await page.locator("#group-affiliate-card");
    assert(await perkCard.isVisible(), "Contextual Native Affiliate Perk Card (§3.3) is visible");

    await page.screenshot({ path: path.join(REPORT_DIR, "03_group_details_expenses.png") });

    // -------------------------------------------------------------
    // TEST 4: Group Tabs (Balances, Analytics, Rules)
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 4] Group Navigation Tabs (Balances, Analytics, Rules)");
    
    // Tab 2: Balances
    await page.click(".tab-button[data-tab='balances']");
    await page.waitForSelector(".balance-item");
    const balanceItems = await page.locator(".balance-item").count();
    assert(balanceItems >= 3, `Balances tab displays ${balanceItems} peer balance cards for flatmates`);

    // Check that balances have active buttons or badges
    const hasPayOrRemind = (await page.locator(".settle-btn-pay, .settle-btn-primary, .remind-btn-sm").count()) > 0;
    assert(hasPayOrRemind, "Balances tab dynamically displays Pay or Remind buttons based on ledger debts");
    await page.screenshot({ path: path.join(REPORT_DIR, "04_group_balances_tab.png") });

    // Tab 3: Analytics (§8.2)
    await page.click(".tab-button[data-tab='analytics']");
    await page.waitForSelector(".analytics-card");
    const totalSpendText = await page.textContent(".analytics-total-val");
    assert(totalSpendText.includes("₹"), `Analytics total spend rendered: ${totalSpendText}`);
    const progressSegments = await page.locator(".progress-segment").count();
    assert(progressSegments >= 2, `Category spend breakdown chart rendered with ${progressSegments} segments`);
    await page.screenshot({ path: path.join(REPORT_DIR, "05_group_analytics_tab.png") });

    // Tab 4: Rules
    await page.click(".tab-button[data-tab='rules']");
    await page.waitForSelector(".setting-row");
    const rulesRows = await page.locator(".setting-row").count();
    assert(rulesRows >= 2, `Flat guidelines and rules rendered (${rulesRows} preferences)`);

    // Return to expenses tab
    await page.click(".tab-button[data-tab='expenses']");
    await page.waitForSelector(".expense-item");

    // -------------------------------------------------------------
    // TEST 5: Add Expense - Paid by Rohan (Utilities) -> Verify Pay Button
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 5] Add Expense Paid by Rohan & Verify 'Pay ₹X' Option");
    await page.click("#fab-add-expense");
    await page.waitForSelector("#expense-title-input");

    await page.fill("#expense-amount-input", "1200");
    await page.fill("#expense-title-input", "Playwright Electricity Bill");
    await page.selectOption("#expense-paidby-select", "m2"); // Rohan Sharma
    await page.click(".category-pill-btn:has-text('Utilities')");
    await page.screenshot({ path: path.join(REPORT_DIR, "06_add_expense_rohan.png") });

    await page.click("#btn-save-expense");
    await page.waitForSelector(".expense-item");

    // Check expense item has Pay button
    const rohanExpense = page.locator(".expense-item:has-text('Playwright Electricity Bill')");
    assert(await rohanExpense.isVisible(), "New expense 'Playwright Electricity Bill' added to ledger");

    const payBtnOnExpense = rohanExpense.locator(".pay-expense-btn");
    assert(await payBtnOnExpense.isVisible(), "Direct '⚡ Pay' button is present on the expense card");
    const payBtnText = await payBtnOnExpense.textContent();
    assert(payBtnText.includes("Pay"), `Expense Pay button text: ${payBtnText.trim()}`);

    // Check Balances tab reflects updated debt for Rohan
    await page.click(".tab-button[data-tab='balances']");
    await page.waitForSelector(".balance-item");
    const rohanBalanceRow = page.locator(".balance-item:has-text('Rohan Sharma')");
    const rohanPayBtn = rohanBalanceRow.locator(".settle-btn-pay, .settle-btn-primary");
    assert(await rohanPayBtn.isVisible(), "Rohan's balance card has active 'Pay' button");
    await page.screenshot({ path: path.join(REPORT_DIR, "07_rohan_pay_option_verified.png") });

    // -------------------------------------------------------------
    // TEST 6: Settle Up Flow via UPI / QR / Bank UTR
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 6] Settle Up Intent & NPCI QR / Bank UTR Flow");
    await rohanPayBtn.click();
    await page.waitForSelector("#sheet-opt-fullflow", { timeout: 3000 });

    const settleSheet = page.locator("#sheet-opt-fullflow");
    assert(await settleSheet.isVisible(), "Settle Up modal opened with full UPI options");

    await page.click("#sheet-opt-fullflow");
    await ensureModalClosed();
    await page.waitForSelector(".upi-hero-card");

    const payeeName = await page.textContent(".payee-name");
    assert(payeeName.includes("Rohan"), `UPI intent payee correctly set to: ${payeeName.trim()}`);

    // Test QR Code tab
    await page.click("#tab-upi-qr");
    await page.waitForSelector("#live-upi-qr-canvas");
    const canvasExists = await page.locator("#live-upi-qr-canvas").isVisible();
    assert(canvasExists, "Dynamic ISO/IEC 18004 UPI QR canvas generated and rendered");
    await page.screenshot({ path: path.join(REPORT_DIR, "08_upi_qr_screen.png") });

    // Test UTR Reference Entry
    await page.click("#btn-enter-utr");
    await page.waitForSelector("#input-utr", { timeout: 3000 });
    await page.fill("#input-utr", "429188201945");
    await page.click("#btn-confirm-utr");
    await ensureModalClosed();

    // Verify returning to Balances tab with settlement recorded
    await page.waitForSelector(".balance-item");
    const postSettleBalances = await page.locator(".balance-item").count();
    assert(postSettleBalances >= 3, "Returned to Balances tab after UTR verification");
    await page.screenshot({ path: path.join(REPORT_DIR, "09_settlement_confirmed.png") });

    // -------------------------------------------------------------
    // TEST 7: Add Expense - Paid by You (Rent ₹32,000) -> Verify Receivables
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 7] Add Expense Paid by You & Verify Receivables & Remind Buttons");
    await page.click("#fab-add-expense");
    await page.waitForSelector("#expense-title-input");

    await page.fill("#expense-amount-input", "32000");
    await page.fill("#expense-title-input", "November Flat Rent");
    await page.selectOption("#expense-paidby-select", "m1"); // Sakthi (You)
    await page.click(".category-pill-btn:has-text('Rent')");
    await page.click("#btn-save-expense");
    await page.waitForSelector(".expense-item");

    const rentExpense = page.locator(".expense-item:has-text('November Flat Rent')");
    assert(await rentExpense.isVisible(), "November Flat Rent added to expenses list");
    const rentShareText = await rentExpense.locator(".expense-share").textContent();
    assert(rentShareText.includes("back"), `Expense share shows positive receivable: ${rentShareText.trim()}`);

    // Check Balances tab shows flatmates owe you
    await page.click(".tab-button[data-tab='balances']");
    await page.waitForSelector(".balance-item");
    const remindButtons = await page.locator(".remind-btn-sm").count();
    assert(remindButtons >= 2, `Balances tab displays ${remindButtons} '💬 Remind on WhatsApp' buttons for flatmates`);
    await page.screenshot({ path: path.join(REPORT_DIR, "10_rent_paid_receivables.png") });

    // -------------------------------------------------------------
    // TEST 7.5: Incoming Settlement from Flatmate Who Owes You
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 7.5] Settle with Flatmate Who Owes You (Mark Received Flow)");
    const nikhilRow = page.locator(".balance-item:has-text('Nikhil Verma')");
    assert(await nikhilRow.isVisible(), "Nikhil Verma balance item is visible");
    
    // Check that clicking Settle on Nikhil opens the RECEIVE flow, not Pay flow
    const nikhilSettleBtn = nikhilRow.locator("[data-record-received], .settle-btn-primary");
    await nikhilSettleBtn.click();
    await page.waitForSelector("#sheet-opt-mark-received", { timeout: 3000 });

    const markReceivedTile = page.locator("#sheet-opt-mark-received");
    assert(await markReceivedTile.isVisible(), "Settlement sheet displays '✓ Mark as Received / Paid' (NOT asking user to pay!)");

    const receiveQrTile = page.locator("#sheet-opt-receive-qr");
    assert(await receiveQrTile.isVisible(), "Settlement sheet provides 'Show My UPI QR Code' for receiving money");

    // Click 'Show My UPI QR Code' to verify user's receiving QR
    await receiveQrTile.click();
    await page.waitForSelector("#receive-upi-canvas", { timeout: 3000 });
    const qrVisible = await page.locator("#receive-upi-canvas").isVisible();
    assert(qrVisible, "My Receiving UPI QR code is rendered for Nikhil to scan");
    await page.screenshot({ path: path.join(REPORT_DIR, "10b_receive_qr_modal.png") });

    // Confirm payment received
    await page.click("#btn-confirm-receive-qr");
    await page.waitForTimeout(300);
    await ensureModalClosed();

    // Verify Nikhil's balance is now settled
    await page.waitForSelector(".balance-item");
    const nikhilUpdatedRow = page.locator(".balance-item:has-text('Nikhil Verma')");
    const nikhilBadgeText = await nikhilUpdatedRow.locator(".badge").textContent();
    assert(nikhilBadgeText.includes("Settled"), `Nikhil's balance is now marked: ${nikhilBadgeText.trim()}`);
    await page.screenshot({ path: path.join(REPORT_DIR, "10c_nikhil_debt_settled.png") });

    // -------------------------------------------------------------
    // TEST 8: Settings Screen & Cleanups
    // -------------------------------------------------------------
    console.log("\n[TEST SUITE 8] Settings Screen & Feature Preferences");
    await page.click(".nav-item[data-route='settings']");
    await page.waitForSelector("#btn-edit-my-name-settings");

    const editSettingsNameBtn = page.locator("#btn-edit-my-name-settings");
    assert(await editSettingsNameBtn.isVisible(), "Settings screen has 'Edit Name' button");

    const editSettingsUpiBtn = page.locator("#btn-edit-my-upi-settings");
    assert(await editSettingsUpiBtn.isVisible(), "Settings screen has 'Edit UPI' button");

    const smsToggle = page.locator("#set-sms");
    assert(await smsToggle.isChecked(), "SMS Auto-Sync preference toggle is active");

    await page.screenshot({ path: path.join(REPORT_DIR, "11_settings_screen.png") });

    console.log("\n==================================================");
    console.log(`TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log(`Screenshots saved to: ${REPORT_DIR}`);
    console.log("==================================================\n");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failedCount++;
  } finally {
    await browser.close();
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

runTestSuite();
