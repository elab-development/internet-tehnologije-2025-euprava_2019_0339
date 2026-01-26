import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiRefreshCw } from "react-icons/fi";

export default function CitizenStats() {
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/stats");
      setStats(res?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju statistike.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const computed = useMemo(() => {
    const byStatus = stats?.by_status || [];
    const get = (k) => byStatus.find((x) => x.status === k)?.total || 0;

    const total = stats?.total_requests ?? 0;
    const done = get("APPROVED") + get("REJECTED");
    const pending = total - done;

    return { total, done, pending, byStatus };
  }, [stats]);

  const topServices = stats?.top_services || [];
  const monthly = stats?.monthly_trend || [];

  return (
    <div className="home-page">
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Statistika</div>
            <div className="page-subtitle">Pregled tvojih zahteva.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {busy ? <div className="eu-empty">Učitavanje…</div> : null}

        {stats ? (
          <>
            <div className="stats-grid">
              <div className="eu-panel">
                <div className="eu-sectionTitle">
                  <FiBarChart2 /> Ukupno
                </div>
                <div className="stats-number">{computed.total}</div>
                <div className="eu-muted">Ukupan broj zahteva.</div>
              </div>

              <div className="eu-panel">
                <div className="eu-sectionTitle">
                  <FiTrendingUp /> Završeno
                </div>
                <div className="stats-number">{computed.done}</div>
                <div className="eu-muted">APPROVED + REJECTED.</div>
              </div>

              <div className="eu-panel">
                <div className="eu-sectionTitle">
                  <FiPieChart /> Na čekanju
                </div>
                <div className="stats-number">{computed.pending}</div>
                <div className="eu-muted">Ostali statusi.</div>
              </div>
            </div>

            <div className="eu-panel" style={{ marginTop: 16 }}>
              <div className="eu-sectionTitle">Po statusu</div>
              {computed.byStatus.length === 0 ? (
                <div className="eu-empty">Nema podataka.</div>
              ) : (
                <div className="eu-simpleTable">
                  <div className="eu-simpleTableHead">
                    <div>Status</div>
                    <div>Broj</div>
                  </div>
                  {computed.byStatus.map((r, idx) => (
                    <div className="eu-simpleTableRow" key={idx}>
                      <div className="eu-strong">{r.status}</div>
                      <div>{r.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="eu-panel" style={{ marginTop: 16 }}>
              <div className="eu-sectionTitle">Top 5 usluga</div>
              {topServices.length === 0 ? (
                <div className="eu-empty">Nema podataka.</div>
              ) : (
                <div className="eu-simpleTable">
                  <div className="eu-simpleTableHead">
                    <div>Usluga</div>
                    <div>Broj</div>
                  </div>
                  {topServices.map((r, idx) => (
                    <div className="eu-simpleTableRow" key={idx}>
                      <div className="eu-strong">{r.service_name || `#${r.service_id}`}</div>
                      <div>{r.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="eu-panel" style={{ marginTop: 16 }}>
              <div className="eu-sectionTitle">Mesečno (poslednjih 6 meseci)</div>
              {monthly.length === 0 ? (
                <div className="eu-empty">Nema podataka.</div>
              ) : (
                <div className="eu-simpleTable">
                  <div className="eu-simpleTableHead">
                    <div>Mesec</div>
                    <div>Broj</div>
                  </div>
                  {monthly.map((r, idx) => (
                    <div className="eu-simpleTableRow" key={idx}>
                      <div className="eu-strong">{r.month}</div>
                      <div>{r.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
