import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiArrowLeft, FiUpload, FiSave } from "react-icons/fi";

export default function CitizenRequestNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get("service_id") || "";

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [citizenNote, setCitizenNote] = useState("");
  const [attachmentLink, setAttachmentLink] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const loadServices = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/services");
      setServices(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju usluga.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const serviceLabel = useMemo(() => {
    const s = services.find((x) => String(x.id) === String(serviceId));
    return s?.name || "";
  }, [services, serviceId]);

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
      setOk("Fajl je uspešno uploadovan.");
    } catch (e) {
      const data = e?.response?.data;
      const baseMsg = data?.message || e?.message || "Greška pri upload-u fajla.";

      // Prikaži pravi uzrok (status + body) koji backend vraća kada filebin odbije.
      const httpCode = data?.status || e?.response?.status;
      const body = data?.body ? String(data.body) : "";
      const extra = httpCode ? ` (HTTP: ${httpCode})` : "";

      // Ne spamuj UI — skraćujemo body ako je predugačak.
      const bodyShort = body ? ` — ${body.slice(0, 600)}` : "";

      setError(`${baseMsg}${extra}${bodyShort}.`);
    } finally {
      setBusy(false);
    }
  };

  const createDraft = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const payload = {
        service_id: serviceId ? Number(serviceId) : null,
        citizen_note: citizenNote || null,
        attachment: attachmentLink || null,
      };

      const res = await api.post("/api/service-requests", payload);
      const created = res?.data?.data;
      setOk("Zahtev je kreiran kao DRAFT.");
      if (created?.id) navigate(`/citizen/requests/${created.id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri kreiranju zahteva.");
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
            <div className="page-title">Novi zahtev</div>
            <div className="page-subtitle">Kreiraj zahtev kao DRAFT, zatim ga pošalji.</div>
          </div>

          <button className="eu-btn eu-btn--ghost" onClick={() => navigate(-1)} disabled={busy}>
            <FiArrowLeft />
            Nazad
          </button>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {ok ? <div className="eu-alert eu-alert--info">{ok}</div> : null}

        <div className="eu-panel">
          <div className="eu-form">
            <div className="eu-field">
              <label>Usluga</label>
              <select
                className="eu-select eu-select--full"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                disabled={busy}
              >
                <option value="">Izaberi uslugu…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s?.institution?.name || "—"}
                  </option>
                ))}
              </select>
              {serviceLabel ? <div className="eu-hint">Izabrano: {serviceLabel}.</div> : null}
            </div>

            <div className="eu-field">
              <label>Napomena</label>
              <textarea
                className="eu-textarea"
                rows={5}
                placeholder="Unesi napomenu (opciono)…"
                value={citizenNote}
                onChange={(e) => setCitizenNote(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="eu-field">
              <label>Prilog (opciono)</label>

              <div className="eu-uploadRow">
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                  }}
                  disabled={busy}
                />
              </div>

              {attachmentLink ? (
                <div className="eu-hint">
                  Sačuvan link: <span className="eu-mono">{attachmentLink}</span>.
                </div>
              ) : null}
            </div>

            <div className="eu-actions">
              <button className="eu-btn eu-btn--primary" onClick={createDraft} disabled={busy || !serviceId}>
                <FiSave />
                Sačuvaj kao DRAFT
              </button>

              <button className="eu-btn eu-btn--ghost" onClick={() => navigate("/citizen/services")} disabled={busy}>
                <FiUpload />
                Izaberi uslugu iz kataloga
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
