import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiXCircle, FiArrowRight, FiRefreshCw } from "react-icons/fi";

export default function OfficerRejections() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      // backend: GET /api/service-requests?status=REJECTED
      const res = await api.get("/api/service-requests?status=REJECTED");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju odbijenih zahteva.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Odbijeni zahtevi</div>
            <div className="page-subtitle">Lista zahteva sa statusom REJECTED.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? (
          <div className="eu-alert eu-alert--err">
            <span className="eu-strong">Greška:</span> {error}
          </div>
        ) : null}

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && items.length === 0 ? <div className="eu-empty">Nema odbijenih zahteva.</div> : null}

        <div className="eu-list">
          {!busy &&
            items.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowIcon">
                    <FiXCircle />
                  </div>

                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">
                      Zahtev #{x.id} <span className="eu-badge eu-badge--danger">{x.status}</span>
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
                  <button className="eu-btn eu-btn--ghost" onClick={() => navigate(`/officer/requests/${x.id}`)}>
                    <FiArrowRight />
                    Detalji
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
