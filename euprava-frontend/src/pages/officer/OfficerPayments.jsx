import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiCreditCard, FiRefreshCw, FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function OfficerPayments() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [payBusyId, setPayBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      //  ista ruta
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

  // Pomoćne funkcije
  const norm = (v) => String(v || "").toUpperCase();

  //  Backend bi idealno već vratio samo “moje” zahteve za OFFICER.
  // Frontend filter je dodat za svaki slučaj.
  const myPayItems = useMemo(() => {
    return (items || [])
      .filter((x) => norm(x?.payment_status) !== "NOT_REQUIRED") // samo oni koji imaju plaćanje
      // .filter((x) => x?.processed_by != null) // opcionalno
      ;
  }, [items]);

  const canMarkPaid = (x) => {
    //  samo PENDING -> PAID
    return norm(x?.payment_status) === "PENDING";
  };

  const markPaid = async (id) => {
    setPayBusyId(id);
    setError("");
    try {
      await api.patch(`/api/service-requests/${id}/payment`, {
        payment_status: "PAID",
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri ažuriranju plaćanja.");
    } finally {
      setPayBusyId(null);
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Plaćanja</div>
            <div className="page-subtitle">Vidi i ažuriraj plaćanja za tvoje zahteve (samo PENDING → PAID).</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy || payBusyId !== null}>
            <FiRefreshCw />
            Osveži
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && myPayItems.length === 0 ? <div className="eu-empty">Nema zahteva sa plaćanjem.</div> : null}

        <div className="eu-list">
          {!busy &&
            myPayItems.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowIcon">
                    <FiCreditCard />
                  </div>

                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">
                      Zahtev #{x.id}{" "}
                      <span className="eu-badge eu-badge--ghost">{norm(x.payment_status)}</span>
                    </div>

                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        Status zahteva: <b>{x?.status || "—"}</b>.
                      </span>{" "}
                      <span className="eu-muted">
                        Usluga: <b>{x?.service?.name || "—"}</b>.
                      </span>{" "}
                      <span className="eu-muted">
                        Taksa: <b>{Number(x?.service?.fee || 0).toFixed(2)}</b>
                      </span>
                    </div>

                    {x?.payment_date ? (
                      <div className="eu-muted" style={{ marginTop: 4 }}>
                        Datum uplate: <b>{new Date(x.payment_date).toLocaleString()}</b>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="eu-rowActions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="eu-btn eu-btn--ghost"
                    onClick={() => navigate(`/officer/requests/${x.id}`)}
                    disabled={payBusyId === x.id}
                  >
                    <FiExternalLink />
                    Detalji
                  </button>

                  <button
                    className="eu-btn eu-btn--primary"
                    onClick={() => markPaid(x.id)}
                    disabled={!canMarkPaid(x) || payBusyId === x.id}
                    title={!canMarkPaid(x) ? "Možeš označiti kao PAID samo kada je payment_status = PENDING." : ""}
                  >
                    <FiCheckCircle />
                    {payBusyId === x.id ? "Obrada…" : "Plaćeno"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
