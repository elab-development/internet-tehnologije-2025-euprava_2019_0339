import NavBar from "../../components/NavBar";

export default function AdminDocuments() {
  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />
      <div className="home-wrap">
        <div className="page-title">Dokumenta</div>
        <div className="eu-alert eu-alert--info" style={{ marginTop: 12 }}>
          Ova stranica je namerno nedovršena. Trenutno nema posebnih admin ruta za “documents” u backend-u.
        </div>
      </div>
    </div>
  );
}
