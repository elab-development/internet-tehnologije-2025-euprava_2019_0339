import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiCreditCard, FiRefreshCw, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function CitizenPayments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [payBusyId, setPayBusyId] = useState(null);
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
    return (items || []).filter(
      (x) => x?.payment_status && String(x.payment_status).toUpperCase() !== "NOT_REQUIRED"
    );
  }, [items]);

  const canPay = (x) => {
    const ps = String(x?.payment_status || "").toUpperCase();

    // Ne plaća se ako je već plaćeno ili nema potrebe.
    if (ps === "PAID" || ps === "NOT_REQUIRED" || ps === "PENDING") return false;

    // Opcionalno pravilo: plaćanje tek kad je zahtev odobren.
    // Ako želiš ovo pravilo, ostavi uključeno.
    const st = String(x?.status || "").toUpperCase();
    if (st !== "APPROVED") return false;

    return true;
  };

  const pay = async (id) => {
    setPayBusyId(id);
    setError("");
    try {
      await api.patch(`/api/service-requests/${id}/payment`, {
        payment_status: "PENDING",
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri plaćanju zahteva.");
    } finally {
      setPayBusyId(null);
    }
  };

  const payLabel = (x) => {
    const st = String(x?.status || "").toUpperCase();
    const ps = String(x?.payment_status || "").toUpperCase();

    if (ps === "PAID") return "Plaćeno.";
    if (ps === "NOT_REQUIRED") return "Nije potrebno.";
    if (st !== "APPROVED") return "Čeka odobrenje.";
    return "Plati.";
  };

  return (
    <div className="home-page">
      {/* Ako je ovo za OFFICER, promeni roleLabel="Službenik". */}
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Plaćanja</div>
            <div className="page-subtitle">Pregled payment statusa po zahtevima.</div>
          </div>

          <button className="eu-btn eu-btn--primary" onClick={load} disabled={busy || payBusyId !== null}>
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
                      Zahtev #{x.id}{" "}
                      <span className="eu-badge eu-badge--ghost">
                        {String(x.payment_status || "").toUpperCase()}
                      </span>
                    </div>
                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        Status: <b>{x?.status || "—"}</b>.
                      </span>{" "}
                      <span className="eu-muted">
                        Usluga: <b>{x?.service?.name || "—"}</b>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="eu-rowActions" style={{ display: "flex", gap: 10 }}>
                  <button
                    className="eu-btn eu-btn--ghost"
                    onClick={() => navigate(`/citizen/requests/${x.id}`)}
                    disabled={payBusyId === x.id}
                  >
                    <FiArrowRight />
                    Detalji
                  </button>

                  <button
                    className="eu-btn eu-btn--primary"
                    onClick={() => pay(x.id)}
                    disabled={!canPay(x) || payBusyId === x.id}
                    title={!canPay(x) ? "Plaćanje je dozvoljeno tek nakon odobrenja i ako nije već plaćeno." : ""}
                  >
                    <FiCheckCircle />
                    {payBusyId === x.id ? "Obrada…" : payLabel(x)}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
