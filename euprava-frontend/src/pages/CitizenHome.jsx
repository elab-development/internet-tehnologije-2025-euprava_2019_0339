import { useEffect, useMemo } from "react";
import { FiPlusCircle, FiList, FiCreditCard, FiRefreshCw, FiStar } from "react-icons/fi";

import NavBar from "../components/NavBar";
import ActionCard from "../components/ActionCard";
import useCountriesAPI from "../hooks/useCountriesAPI";

export default function CitizenHome() {
  const cards = useMemo(
    () => [
      {
        title: "Podnesi zahtev",
        desc: "Kreiraj novi zahtev i priloži dokumenta.",
        Icon: FiPlusCircle,
        route: "/citizen/requests/new",
        buttonText: "Novi zahtev",
      },
      {
        title: "Moji zahtevi",
        desc: "Pregled statusa i preuzimanje PDF-a.",
        Icon: FiList,
        route: "/citizen/requests",
        buttonText: "Otvori listu",
      },
      {
        title: "Plaćanja",
        desc: "Ažuriranje i pregled informacija o uplati.",
        Icon: FiCreditCard,
        route: "/citizen/payments",
        buttonText: "Vidi plaćanja",
      },
    ],
    []
  );

  const { countries, busy, error, reload } = useCountriesAPI();

  const isSerbia = (c) => {
    const code = String(c?.code || "").toUpperCase();
    const name = String(c?.name || "");
    return code === "RS" || /serbia|srbija/i.test(name);
  };

  // Top 10 “enlargement” set (UI/marketing lista).
  const enlargementTop10Codes = useMemo(() => ["RS", "ME", "AL", "MD", "UA", "MK", "BA", "GE", "TR", "XK"], []);
  const afterSerbiaOrder = useMemo(() => ["ME", "AL", "MD", "UA", "MK", "BA", "GE", "TR", "XK"], []);

  const top10 = useMemo(() => {
    if (!countries.length) return [];
    const byCode = new Map(countries.map((c) => [String(c.code).toUpperCase(), c]));
    const resolved = enlargementTop10Codes.map((code) => byCode.get(code)).filter(Boolean);

    const serbia = resolved.find((c) => String(c.code).toUpperCase() === "RS");
    const rest = resolved.filter((c) => String(c.code).toUpperCase() !== "RS");

    rest.sort((a, b) => {
      const ia = afterSerbiaOrder.indexOf(String(a.code).toUpperCase());
      const ib = afterSerbiaOrder.indexOf(String(b.code).toUpperCase());
      return ia - ib;
    });

    return serbia ? [serbia, ...rest] : rest.slice(0, 10);
  }, [countries, enlargementTop10Codes, afterSerbiaOrder]);

  const praiseLine = (code) => {
    switch (String(code || "").toUpperCase()) {
      case "RS":
        return "Istaknuta u aplikaciji: fokus na digitalnim uslugama i modernizaciji administrativnih procesa.";
      case "ME":
        return "Napredak kroz pregovaračke korake i usklađivanje sa EU standardima.";
      case "AL":
        return "Intenziviranje reformskih procesa i institucionalnih promena.";
      case "MD":
        return "Ubrzanje reformi i jačanje kapaciteta institucija.";
      case "UA":
        return "Reformski zamah i prilagođavanje EU okvirima u zahtevnim uslovima.";
      case "MK":
        return "Kontinuirane reforme i saradnja sa EU institucijama.";
      case "BA":
        return "Fokus na jačanje upravljanja i funkcionalnosti institucija.";
      case "GE":
        return "Rad na usklađivanju sa EU prioritetima i reformskim preporukama.";
      case "TR":
        return "Dugogodišnji kandidat; saradnja sa EU kroz više sektora.";
      case "XK":
        return "Potencijalni kandidat; postepeno jačanje procesa integracija.";
      default:
        return "Partner u procesu evropskih integracija.";
    }
  };

  // EXTRA: brutalan “overlay killer” na mount (za svaki slučaj).
  useEffect(() => {
    const selectors = [
      ".eu-modalOverlay",
      ".modalOverlay",
      ".modal-overlay",
      ".overlay",
      ".backdrop",
      ".modal-backdrop",
      '[class*="overlay"]',
      '[class*="Overlay"]',
      '[class*="backdrop"]',
      '[class*="Backdrop"]',
    ];

    const kill = () => {
      const nodes = document.querySelectorAll(selectors.join(","));
      nodes.forEach((el) => {
        // ne diramo ako je to deo navbar-a ili slično: ali većina overlay-a je fixed/fullscreen
        el.style.background = "transparent";
        el.style.pointerEvents = "none";
        // ako je fullscreen, skloni ga skroz:
        if (getComputedStyle(el).position === "fixed") {
          el.style.display = "none";
        }
      });

      // i body/html da slučajno nije prekriven pseudo-elementom
      document.documentElement.style.background = "#f6f8fb";
      document.body.style.background = "#f6f8fb";
    };

    kill();
    // pokušaj i posle kratkog delay-a (ako se overlay pojavi nakon rendera)
    const t = setTimeout(kill, 50);
    return () => clearTimeout(t);
  }, []);

  // Inline CSS “klik fix” + GLOBAL override (style tag).
  const ui = {
    page: { position: "relative", zIndex: 0, background: "#f6f8fb" },
    wrap: { position: "relative", zIndex: 10, pointerEvents: "auto" },
    panel: {
      marginTop: 18,
      background: "#fff",
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      position: "relative",
      zIndex: 20,
      pointerEvents: "auto",
    },
    headRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
    btn: { position: "relative", zIndex: 9999, pointerEvents: "auto" },
    list: { display: "grid", gap: 10, marginTop: 12 },
    row: (featured) => ({
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 14,
      border: featured ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(0,0,0,0.08)",
      background: featured ? "rgba(124,58,237,0.08)" : "rgba(0,0,0,0.03)",
    }),
    badge: (featured) => ({
      display: "inline-flex",
      gap: 6,
      alignItems: "center",
      fontSize: 12,
      padding: "3px 10px",
      borderRadius: 999,
      border: featured ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(0,0,0,0.10)",
      background: featured ? "rgba(16,185,129,0.14)" : "rgba(0,0,0,0.04)",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }),
    code: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, opacity: 0.8 },
    title: (featured) => ({ fontSize: 14, fontWeight: featured ? 800 : 700 }),
    desc: { marginTop: 4, fontSize: 13, opacity: 0.9, lineHeight: 1.35 },
  };

  return (
    <div className="home-page" style={ui.page}>
      {/* GLOBAL INLINE OVERRIDE: ubija bilo kakav fullscreen overlay */}
      <style>
        {`
          html, body { background: #f6f8fb !important; }
          /* sve tipične overlay klase */
          .eu-modalOverlay,
          .modalOverlay,
          .modal-overlay,
          .overlay,
          .backdrop,
          .modal-backdrop {
            background: transparent !important;
            pointer-events: none !important;
          }
          /* ako je overlay fixed/fullscreen -> skloni ga */
          .eu-modalOverlay,
          .modalOverlay,
          .modal-overlay,
          .overlay,
          .backdrop,
          .modal-backdrop {
            display: none !important;
          }

          /* hvataj i generičke klase koje sadrže overlay/backdrop */
          [class*="overlay"], [class*="Overlay"],
          [class*="backdrop"], [class*="Backdrop"] {
            background: transparent !important;
            pointer-events: none !important;
          }
        `}
      </style>

      <NavBar roleLabel="Građanin" />

      <div className="home-wrap" style={ui.wrap}>
        <div className="home-hero">
          <div className="home-hero__title">Moj nalog</div>
          <div className="home-subtitle">Brz pristup najvažnijim uslugama i zahtevima.</div>
        </div>

        <div className="home-grid">
          {cards.map((c) => (
            <ActionCard key={c.title} title={c.title} desc={c.desc} Icon={c.Icon} route={c.route} buttonText={c.buttonText} />
          ))}
        </div>

        <div style={ui.panel}>
          <div style={ui.headRow}>
            <div>
              <div className="eu-strong" style={{ fontSize: 16 }}>
                Top 10 država u procesu približavanja EU (informativno)
              </div>
              <div className="eu-muted" style={{ marginTop: 4 }}>
                Srbija je na prvom mestu (UI isticanje).
              </div>
            </div>

            <button className="eu-btn eu-btn--ghost" onClick={reload} disabled={busy} type="button" style={ui.btn}>
              <FiRefreshCw />
              Osveži
            </button>
          </div>

          {error ? (
            <div className="eu-alert eu-alert--err" style={{ marginTop: 12 }}>
              Greška: {error}
            </div>
          ) : null}

          {busy ? <div className="eu-empty" style={{ marginTop: 12 }}>Učitavanje…</div> : null}

          {!busy && top10.length > 0 ? (
            <div style={ui.list}>
              {top10.map((c, idx) => {
                const featured = isSerbia(c);
                return (
                  <div key={`${c.code}-${c.name}`} style={ui.row(featured)}>
                    <div style={{ minWidth: 44 }}>
                      <div style={ui.badge(featured)}>
                        {featured ? <FiStar /> : null}
                        #{idx + 1}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={ui.title(featured)}>
                          {c.flagEmoji ? `${c.flagEmoji} ` : ""}
                          {c.name}
                        </div>
                        <div style={ui.code}>{String(c.code).toUpperCase()}</div>

                        {featured ? (
                          <div
                            style={{
                              ...ui.badge(true),
                              background: "rgba(124,58,237,0.10)",
                              border: "1px solid rgba(124,58,237,0.25)",
                            }}
                          >
                            ★ Featured: Srbija
                          </div>
                        ) : null}
                      </div>

                      <div style={ui.desc}>{praiseLine(c.code)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {!busy && !error && top10.length === 0 ? (
            <div className="eu-empty" style={{ marginTop: 12 }}>
              Nema podataka za top listu (API vratio prazno ili nije pronašao kodove).
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
