function normalizeDisplayPhone(phone = "") {
  return String(phone || "").trim();
}

function normalizeWhatsAppPhone(phone = "") {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

function getOwnerContact() {
  return {
    phone: normalizeDisplayPhone(process.env.OWNER_PHONE),
    email: String(process.env.OWNER_EMAIL || "").trim()
  };
}

function assertOwnerContactConfigured() {
  const { phone, email } = getOwnerContact();

  if (!phone || !email) {
    throw new Error("Owner contact not configured");
  }

  return { phone, email };
}

function getOwnerNotificationTargets() {
  const { phone, email } = assertOwnerContactConfigured();

  return {
    phone,
    email,
    whatsappPhone: normalizeWhatsAppPhone(process.env.ORDER_NOTIFICATION_WHATSAPP || phone)
  };
}

module.exports = {
  getOwnerContact,
  assertOwnerContactConfigured,
  getOwnerNotificationTargets
};
