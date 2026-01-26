import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiCreditCard, FiRefreshCw, FiArrowRight } from "react-icons/fi";

export default function CitizenPayments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/service-requests");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju plaćanja.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const payItems = useMemo(() => {
    return items.filter((x) => x?.payment_status && String(x.payment_status).toUpperCase() !== "NOT_REQUIRED");
  }, [items]);

  return (
    <div className="home-page">
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Plaćanja</div>
            <div className="page-subtitle">Pregled payment statusa po zahtevima.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && payItems.length === 0 ? <div className="eu-empty">Nema zahteva koji zahtevaju plaćanje.</div> : null}

        <div className="eu-list">
          {!busy &&
            payItems.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowIcon">
                    <FiCreditCard />
                  </div>
                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">
                      Zahtev #{x.id} <span className="eu-badge eu-badge--ghost">{x.payment_status}</span>
                    </div>
                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        Usluga: <b>{x?.service?.name || "—"}</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="eu-rowActions">
                  <button className="eu-btn eu-btn--primary" onClick={() => navigate(`/citizen/requests/${x.id}`)}>
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
