import { useEffect, useState } from "react";
import api from "../utils/api";
import { normalizePricingSettings } from "../utils/pricing";

export default function usePricingSettings() {
  const [settings, setSettings] = useState({
    gstEnabled: false,
    gstRate: 18
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        setIsLoading(true);
        const { data } = await api.get("/settings");
        if (active) {
          setSettings(normalizePricingSettings(data));
        }
      } catch (error) {
        if (active) {
          setSettings({
            gstEnabled: false,
            gstRate: 18
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  return { settings, setSettings, isLoading };
}
