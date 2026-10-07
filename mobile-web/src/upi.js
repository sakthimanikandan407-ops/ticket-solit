import QRCode from "qrcode";

// UPI Payment Utilities & QR Code Generator

export function buildUpiUri(vpa, name, amount, note = "TicketSplitSettlement") {
  const am = parseFloat(amount).toFixed(2);
  const pn = encodeURIComponent(name);
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function buildAndroidIntentUri(appName, vpa, name, amount, note = "TicketSplitSettlement") {
  const am = parseFloat(amount).toFixed(2);
  const pn = encodeURIComponent(name);
  const tn = encodeURIComponent(note);
  const pa = encodeURIComponent(vpa);

  const packages = {
    gpay: "com.google.android.apps.nbu.paisa.user",
    googlepay: "com.google.android.apps.nbu.paisa.user",
    phonepe: "com.phonepe.app",
    paytm: "net.one97.paytm",
    bhim: "in.org.npci.upiapp"
  };

  const key = appName.toLowerCase().replace(/[^a-z]/g, "");
  const pkg = packages[key];
  if (pkg) {
    return `intent://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}#Intent;scheme=upi;package=${pkg};end`;
  }
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

export function launchUpiApp(appName, vpa, name, amount, note = "TicketSplitSettlement") {
  const standardUri = buildUpiUri(vpa, name, amount, note);
  const isMobile = isMobileDevice();

  if (isMobile) {
    let targetUri = standardUri;
    if (/Android/i.test(navigator.userAgent)) {
      targetUri = buildAndroidIntentUri(appName, vpa, name, amount, note);
    }

    // Attempt dispatch via anchor tag (most reliable in Chrome Android & iOS Safari)
    try {
      const a = document.createElement("a");
      a.href = targetUri;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 200);
    } catch (e) {
      window.location.href = targetUri;
    }
    return { success: true, isMobile: true, uri: targetUri };
  }

  // On desktop browsers, upi:// is not registered in OS; return indicator
  return { success: false, isMobile: false, uri: standardUri };
}

/**
 * Render an authentic, scannable ISO/IEC 18004 QR code on HTML5 canvas
 * using standard Reed-Solomon error correction (readable by GPay, PhonePe, Paytm, BHIM, etc.)
 */
export async function drawUpiQrCanvas(canvas, upiString, size = 220) {
  if (!canvas) return;

  try {
    await QRCode.toCanvas(canvas, upiString, {
      width: size,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#FFFFFF"
      },
      errorCorrectionLevel: "H"
    });

    // Draw subtle, non-intrusive center Rupee badge (occupies only ~3% area; H level recovers 30%)
    const ctx = canvas.getContext("2d");
    const badgeSize = Math.floor(size * 0.16);
    const badgeX = (size - badgeSize) / 2;
    const badgeY = (size - badgeSize) / 2;

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(badgeX - 2, badgeY - 2, badgeSize + 4, badgeSize + 4, 6);
    ctx.fill();

    ctx.fillStyle = "#006948";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 5);
    ctx.fill();

    ctx.fillStyle = "#85F8C4";
    ctx.font = `bold ${Math.floor(badgeSize * 0.65)}px Inter, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₹", size / 2, size / 2 + 1);
  } catch (err) {
    console.error("Error generating scannable QR Code:", err);
  }
}
