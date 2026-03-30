const DELIVERY_CHARGE = 60;

function normalizeSettings(settings = {}) {
  return {
    gstEnabled: Boolean(settings.gstEnabled),
    gstRate: Math.max(0, Number(settings.gstRate || 0))
  };
}

function calculateOrderTotals(items = [], settings = {}) {
  const normalizedSettings = normalizeSettings(settings);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const deliveryCharge = items.length ? DELIVERY_CHARGE : 0;
  const gstAmount = normalizedSettings.gstEnabled
    ? Number(((subtotal * normalizedSettings.gstRate) / 100).toFixed(2))
    : 0;
  const total = Number((subtotal + deliveryCharge + gstAmount).toFixed(2));

  return {
    subtotal,
    deliveryCharge,
    gstEnabled: normalizedSettings.gstEnabled,
    gstRate: normalizedSettings.gstRate,
    gstAmount,
    total
  };
}

module.exports = {
  DELIVERY_CHARGE,
  normalizeSettings,
  calculateOrderTotals
};
