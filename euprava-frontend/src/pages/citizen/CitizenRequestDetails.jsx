import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiArrowLeft, FiDownload, FiSend, FiTrash2, FiSave, FiUpload } from "react-icons/fi";

export default function CitizenRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [citizenNote, setCitizenNote] = useState("");
  const [attachmentLink, setAttachmentLink] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await api.get(`/api/service-requests/${id}`);
      const data = res?.data?.data || null;
      setItem(data);
      setCitizenNote(data?.citizen_note || "");
      setAttachmentLink(data?.attachment || "");
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju zahteva.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const isDraft = useMemo(() => String(item?.status || "").toUpperCase() === "DRAFT", [item?.status]);

  const upload = async (file) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/api/uploads/filebin", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const link = res?.data?.link || "";
      setAttachmentLink(link);
      setOk("Fajl je uspešno uploadovan (link je popunjen).");
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri upload-u fajla.");
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.put(`/api/service-requests/${id}`, {
        citizen_note: citizenNote || null,
        attachment: attachmentLink || null,
      });
      setOk("DRAFT je sačuvan.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri čuvanju DRAFT-a.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.patch(`/api/service-requests/${id}/submit`);
      setOk("Zahtev je uspešno poslat (SUBMITTED).");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri slanju zahteva.");
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      await api.delete(`/api/service-requests/${id}`);
      navigate("/citizen/requests");
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri brisanju zahteva.");
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
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Zahtev #{id}</div>
            <div className="page-subtitle">Detalji zahteva, slanje i preuzimanje PDF-a.</div>
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

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info">{ok}</div> : null}

        {busy && !item ? <div className="eu-empty">Učitavanje…</div> : null}

        {item ? (
          <div className="review-grid">
            <div className="eu-panel">
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
                  <div className="eu-muted">Plaćanje</div>
                  <div className="eu-strong">{item?.payment_status || "—"}</div>
                </div>

                <div className="eu-kvRow">
                  <div className="eu-muted">Napomena službenika</div>
                  <div>{item?.officer_note || "—"}</div>
                </div>
              </div>

              <div className="eu-sep" />

              <div className="eu-form">
                <div className="eu-field">
                  <label>Moja napomena</label>
                  <textarea
                    className="eu-textarea"
                    rows={5}
                    value={citizenNote}
                    onChange={(e) => setCitizenNote(e.target.value)}
                    disabled={busy || !isDraft}
                    placeholder={isDraft ? "Unesi napomenu…" : "Napomena se može menjati samo u DRAFT statusu."}
                  />
                </div>

                <div className="eu-field">
                  <label>Prilog (link)</label>
                  <input
                    className="eu-inputLine"
                    value={attachmentLink}
                    onChange={(e) => setAttachmentLink(e.target.value)}
                    disabled={busy || !isDraft}
                    placeholder="Npr. https://…"
                  />

                  <div className="eu-uploadRow">
                    <input
                      type="file"
                      disabled={busy || !isDraft}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(f);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="eu-panel">
              <div className="eu-sectionTitle">Akcije</div>

              {!isDraft ? (
                <div className="eu-alert eu-alert--info" style={{ marginBottom: 10 }}>
                  Izmena, slanje i brisanje su dostupni samo u statusu <b>DRAFT</b>.
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 10 }}>
                <button className="eu-btn eu-btn--primary" onClick={saveDraft} disabled={busy || !isDraft}>
                  <FiSave />
                  Sačuvaj DRAFT
                </button>

                <button className="eu-btn eu-btn--primary" onClick={submit} disabled={busy || !isDraft}>
                  <FiSend />
                  Pošalji zahtev
                </button>

                <button className="eu-btn eu-btn--danger" onClick={remove} disabled={busy || !isDraft}>
                  <FiTrash2 />
                  Obriši DRAFT
                </button>

                <button className="eu-btn eu-btn--ghost" onClick={() => navigate("/citizen/services")} disabled={busy}>
                  <FiUpload />
                  Katalog usluga
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
