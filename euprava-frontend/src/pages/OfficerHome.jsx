import { useMemo } from "react";
import { FiInbox, FiSearch, FiCheckCircle, FiXCircle, FiFileText, FiBarChart2 } from "react-icons/fi";

import NavBar from "../components/NavBar";
import ActionCard from "../components/ActionCard";

export default function OfficerHome() {
  const cards = useMemo(
    () => [
      { title: "Inbox zahteva", desc: "Pregled novih i dodeljenih zahteva.", Icon: FiInbox, route: "/officer/inbox", buttonText: "Otvori inbox" },
      { title: "Provera dokumentacije", desc: "Validacija priloga i unos napomena.", Icon: FiSearch, route: "/officer/review", buttonText: "Započni proveru" },
      { title: "Odobravanja", desc: "Odobri zahtev ili vrati na dopunu.", Icon: FiCheckCircle, route: "/officer/approvals", buttonText: "Odobravanja" },
      { title: "Odbijanja", desc: "Odbij zahtev uz obrazloženje.", Icon: FiXCircle, route: "/officer/rejections", buttonText: "Odbijanja" },
      { title: "Dokumenta", desc: "Generisanje i preuzimanje PDF dokumenata.", Icon: FiFileText, route: "/officer/documents", buttonText: "Dokumenta" },
      { title: "Statistika", desc: "Uvid u statuse i učinak.", Icon: FiBarChart2, route: "/officer/stats", buttonText: "Vidi statistiku" },
    ],
    []
  );

  return (
    <div className="home-page">
      <NavBar roleLabel="Službenik" />

      <div className="home-wrap">
        <div className="home-hero">
          <div className="home-hero__title">Dashboard</div>
          <div className="home-subtitle">Upravljanje obradom zahteva kroz ključne akcije.</div>
        </div>

        <div className="home-grid">
          {cards.map((c) => (
            <ActionCard key={c.title} title={c.title} desc={c.desc} Icon={c.Icon} route={c.route} buttonText={c.buttonText} />
          ))}
        </div>
      </div>
    </div>
  );
}
