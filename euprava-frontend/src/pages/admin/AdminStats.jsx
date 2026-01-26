import NavBar from "../../components/NavBar";

export default function AdminStats() {
  return (
    <div className="home-page">
      <NavBar roleLabel="Administrator" />
      <div className="home-wrap">
        <div className="page-title">Statistika</div>
        <div className="eu-alert eu-alert--info" style={{ marginTop: 12 }}>
          Ova stranica je namerno nedovršena. Backend ruta /api/stats postoji, ali je ovde ostavljeno kao placeholder po zahtevu.
        </div>
      </div>
    </div>
  );
}
