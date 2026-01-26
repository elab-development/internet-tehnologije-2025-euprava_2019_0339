import { useEffect, useState } from "react";
import api from "../../api/axios";
import NavBar from "../../components/NavBar";
import { FiFileText, FiDownload } from "react-icons/fi";

export default function OfficerDocuments() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.get("/api/service-requests?status=APPROVED");
      setItems(res?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri dohvatanju dokumenata.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const downloadPdf = async (id) => {
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
      alert(e?.response?.data?.message || "Greška pri preuzimanju PDF-a.");
    }
  };

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="page-head">
          <div>
            <div className="page-title">Dokumenta</div>
            <div className="page-subtitle">Preuzmi PDF za odobrene zahteve.</div>
          </div>
        </div>

        {error ? <div className="eu-alert eu-alert--err">{error}</div> : null}
        {busy ? <div className="eu-empty">Učitavanje…</div> : null}
        {!busy && items.length === 0 ? <div className="eu-empty">Nema dokumenata.</div> : null}

        <div className="eu-list">
          {!busy &&
            items.map((x) => (
              <div key={x.id} className="eu-panel eu-panel--row">
                <div className="eu-rowLeft">
                  <div className="eu-rowIcon">
                    <FiFileText />
                  </div>
                  <div className="eu-rowMain">
                    <div className="eu-rowTitle">Zahtev #{x.id}</div>
                    <div className="eu-rowMeta">
                      <span className="eu-muted">
                        {x?.service?.name || "—"} • {x?.service?.institution?.name || "—"} • {x?.citizen?.name || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="eu-rowActions">
                  <button className="eu-btn eu-btn--primary" onClick={() => downloadPdf(x.id)}>
                    <FiDownload />
                    PDF
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
