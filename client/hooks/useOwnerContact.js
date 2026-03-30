import { useEffect, useState } from "react";
import api from "../utils/api";

const fallbackContact = {
  phone: "7566921100",
  email: "anuragsahug689@gmail.com"
};

export default function useOwnerContact() {
  const [contact, setContact] = useState(fallbackContact);

  useEffect(() => {
    let active = true;

    async function loadContact() {
      try {
        const { data } = await api.get("/contact");
        if (active && data?.phone && data?.email) {
          setContact({
            phone: data.phone,
            email: data.email
          });
        }
      } catch (error) {
        // Keep the UI resilient with the current fallback contact.
      }
    }

    loadContact();

    return () => {
      active = false;
    };
  }, []);

  return contact;
}
