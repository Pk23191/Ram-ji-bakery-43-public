const nodemailer = require("nodemailer");
const { assertOwnerContactConfigured, getOwnerNotificationTargets } = require("./ownerContact");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatOrderTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function buildItemsSummary(items = []) {
  return items
    .map((item) => {
      const customDetails = item.customizations
        ? ` | Custom: Flavor ${item.customizations.flavor || "-"}, Size ${item.customizations.size || "-"}, Cream ${
            item.customizations.cream || "-"
          }, Message ${item.customizations.message || "-"}`
        : "";

      return `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}${customDetails}`;
    })
    .join("\n");
}

function buildOrderMessage(order) {
  return [
    "New Order 🧁",
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customer}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`,
    `Products:\n${buildItemsSummary(order.items)}`,
    `Total: ${formatCurrency(order.total)}`,
    `Payment: ${order.paymentMethod}`,
    `Image: ${order.items?.[0]?.image || "-"}`,
    `Link: ${process.env.PUBLIC_STORE_URL || process.env.FRONTEND_URL || "https://ram-ji-bakery.vercel.app/orders"}`,
    `Order Time: ${formatOrderTime(order.orderTime)}`
  ].join("\n");
}

function buildWhatsAppLink(order) {
  const { whatsappPhone } = getOwnerNotificationTargets();
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(buildOrderMessage(order))}`;
}

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const emailEnabled = process.env.ENABLE_ORDER_EMAIL === "true";

  // Skip SMTP in local/dev unless explicitly enabled with a real Gmail app password.
  if (!emailEnabled || !user || !pass || pass === "REPLACE_WITH_GMAIL_APP_PASSWORD" || pass.length < 16) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user,
      pass
    }
  });
}

async function sendWhatsAppCloudNotification(order) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const { whatsappPhone } = getOwnerNotificationTargets();

  if (!token || !phoneNumberId || !whatsappPhone) {
    return { skipped: true };
  }

  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: whatsappPhone,
      type: "text",
      text: {
        preview_url: false,
        body: buildOrderMessage(order)
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp notification failed: ${details}`);
  }

  return { skipped: false };
}

async function sendOrderEmail(order) {
  const { email } = assertOwnerContactConfigured();
  const transporter = createTransporter();
  if (!transporter) {
    return { skipped: true };
  }

  const message = buildOrderMessage(order);

  await Promise.race([
    transporter.sendMail({
      from: `"Ramji Bakery Orders" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "New Bakery Order",
      text: message
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email notification timed out")), 10000);
    })
  ]);

  return { skipped: false };
}

module.exports = {
  buildOrderMessage,
  buildWhatsAppLink,
  sendOrderEmail,
  sendWhatsAppCloudNotification
};
