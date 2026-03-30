const Settings = require("../models/Settings");
const { memoryStore } = require("../data/memoryStore");
const { normalizeSettings } = require("../utils/pricing");

async function getStoredSettings() {
  if (memoryStore.dbConnected) {
    const settings = await Settings.findOne();
    if (settings) {
      return settings;
    }

    return Settings.create({
      gstEnabled: false,
      gstRate: 18
    });
  }

  return memoryStore.settings;
}

async function getSettings(req, res) {
  const settings = await getStoredSettings();
  return res.json(normalizeSettings(settings));
}

async function upsertSettings(req, res) {
  const gstEnabled = Boolean(req.body.gstEnabled);
  const gstRate = Number(req.body.gstRate);

  if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
    return res.status(400).json({ message: "GST rate must be between 0 and 100" });
  }

  const payload = {
    gstEnabled,
    gstRate
  };

  const settings = memoryStore.dbConnected
    ? await Settings.findOneAndUpdate({}, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      })
    : (() => {
        memoryStore.settings = {
          ...memoryStore.settings,
          ...payload
        };
        return memoryStore.settings;
      })();

  return res.json({
    message: "Settings updated successfully",
    settings: normalizeSettings(settings)
  });
}

module.exports = {
  getSettings,
  upsertSettings
};
