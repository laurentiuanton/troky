import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-16 px-6 mx-auto animate-fade-in text-foreground">
      {/* SUMAR PRIVACY (Versiune Scurtă) */}
      <div className="bg-muted/30 border-2 border-primary/20 rounded-3xl p-8 mb-12 shadow-sm">
        <h2 className="text-xl font-black mb-4 uppercase tracking-wider text-primary">Rezumat: Pe scurt despre datele tale</h2>
        <ul className="space-y-3 text-sm font-medium">
          <li className="flex items-start gap-2">✅ <strong>Scop:</strong> Folosim datele tale pentru a-ți permite să publici anunțuri, să comunici cu alți utilizatori și să facem schimburile sigure.</li>
          <li className="flex items-start gap-2">🔒 <strong>Securitate:</strong> Datele tale sunt criptate și nu vindem niciodată baza noastră de date către terți.</li>
          <li className="flex items-start gap-2">📍 <strong>Locația:</strong> Colectăm locația ta doar dacă o setezi explicit pentru anunțuri, pentru a găsi parteneri de schimb în apropiere.</li>
          <li className="flex items-start gap-2">📩 <strong>Drepturi:</strong> Poți solicita oricând ștergerea contului sau exportul datelor printr-un simplu e-mail.</li>
        </ul>
      </div>

      <article className="prose prose-slate max-w-none prose-h1:text-4xl prose-h1:font-black prose-h2:text-2xl prose-h2:font-extrabold prose-h2:mt-12 prose-h2:mb-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
        <h1>Politică de Confidențialitate</h1>
        <p className="font-bold italic">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>

        <section>
            <h2>1. Informații Generale și Operatorul de Date</h2>
            <p>
                Prezenta Politică de Confidențialitate descrie modul în care <strong>[NUME COMPANIE / PERSOANĂ FIZICĂ]</strong>, cu sediul în [ADRESA], 
                înregistrată la Registrul Comerțului sub nr. [CUI/J], (denumită în continuare „<strong>Troky</strong>” sau „Operatorul”), colectează, utilizează 
                și protejează datele tale cu caracter personal în calitate de utilizator al platformei https://troky-alpha.vercel.app/.
            </p>
            <p>
                Suntem dedicați protejării vieții tale private în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională (Legea 190/2018).
            </p>
            <p>
                <strong>Date de contact DPO:</strong> [EMAIL CONTACT]
            </p>
        </section>

        <section>
            <h2>2. Ce date colectăm?</h2>
            <p>Colectăm doar datele strict necesare pentru funcționarea serviciului de barter și marketplace:</p>
            <ul>
                <li><strong>Date de identificare:</strong> Nume, prenume, adresa de e-mail, număr de telefon (verificat pentru siguranța tranzacțiilor).</li>
                <li><strong>Date de profil:</strong> Username, avatar, locația geografică (oraș/sector) furnizată voluntar pentru anunțuri.</li>
                <li><strong>Conținut generat de utilizator:</strong> Textul anunțurilor, fotografii încărcate, mesaje transmise prin sistemul intern de chat.</li>
                <li><strong>Date tehnice:</strong> Adresa IP, tipul browserului, identificatori de dispozitiv, fișiere de tip cookie și date de trafic.</li>
                <li><strong>Gestiunea Schimburilor:</strong> Istoricul tranzacțiilor/schimburilor propuse și acceptate.</li>
            </ul>
        </section>

        <section>
            <h2>3. Scopurile și Temeiurile Legale ale Prelucrării</h2>
            <p>Prelucrăm datele tale în baza următoarelor temeiuri prevăzute de Art. 6 din GDPR:</p>
            <table className="min-w-full border-collapse border border-border mt-4">
                <thead>
                    <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Scopul Prelucrării</th>
                        <th className="border border-border p-3 text-left">Temeiul Legal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-border p-3">Crearea contului și furnizarea serviciilor de marketplace (postare anunțuri)</td>
                        <td className="border border-border p-3">Executarea contractului (Termeni și Condiții) - Art. 6(1)(b)</td>
                    </tr>
                    <tr>
                        <td className="border border-border p-3">Comunicarea între utilizatori (Chat intern)</td>
                        <td className="border border-border p-3">Executarea contractului - Art. 6(1)(b)</td>
                    </tr>
                    <tr>
                        <td className="border border-border p-3">Prevenirea fraudelor și moderarea conținutului nepotrivit</td>
                        <td className="border border-border p-3">Interes legitim - Art. 6(1)(f)</td>
                    </tr>
                    <tr>
                        <td className="border border-border p-3">Trimiterea de newslettere sau alerte de marketing</td>
                        <td className="border border-border p-3">Consimțământ - Art. 6(1)(a)</td>
                    </tr>
                    <tr>
                        <td className="border border-border p-3">Îmbunătățirea tehnică a platformei (Analiză IP/Erori)</td>
                        <td className="border border-border p-3">Interes legitim - Art. 6(1)(f)</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section>
            <h2>4. Mesageria între utilizatori și Moderarea</h2>
            <p>
                Pentru a asigura un mediu sigur, <strong>sistemul de chat pe Troky nu este privat în sens absolut</strong>. Operatorul poate accesa 
                conținutul mesajelor prin algoritmi de scanare automată sau intervenție umană în cazul raportărilor de fraudă, hărțuire sau 
                conținut ilegal, în baza interesului legitim de a proteja comunitatea.
            </p>
        </section>

        <section>
            <h2>5. Cui divulgăm datele tale?</h2>
            <p>Nu vindem datele tale. Acestea pot fi transmise doar către:</p>
            <ul>
                <li><strong>Alți utilizatori:</strong> Datele publice (nume, oraș, anunțuri) sunt vizibile oricui. Numărul de telefon este vizibil doar dacă alegi acest lucru.</li>
                <li><strong>Furnizori de servicii:</strong> Hosting (Vercel), Baze de date (Supabase), Servicii e-mail (Resend/SendGrid).</li>
                <li><strong>Autorități publice:</strong> Doar la cererea expresă și legală a Poliției, Instanțelor sau ANSPDCP.</li>
            </ul>
        </section>

        <section>
            <h2>6. Perioada de Stocare</h2>
            <p>
                Păstrăm datele tale pe perioada existenței contului de utilizator. În cazul în care soliciți ștergerea contului, datele tale vor fi 
                anonimitate sau șterse în maxim 30 de zile, cu excepția datelor pe care suntem obligați legal să le păstrăm (ex: facturi, dacă este cazul) 
                sau a log-urilor necesare pentru securitate timp de 12 luni.
            </p>
        </section>

        <section>
            <h2>7. Drepturile Tale conform GDPR</h2>
            <p>În calitate de persoană vizată, ai următoarele drepturi:</p>
            <ul>
                <li><strong>Dreptul de acces:</strong> Poți cere o copie a datelor pe care le deținem.</li>
                <li><strong>Dreptul la rectificare:</strong> Poți corecta datele inexacte din setările profilului.</li>
                <li><strong>Dreptul la ștergere („Dreptul de a fi uitat”):</strong> Poți cere închiderea contului și ștergerea datelor.</li>
                <li><strong>Dreptul la portabilitate:</strong> Poți cere exportul datelor într-un format structurat.</li>
                <li><strong>Dreptul de opoziție:</strong> Te poți opune prelucrării în scop de marketing direct.</li>
            </ul>
            <p>
                Pentru exercitarea acestor drepturi, ne poți contacta la adresa de e-mail: <strong>[EMAIL CONTACT]</strong>. 
                Vom răspunde solicitării tale în termen de maxim 30 de zile.
            </p>
        </section>

        <section>
            <h2>8. Dreptul de a depune plângere</h2>
            <p>
                Dacă consideri că prelucrarea datelor tale încalcă GDPR, ai dreptul de a depune o plângere la autoritatea de supraveghere din România: <br />
                <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal) <br />
                B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București <br />
                Web: <a href="https://www.dataprotection.ro" className="text-primary underline">www.dataprotection.ro</a>
            </p>
        </section>

        <section>
            <h2>9. Datele Minorilor</h2>
            <p>
                Platforma Troky nu este destinată persoanelor sub vârsta de 18 ani. Nu colectăm cu bună știință date de la minori. 
                Dacă descoperim că un minor a creat un cont, îl vom șterge imediat.
            </p>
        </section>

        <section>
            <h2>10. Securitatea Datelor</h2>
            <p>
                Implementăm măsuri tehnice moderne: conexiuni HTTPS criptate, hashing pentru parole și acces restricționat la bazele de date. 
                Cu toate acestea, niciun sistem nu este imposibil de penetrat, de aceea recomandăm folosirea unor parole unice și complexe.
            </p>
        </section>

        <div className="mt-16 p-6 border-t border-border text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Troky. Acest document are valoare juridică și reglementează relația privitoare la datele personale.</p>
        </div>
      </article>
    </div>
  )
}
