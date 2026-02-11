import { useCallback, useEffect, useState } from "react";

/**
 * CORS-free API:
 * https://restcountries.com/
 * Radi sa localhost:3000 bez proxy-a u većini slučajeva.
 */
export default function useCountriesAPI() {
  const [countries, setCountries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const normalize = (list) => {
    const mapped = (Array.isArray(list) ? list : [])
      .map((c) => ({
        code: c?.cca2 || c?.cca3 || "",
        name: c?.name?.common || c?.name?.official || "",
        region: c?.region || "",
        flagEmoji: c?.flag || "",
        flagPng: c?.flags?.png || "",
      }))
      .filter((x) => x.code && x.name);

    // Sort: Srbija prva (pinned), pa ostalo abecedno
    const isSerbia = (x) =>
      String(x.code).toUpperCase() === "RS" ||
      /serbia|srbija/i.test(String(x.name || ""));

    mapped.sort((a, b) => {
      const sa = isSerbia(a) ? 0 : 1;
      const sb = isSerbia(b) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    });

    return mapped;
  };

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,flags,flag", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setCountries(normalize(json));
    } catch (e) {
      setError(e?.message ? `Ne mogu da dohvatim države (${e.message}).` : "Ne mogu da dohvatim države.");
      setCountries([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { countries, busy, error, reload: load };
}

