import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";

import { FiFileText, FiCheckCircle, FiXCircle, FiArrowLeft, FiDownload, FiEdit3 } from "react-icons/fi";

export default function OfficerRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [officerNote, setOfficerNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get(`/api/service-requests/${id}`);
      const data = res?.data?.data || null;
      setItem(data);
      setOfficerNote(data?.officer_note || "");
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju detalja zahteva.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const canChangeStatus = useMemo(() => {
    return String(item?.status || "").toUpperCase() === "IN_REVIEW";
  }, [item?.status]);

  const setStatus = async (status) => {
    if (!canChangeStatus) {
      setError("Odobravanje/odbijanje je dozvoljeno samo za zahteve koji su u statusu IN_REVIEW.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api.patch(`/api/service-requests/${id}/status`, {
        status,
        officer_note: officerNote || null,
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri promeni statusa.");
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get(`/api/service-requests/${id}/pdf`, { responseType: "blob" });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `zahtev-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri preuzimanju PDF-a.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Zahtev #{id}</div>
            <div className="page-subtitle">Pregled detalja i akcije (odobri/odbij, PDF).</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="eu-btn eu-btn--ghost" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              Nazad
            </button>

            <button className="eu-btn eu-btn--primary" onClick={downloadPdf} disabled={busy || !item}>
              <FiDownload />
              PDF
            </button>
          </div>
        </div>

        {error ? (
          <div className="eu-alert eu-alert--err">
            <span className="eu-strong">Greška:</span> {error}
          </div>
        ) : null}

        {busy && !item ? <div className="eu-empty">Učitavanje…</div> : null}

        {item ? (
          <div className="review-grid">
            <div className="eu-panel">
              <div className="eu-sectionTitle">
                <FiFileText /> Podaci
              </div>

              <div className="eu-kv">
                <div className="eu-kvRow">
                  <div className="eu-muted">Status</div>
                  <div>
                    <span className="eu-badge eu-badge--info">{item.status}</span>
                  </div>
                </div>

                <div className="eu-kvRow">
                  <div className="eu-muted">Usluga</div>
                  <div className="eu-strong">{item?.service?.name || "—"}</div>
                </div>

                <div className="eu-kvRow">
                  <div className="eu-muted">Institucija</div>
                  <div className="eu-strong">{item?.service?.institution?.name || "—"}</div>
                </div>

                <div className="eu-kvRow">
                  <div className="eu-muted">Korisnik</div>
                  <div className="eu-strong">{item?.citizen?.name || "—"}</div>
                </div>

                <div className="eu-kvRow">
                  <div className="eu-muted">Napomena građanina</div>
                  <div>{item?.citizen_note || "—"}</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="eu-sectionTitle">
                  <FiEdit3 /> Napomena službenika
                </div>
                <textarea
                  className="eu-textarea"
                  placeholder="Unesi komentar (opciono)..."
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  rows={4}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="eu-panel">
              <div className="eu-sectionTitle">Akcije</div>

              {!canChangeStatus ? (
                <div className="eu-alert eu-alert--info" style={{ marginBottom: 10 }}>
                  Ove akcije su dostupne samo kada je zahtev u statusu <b>IN_REVIEW</b>.
                </div>
              ) : (
                <div className="eu-empty" style={{ padding: 0, marginBottom: 10 }}>
                  Status se može promeniti samo iz IN_REVIEW (backend pravilo).
                </div>
              )}

              <div style={{ display: "grid", gap: 10 }}>
                <button
                  className="eu-btn eu-btn--primary"
                  onClick={() => setStatus("APPROVED")}
                  disabled={busy || !canChangeStatus}
                >
                  <FiCheckCircle />
                  Odobri
                </button>

                <button
                  className="eu-btn eu-btn--danger"
                  onClick={() => setStatus("REJECTED")}
                  disabled={busy || !canChangeStatus}
                >
                  <FiXCircle />
                  Odbij
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
