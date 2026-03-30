export const DELIVERY_CHARGE = 60;

export const normalizePricingSettings = (settings = {}) => ({
  gstEnabled: Boolean(settings?.gstEnabled),
  gstRate: Math.max(0, Number(settings?.gstRate || 0))
});

export const calculatePricingSummary = (subtotal = 0, settings = {}) => {
  const normalized = normalizePricingSettings(settings);
  const deliveryCharge = subtotal > 0 ? DELIVERY_CHARGE : 0;
  const gstAmount = normalized.gstEnabled
    ? Number(((Number(subtotal || 0) * normalized.gstRate) / 100).toFixed(2))
    : 0;
  const total = Number((Number(subtotal || 0) + deliveryCharge + gstAmount).toFixed(2));

  return {
    subtotal: Number(subtotal || 0),
    deliveryCharge,
    gstEnabled: normalized.gstEnabled,
    gstRate: normalized.gstRate,
    gstAmount,
    total
  };
};
