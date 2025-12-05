import { Link } from 'react-router-dom'

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 100 100" className="text-[#D97757]">
              <circle cx="50" cy="50" r="45" fill="currentColor" />
              <circle cx="35" cy="42" r="6" fill="white" />
              <circle cx="65" cy="42" r="6" fill="white" />
              <path d="M 30 62 Q 50 78 70 62" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">Bobot</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-stone-600 dark:text-stone-400 hover:text-[#D97757] transition-colors"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Integritetspolicy
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">1. Inledning</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Bobot ("vi", "oss", "vår") värnar om din personliga integritet. Denna integritetspolicy förklarar hur vi samlar in,
                använder och skyddar dina personuppgifter när du använder vår AI-chattjänst och besöker vår webbplats bobot.nu.
              </p>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-3">
                Vi följer EU:s dataskyddsförordning (GDPR) och svensk dataskyddslagstiftning.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">2. Personuppgiftsansvarig</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Personuppgiftsansvarig för behandlingen av dina personuppgifter är:
              </p>
              <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 mt-3">
                <p className="text-stone-700 dark:text-stone-300 font-medium">Bobot</p>
                <p className="text-stone-600 dark:text-stone-400">GDPR-ansvarig: Marcus Widing</p>
                <p className="text-stone-600 dark:text-stone-400">E-post: <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:underline">hej@bobot.nu</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">3. Vilka uppgifter vi samlar in</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                Vi samlar in följande typer av personuppgifter:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300">
                <li><strong>Chattmeddelanden:</strong> De frågor du ställer till vår AI-assistent</li>
                <li><strong>Teknisk information:</strong> Anonymiserad IP-adress (sista oktetten maskeras), webbläsartyp</li>
                <li><strong>Sessionsdata:</strong> Ett unikt sessions-ID för att hålla ihop din konversation</li>
                <li><strong>Samtycke:</strong> Information om att du godkänt vår integritetspolicy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">4. Hur vi använder dina uppgifter</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                Vi behandlar dina personuppgifter för följande ändamål:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300">
                <li>För att tillhandahålla och förbättra vår AI-chattjänst</li>
                <li>För att svara på dina frågor baserat på företagets kunskapsbas</li>
                <li>För att generera anonymiserad statistik och förbättra tjänsten</li>
                <li>För att förhindra missbruk och säkerställa tjänstens tillgänglighet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">5. Rättslig grund</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vi behandlar dina personuppgifter baserat på följande rättsliga grunder enligt GDPR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300 mt-3">
                <li><strong>Samtycke (Art. 6.1.a):</strong> Du ger ditt samtycke innan du använder chattjänsten</li>
                <li><strong>Berättigat intresse (Art. 6.1.f):</strong> För att förhindra missbruk och förbättra tjänsten</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">6. Hur länge vi sparar dina uppgifter</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vi sparar dina chattkonversationer i maximalt <strong>30 dagar</strong>. Därefter raderas de automatiskt.
                Anonymiserad statistik (utan personuppgifter) kan sparas längre för att förbättra tjänsten.
              </p>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-3">
                Automatisk rensning sker varje timme för att säkerställa att inga uppgifter sparas längre än nödvändigt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">7. Delning av uppgifter</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vi delar <strong>inte</strong> dina personuppgifter med tredje part, förutom:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300 mt-3">
                <li>Det företag vars chattbot du använder (de kan se konversationshistorik för att förbättra sina svar)</li>
                <li>Om vi är skyldiga enligt lag att lämna ut uppgifter till myndigheter</li>
              </ul>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-3">
                <strong>Viktigt:</strong> All AI-behandling sker lokalt på våra servrar inom EU. Inga uppgifter skickas till externa AI-tjänster som OpenAI eller Google. Dedikerad svensk hosting finns som tillval.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">8. Dina rättigheter</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                Enligt GDPR har du följande rättigheter:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300">
                <li><strong>Rätt till tillgång:</strong> Du kan begära att få veta vilka uppgifter vi har om dig</li>
                <li><strong>Rätt till rättelse:</strong> Du kan begära att vi korrigerar felaktiga uppgifter</li>
                <li><strong>Rätt till radering:</strong> Du kan begära att vi raderar dina uppgifter ("rätten att bli glömd")</li>
                <li><strong>Rätt att återkalla samtycke:</strong> Du kan när som helst återkalla ditt samtycke</li>
                <li><strong>Rätt till dataportabilitet:</strong> Du kan begära att få ut dina uppgifter i ett maskinläsbart format</li>
                <li><strong>Rätt att lämna klagomål:</strong> Du kan lämna klagomål till Integritetsskyddsmyndigheten (IMY)</li>
              </ul>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-3">
                För att utöva dina rättigheter, kontakta oss på <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:underline">hej@bobot.nu</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">9. Säkerhet</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter, inklusive:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300 mt-3">
                <li>Kryptering av data under överföring (HTTPS/TLS)</li>
                <li>IP-anonymisering (sista oktetten av din IP-adress maskeras)</li>
                <li>Begränsad åtkomst till personuppgifter</li>
                <li>Automatisk radering av gamla konversationer</li>
                <li>Servrar placerade inom EU (dedikerad svensk hosting som tillval)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">10. Cookies</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vår chattwidget använder lokalt lagrad sessionsdata (localStorage) för att:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-600 dark:text-stone-300 mt-3">
                <li>Komma ihåg ditt samtycke</li>
                <li>Hålla din konversation ihop under sessionen</li>
              </ul>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-3">
                Vi använder inga spårningscookies eller tredjepartscookies för marknadsföring.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">11. Ändringar i policyn</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Vi kan komma att uppdatera denna integritetspolicy. Vid väsentliga ändringar kommer vi att informera om detta
                på vår webbplats. Senaste version finns alltid tillgänglig på denna sida.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">12. Kontakt</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Om du har frågor om denna integritetspolicy eller vår behandling av personuppgifter, kontakta oss:
              </p>
              <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 mt-3">
                <p className="text-stone-600 dark:text-stone-400">E-post: <a href="mailto:hej@bobot.nu" className="text-[#D97757] hover:underline">hej@bobot.nu</a></p>
                <p className="text-stone-600 dark:text-stone-400 mt-2">
                  Tillsynsmyndighet: <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-[#D97757] hover:underline">Integritetsskyddsmyndigheten (IMY)</a>
                </p>
              </div>
            </section>

          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-700 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            &copy; {new Date().getFullYear()} Bobot. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default PrivacyPolicy
