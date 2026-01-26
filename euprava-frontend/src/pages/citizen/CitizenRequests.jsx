import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiSearch, FiRefreshCw, FiArrowRight } from "react-icons/fi";

const STATUSES = ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"];

export default function CitizenRequests() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      const res = await api.get(`/api/service-requests${qs.toString() ? `?${qs.toString()}` : ""}`);
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju zahteva.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      const id = String(x?.id || "");
      const st = String(x?.status || "");
      const svc = String(x?.service?.name || "");
      const inst = String(x?.service?.institution?.name || "");
      return [id, st, svc, inst].some((v) => v.toLowerCase().includes(s));
    });
  }, [items, q]);

  return (
    <div className="home-page">
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Moji zahtevi</div>
            <div className="page-subtitle">Pregled statusa, izmena nacrta i preuzimanje PDF-a.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}

        <div className="eu-filters">
          <div className="eu-inputWrap">
            <FiSearch />
            <input className="eu-input" placeholder="Pretraga (ID, usluga, institucija, status)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <select className="eu-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Svi statusi</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button className="eu-btn eu-btn--ghost" onClick={() => navigate("/citizen/requests/new")}>
            Novi zahtev
          </button>
        </div>

        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && filtered.length === 0 ? <div className="eu-empty">Nema zahteva.</div> : null}

        <div className="eu-list">
          {!busy &&
            filtered.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">
                      Zahtev #{x.id}{" "}
                      <span className="eu-badge eu-badge--info">{x.status}</span>
                      {x?.payment_status ? <span className="eu-badge eu-badge--ghost">PAY: {x.payment_status}</span> : null}
                    </div>
                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        Usluga: <b>{x?.service?.name || "—"}</b>
                      </span>
                      <span className="eu-dot">•</span>
                      <span className="eu-muted">
                        Institucija: <b>{x?.service?.institution?.name || "—"}</b>
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
