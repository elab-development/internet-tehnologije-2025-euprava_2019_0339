import { useMemo } from "react";
import { FiPlusCircle, FiList, FiCreditCard, FiCalendar, FiClock } from "react-icons/fi";

import NavBar from "../components/NavBar";
import ActionCard from "../components/ActionCard";

export default function CitizenHome() {
  const cards = useMemo(
    () => [
      { title: "Podnesi zahtev", desc: "Kreiraj novi zahtev i priloži dokumenta.", Icon: FiPlusCircle, route: "/citizen/requests/new", buttonText: "Novi zahtev" },
      { title: "Moji zahtevi", desc: "Pregled statusa i preuzimanje PDF-a.", Icon: FiList, route: "/citizen/requests", buttonText: "Otvori listu" },
      { title: "Plaćanja", desc: "Ažuriranje i pregled informacija o uplati.", Icon: FiCreditCard, route: "/citizen/payments", buttonText: "Vidi plaćanja" },
    ],
    []
  );

  return (
    <div className="home-page">
      <NavBar roleLabel="Građanin" />

      <div className="home-wrap">
        <div className="home-hero">
          <div className="home-hero__title">Moj nalog</div>
          <div className="home-subtitle">Brz pristup najvažnijim uslugama i zahtevima.</div>
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
