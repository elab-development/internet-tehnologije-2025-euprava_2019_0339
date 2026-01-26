import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";

import { FiClipboard, FiSearch, FiRefreshCw, FiArrowRight } from "react-icons/fi";

export default function OfficerReview() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/service-requests?status=IN_REVIEW");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju zahteva u obradi.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      const id = String(x?.id || "");
      const svc = String(x?.service?.name || "");
      const inst = String(x?.service?.institution?.name || "");
      const user = String(x?.citizen?.name || "");
      return [id, svc, inst, user].some((v) => v.toLowerCase().includes(s));
    });
  }, [items, q]);

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Provera dokumentacije</div>
            <div className="page-subtitle">Zahtevi dodeljeni tebi (IN_REVIEW).</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="eu-inputWrap">
              <FiSearch />
              <input
                className="eu-input"
                placeholder="Pretraga (ID, usluga, institucija, korisnik)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
              <FiRefreshCw />
              Osveži
            </button>
          </div>
        </div>

        {error ? (
          <div className="eu-alert eu-alert--err">
            <span className="eu-strong">Greška:</span> {error}
          </div>
        ) : null}

        <div className="eu-list">
          {busy ? <div className="eu-empty">Učitavanje…</div> : null}
          {!busy && filtered.length === 0 ? <div className="eu-empty">Nema zahteva u obradi.</div> : null}

          {!busy &&
            filtered.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowIcon">
                    <FiClipboard />
                  </div>
                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">
                      Zahtev #{x.id} <span className="eu-badge eu-badge--info">{x.status}</span>
                    </div>
                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        Usluga: <b>{x?.service?.name || "—"}</b>
                      </span>
                      <span className="eu-dot">•</span>
                      <span className="eu-muted">
                        Institucija: <b>{x?.service?.institution?.name || "—"}</b>
                      </span>
                      <span className="eu-dot">•</span>
                      <span className="eu-muted">
                        Korisnik: <b>{x?.citizen?.name || "—"}</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="eu-rowActions">
                  <button className="eu-btn eu-btn--primary" onClick={() => navigate(`/officer/requests/${x.id}`)}>
                    <FiArrowRight />
                    Otvori
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
