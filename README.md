## Opis aplikacije

Aplikacija za e-upravu je veb platforma koja omogućava građanima da na jednom mestu podnose elektronske zahteve prema različitim državnim institucijama, prate njihov status i dobijaju rešenja u digitalnoj formi. Problem koji sistem rešava je fragmentisan i spor proces podnošenja zahteva „na šalteru“, uz fizičko donošenje dokumentacije, čekanje u redovima i nedostatak uvida u to gde se zahtev trenutno nalazi. Umesto toga, aplikacija uvodi centralizovan, transparentan i digitalizovan pristup, gde se kompletna komunikacija između građanina i organa odvija onlajn, uključujući slanje priloga i evidentiranje plaćanja taksi.

Glavni cilj aplikacije je da omogući jednostavno podnošenje *service request*-ova za različite servise e-uprave (npr. izdavanje uverenja ili potvrda), da obezbedi efikasan proces obrade na strani službenika i da pruži administratoru uvid u rad sistema i globalne metrike. Sistem omogućava da svaki zahtev bude jasno povezan sa konkretnom uslugom (*Service*) i institucijom (*Institution*), da se status prati kroz ceo životni ciklus (od kreiranja do odobravanja ili odbijanja) i da se plaćanje takse i prilozi (*attachment*) vezuju za odgovarajući *ServiceRequest*. Time se postiže veća efikasnost rada uprave, smanjenje papirologije i bolja kontrola nad procesom obrade zahteva.

## Tehnologije korišćene

- **Frontend:** React (CRA) + JavaScript.  
- **Backend:** PHP **Laravel** (REST API, JSON).  
- **Baza:** **MySQL**.  
- **Dev alatke:** Node.js, Composer, XAMPP (za lokalni rad bez Dockera).  
- **Docker:** Dockerfile + docker-compose (frontend, backend, baza).  
- **Integracije:**  
  - **0x0.st** (javni servis za upload i linkovanje priloga).  
  - **Countries API** (dohvat liste država radi prikaza na UI).  

## Pokretanje projekta (lokalno bez Docker-a)

> Pretpostavke: instalirani **Node 18+**, **PHP 8.2+**, **Composer**, **XAMPP**.
> NAPOMENA: U XAMPP-u pokrenuti: **Apache** i **MySQL**

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2025-euprava_2019_0339.git
```
2. Pokrenite backend:
```bash
   cd portal-euprava
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd euprava-frontend
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

## Pokretanje projekta uz Docker

> Pretpostavke: instaliran i pokrenut **Docker Desktop**.
> NAPOMENA: U XAMPP-u pokrenuti: **Apache** (**MySQL** sada pokrece Docker, tako da njega ne pokretati!)

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2025-euprava_2019_0339.git
```

2. Pokrenite Docker kompoziciju:
```bash
    docker compose down -v
    docker compose up --build
```

3.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)