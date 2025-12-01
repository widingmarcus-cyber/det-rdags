# Bobot — Produktspecifikation

## Översikt

**Bobot** är en GDPR-säker AI-chatbot för fastighetsbolag där kunder själva bygger sin kunskapsbas.

---

## 1. Admin-panel — Funktioner

### 1.1 Autentisering

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Inloggning | E-post + lösenord | MVP |
| Glömt lösenord | Återställning via e-post | MVP |
| Tvåfaktorsautentisering | TOTP (Google Authenticator) | Senare |
| Användarnivåer | Admin / Redaktör / Läsare | Senare |
| SSO | SAML/OAuth för stora kunder | Senare |

### 1.2 Kunskapshantering

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Lägg till fråga/svar | Manuell inmatning | MVP |
| Redigera fråga/svar | Uppdatera befintliga | MVP |
| Ta bort fråga/svar | Med bekräftelse | MVP |
| Kategorisering | Tagga frågor (t.ex. "Felanmälan", "Hyra") | MVP |
| Importera FAQ | Ladda upp CSV/Excel | Bra att ha |
| Ladda upp dokument | PDF/Word som AI läser | Senare |
| Versionshistorik | Se tidigare versioner | Senare |
| Bulk-redigering | Ändra flera samtidigt | Senare |

### 1.3 Inställningar

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Företagsnamn | Visas i widgeten | MVP |
| Logotyp | Ladda upp för branding | MVP |
| Primärfärg | Anpassa widget-tema | MVP |
| Välkomstmeddelande | Första meddelandet användaren ser | MVP |
| Fallback-meddelande | När AI inte vet svaret | MVP |
| Kontaktinfo | Visas vid eskalering | MVP |
| Öppettider | För "kontakta oss" | Bra att ha |
| Språk | Svenska/Engelska | Senare |

### 1.4 Widget-konfiguration

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Embed-kod | Kopiera script-tag | MVP |
| Förhandsgranska | Se hur widgeten ser ut | MVP |
| Position | Höger/vänster hörn | Bra att ha |
| Triggertext | Texten på knappen | Bra att ha |
| Fördröjning | Visa efter X sekunder | Senare |
| Sidfilter | Visa bara på vissa sidor | Senare |

### 1.5 Statistik och analys

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Antal konversationer | Per dag/vecka/månad | MVP |
| Vanligaste frågorna | Topp 10 lista | MVP |
| Obesvarade frågor | Frågor AI inte kunde svara på | MVP |
| Exportera data | CSV-export | Bra att ha |
| Nöjdhetsbetyg | Tumme upp/ner per svar | Bra att ha |
| Tidsanalys | När användare frågar mest | Senare |
| Konverteringar | Klick på "kontakta oss" | Senare |

### 1.6 Konversationshistorik

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Se konversationer | Lista alla chattar | MVP |
| Sök i konversationer | Fritextsök | Bra att ha |
| Filtrera | Per datum, kategori | Bra att ha |
| Radera konversation | GDPR-krav | MVP |
| Radera all data | Komplett radering | MVP |

### 1.7 Integrationer (senare)

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Webhook | Skicka data vid händelser | Senare |
| API-nyckel | För egen integration | Senare |
| Momentum | Skapa ärende direkt | Senare |
| E-post | Skicka konversation som mail | Senare |

---

## 2. Chattwidget — Funktioner (Användare)

### 2.1 Grundläggande

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Öppna/stänga chatt | Klick på ikon | MVP |
| Skicka meddelande | Textinput + enter/knapp | MVP |
| Ta emot svar | Visas med typing-indikator | MVP |
| Scrollbar historik | Se tidigare i konversationen | MVP |
| Responsiv design | Funkar på mobil | MVP |

### 2.2 UX-förbättringar

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Typing-indikator | "..." medan AI tänker | MVP |
| Snabbknappar | Föreslagna frågor | Bra att ha |
| Markdown-stöd | Fet text, listor i svar | Bra att ha |
| Länkklickbara | URL:er blir klickbara | MVP |
| Emoji-stöd | Rendera emojis | Bra att ha |
| Ljudnotis | Pip vid nytt svar (valfritt) | Senare |

### 2.3 Eskalering

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| "Kontakta oss"-knapp | Visas när AI inte kan svara | MVP |
| Visa kontaktinfo | Telefon, e-post | MVP |
| Skicka konversation | Maila chatten till support | Bra att ha |
| Boka tid | Kalenderintegration | Senare |

### 2.4 Tillgänglighet

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Tangentbordsnavigering | Tab, Enter, Escape | MVP |
| Skärmläsarstöd | ARIA-labels | MVP |
| Kontrast | WCAG AA-nivå | MVP |
| Textstorlek | Skalbar | Bra att ha |

### 2.5 Integritet

| Funktion | Beskrivning | Prioritet |
|----------|-------------|-----------|
| Cookiebanner | Visa om cookies används | MVP |
| Inga cookies | Alternativ: sessionStorage | MVP |
| Rensa chatt | Användaren kan radera | Bra att ha |
| Integritetspolicy | Länk i widgeten | MVP |

---

## 3. Design — Riktlinjer

### 3.0 Designfilosofi

**Bobot ska kännas:**
- Lugn och intelligent, aldrig stressig
- Mänsklig, inte robotisk
- Premium men tillgänglig
- Modern utan att vara trendig

**Inspirerad av:**
- Anthropic: Värme, typografi, whitespace
- Linear: Precision, subtila animationer
- Notion: Enkelhet, fokus på innehåll
- Raycast: Mjuka skuggor, glaseffekter

**Nyckelord:**
```
Mjuk. Varm. Tillförlitlig. Intelligent. Stilla.
```

---

### 3.1 Färgpalett

#### Ljust tema (default)

```css
/* Bakgrunder */
--bg-primary:       #FAFAFA;      /* Huvudbakgrund, nästan vit med värme */
--bg-secondary:     #F5F5F4;      /* Kort, sektioner */
--bg-tertiary:      #FFFFFF;      /* Upphöjda element */
--bg-chat-user:     #F0EBE3;      /* Användarens meddelanden, varm sand */
--bg-chat-bot:      #FFFFFF;      /* Botens meddelanden */

/* Text */
--text-primary:     #1C1917;      /* Huvudtext, varm svart */
--text-secondary:   #57534E;      /* Sekundär text */
--text-tertiary:    #A8A29E;      /* Placeholder, hints */
--text-inverse:     #FAFAFA;      /* Text på mörk bakgrund */

/* Accenter */
--accent-primary:   #D97757;      /* Varm terrakotta, CTA */
--accent-hover:     #C4613D;      /* Hover state */
--accent-soft:      #FEF2EE;      /* Mjuk accent-bakgrund */
--accent-glow:      rgba(217, 119, 87, 0.15);  /* Subtle glow */

/* Feedback */
--success:          #4A9D7C;      /* Dämpad grön */
--success-soft:     #EDF7F3;
--warning:          #D4A054;      /* Varm gul */
--warning-soft:     #FEF9EE;
--error:            #C75D5D;      /* Mjuk röd */
--error-soft:       #FDF2F2;

/* Gränser & skuggor */
--border-subtle:    #E7E5E4;      /* Subtila linjer */
--border-default:   #D6D3D1;      /* Standard gränser */
--shadow-sm:        0 1px 2px rgba(28, 25, 23, 0.04);
--shadow-md:        0 4px 12px rgba(28, 25, 23, 0.06);
--shadow-lg:        0 12px 32px rgba(28, 25, 23, 0.08);
--shadow-glow:      0 0 24px rgba(217, 119, 87, 0.12);
```

#### Mörkt tema

```css
/* Bakgrunder */
--bg-primary:       #161514;      /* Varm svart */
--bg-secondary:     #1C1B1A;      /* Kort */
--bg-tertiary:      #242321;      /* Upphöjda element */
--bg-chat-user:     #2A2826;      /* Användarens meddelanden */
--bg-chat-bot:      #1C1B1A;      /* Botens meddelanden */

/* Text */
--text-primary:     #F5F5F4;
--text-secondary:   #A8A29E;
--text-tertiary:    #78716C;
--text-inverse:     #1C1917;

/* Accenter behåller sin värme */
--accent-primary:   #E08B6D;
--accent-hover:     #D97757;
--accent-soft:      rgba(224, 139, 109, 0.12);
```

---

### 3.2 Typografi

**Typsnitt:**

```css
/* Rubriker: Elegant, läsbar */
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Brödtext: Optimerad för läsning */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Kod/tekniskt: Monospace med personlighet */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

**Storlekar (fluid typography):**

```css
--text-xs:    0.75rem;    /* 12px - Labels, hints */
--text-sm:    0.875rem;   /* 14px - Sekundär text */
--text-base:  1rem;       /* 16px - Brödtext */
--text-lg:    1.125rem;   /* 18px - Lead text */
--text-xl:    1.25rem;    /* 20px - Liten rubrik */
--text-2xl:   1.5rem;     /* 24px - Sektion */
--text-3xl:   1.875rem;   /* 30px - Sidrubrik */
--text-4xl:   2.25rem;    /* 36px - Hero */
```

**Vikt:**

```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
```

**Line height:**

```css
--leading-tight:  1.25;   /* Rubriker */
--leading-normal: 1.5;    /* Brödtext */
--leading-relaxed: 1.625; /* Längre text */
```

**Letter spacing:**

```css
--tracking-tight:  -0.02em;  /* Stora rubriker */
--tracking-normal:  0;       /* Brödtext */
--tracking-wide:    0.02em;  /* Labels, knappar */
```

---

### 3.3 Spacing & Layout

**Spacing skala (8px bas):**

```css
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
```

**Border radius:**

```css
--radius-sm:   6px;     /* Inputs, badges */
--radius-md:   8px;     /* Kort, knappar */
--radius-lg:   12px;    /* Modaler, stora kort */
--radius-xl:   16px;    /* Widget container */
--radius-full: 9999px;  /* Avatars, pills */
```

**Whitespace-principer:**
- Generös padding inuti element
- Tydlig separation mellan sektioner
- Aldrig trångt, alltid andrum
- Gruppera relaterat innehåll visuellt

---

### 3.4 Widget-design

**Dimensioner:**

| State | Desktop | Mobil |
|-------|---------|-------|
| Stängd | 56x56 px cirkel | 52x52 px |
| Öppen | 400x600 px | 100% width, 85% height |
| Position | 24px från hörn | 16px från kanter |

**Struktur:**

```
+------------------------------------------+
|  Header                                  |
|  [Avatar] Bobot          [Minimera] [X]  |
+------------------------------------------+
|                                          |
|  Konversation                            |
|                                          |
|        Hej! Hur kan jag hjälpa dig?      |
|                                          |
|  Var hittar jag tvättstugan?             |
|                                          |
|        Tvättstugan finns i källar-       |
|        planet, ingång via port B.        |
|                                          |
|                                          |
+------------------------------------------+
|  [Skriv ett meddelande...]        [➤]   |
+------------------------------------------+
```

**Stängd knapp:**

```css
.bobot-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), #C4613D);
  box-shadow: 
    var(--shadow-lg),
    0 0 0 0 rgba(217, 119, 87, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bobot-trigger:hover {
  transform: scale(1.05);
  box-shadow: 
    var(--shadow-lg),
    0 0 0 8px rgba(217, 119, 87, 0.15);
}

/* Subtle pulse animation when idle */
@keyframes pulse {
  0%, 100% { box-shadow: var(--shadow-lg), 0 0 0 0 rgba(217, 119, 87, 0.4); }
  50% { box-shadow: var(--shadow-lg), 0 0 0 12px rgba(217, 119, 87, 0); }
}
```

**Öppen widget:**

```css
.bobot-widget {
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  
  /* Glassmorphism touch */
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

/* Öppningsanimation */
.bobot-widget-enter {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Header:**

```css
.bobot-header {
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.bobot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), #C4613D);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bobot-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-base);
}

.bobot-status {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

**Meddelanden:**

```css
.message {
  max-width: 85%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  animation: messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.message-user {
  background: var(--bg-chat-user);
  color: var(--text-primary);
  margin-left: auto;
  border-bottom-right-radius: var(--radius-sm);
}

.message-bot {
  background: var(--bg-chat-bot);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-bottom-left-radius: var(--radius-sm);
}
```

**Typing indicator:**

```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--space-3) var(--space-4);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { 
    transform: translateY(0);
    opacity: 0.4;
  }
  30% { 
    transform: translateY(-4px);
    opacity: 1;
  }
}
```

**Input:**

```css
.bobot-input-container {
  padding: var(--space-3);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-subtle);
}

.bobot-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.bobot-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.bobot-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: var(--text-inverse);
  transition: all 0.2s ease;
}

.bobot-send:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.bobot-send:active {
  transform: scale(0.95);
}
```

---

### 3.5 Admin-panel design

**Layout:**

```
+--------+--------------------------------------------------+
|        |  Header                                [Avatar]  |
|  Logo  +--------------------------------------------------+
|        |                                                  |
|  Nav   |  Page Title                                      |
|        |  Subtitle text here                              |
|  ----  |                                                  |
|        |  +--------------------------------------------+  |
|  📊    |  |                                            |  |
|  💬    |  |  Content Card                              |  |
|  📈    |  |                                            |  |
|  ⚙️    |  +--------------------------------------------+  |
|        |                                                  |
+--------+--------------------------------------------------+
```

**Sidebar:**

```css
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-logo {
  padding: var(--space-4) var(--space-3);
  margin-bottom: var(--space-4);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--accent-soft);
  color: var(--accent-primary);
}
```

**Kort:**

```css
.card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

**Knappar:**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
```

**Inputs:**

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:hover {
  border-color: var(--text-tertiary);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
```

**Tabell:**

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-subtle);
}

.table td {
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
}

.table tr:hover td {
  background: var(--bg-secondary);
}
```

---

### 3.6 Animationer

**Principer:**
- Snabba och responsiva (150–300ms)
- Naturliga easings, aldrig linjära
- Subtila, aldrig distraherande
- Purposeful: animation ska kommunicera något

**Easings:**

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Snabb start, mjuk slut */
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);  /* Balanserad */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Studsig, lekfull */
```

**Vanliga animationer:**

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale in */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

/* Shimmer (för loading states) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Hover states:**

```css
/* Alla interaktiva element */
.interactive {
  transition: all 0.15s var(--ease-out);
}

/* Lift on hover */
.interactive:hover {
  transform: translateY(-1px);
}

/* Press effect */
.interactive:active {
  transform: translateY(0) scale(0.98);
}
```

---

### 3.7 Ikoner

**Stil:**
- Stroke-baserade (inte fyllda)
- 1.5px stroke width
- Rundade hörn och ändar
- Konsekvent storlek: 20x20px (default), 16x16px (small), 24x24px (large)

**Rekommenderat bibliotek:** Lucide Icons

```jsx
import { 
  MessageCircle,    // Chat
  Settings,         // Inställningar
  BarChart3,        // Statistik
  BookOpen,         // Kunskapsbas
  History,          // Historik
  Send,             // Skicka
  X,                // Stäng
  Minus,            // Minimera
  ChevronRight,     // Navigation
  Plus,             // Lägg till
  Trash2,           // Ta bort
  Edit3,            // Redigera
  Check,            // Bekräfta
  AlertCircle,      // Varning
  HelpCircle,       // Hjälp
} from 'lucide-react';
```

---

### 3.8 Responsivitet

**Breakpoints:**

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
```

**Beteende:**

| Viewport | Widget | Admin |
|----------|--------|-------|
| <640px | Fullskärm modal | Sidebar dold, hamburger-meny |
| 640–1024px | 90% width, centrerad | Kompakt sidebar (ikoner) |
| >1024px | 400x600px, hörn | Full sidebar |

**Mobil-specifikt:**
- Touch targets: minst 44x44px
- Swipe to close widget
- Native keyboard handling
- Safe area respect (iPhone notch)

---

### 3.9 Tillgänglighet

**Krav:**
- WCAG 2.1 AA-nivå
- Kontrastförhållande minst 4.5:1 (text), 3:1 (stora element)
- Fokussynlighet
- Tangentbordsnavigering
- Skärmläsarstöd

**Focus states:**

```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

**Reduced motion:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 3.10 Dark mode

**Implementation:**

```css
/* Automatisk baserat på system */
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme variables */
  }
}

/* Manuell toggle */
[data-theme="dark"] {
  /* Dark theme variables */
}
```

**Undvik:**
- Ren svart (#000) — använd varm svart (#161514)
- Ren vit text — använd off-white (#F5F5F4)
- Samma skuggor som light mode — minska opacity

---

### 3.11 Logotyp

**Bobot-ikon:**

En mjuk, avrundad pratbubbla med en subtil gradient och två prickar som ögon — vänlig, inte creepy.

```
   ╭──────────╮
   │  ●    ●  │
   │          │
   ╰──────────╯
       ╲
```

**Färg:**
- Primär: Gradient från #D97757 till #C4613D
- Enfärgad: #D97757
- Inverterad: Vit på mörk bakgrund

**Användning:**
- Min storlek: 24px
- Clear space: Minst 50% av logotypens bredd runt om
- Aldrig rotera, stretcha eller ändra färger utanför brand guidelines

---

## 4. Säkerhet — Backend

### 4.1 Autentisering

| Åtgärd | Implementation |
|--------|----------------|
| Lösenord | Hasha med bcrypt (minst 12 rounds) |
| Sessions | JWT med kort livstid (15 min access, 7 dagar refresh) |
| Logout | Invalidera refresh token i databas |
| Rate limiting | Max 5 inloggningsförsök per 15 min |
| Brute force | Lås konto efter 10 misslyckade försök |

### 4.2 API-säkerhet

| Åtgärd | Implementation |
|--------|----------------|
| HTTPS | Obligatoriskt, ingen HTTP |
| CORS | Strikt, bara tillåtna domäner |
| API-nycklar | Per kund, hashas i databas |
| Rate limiting | 100 requests/min för chat, 1000/min för admin |
| Input validation | Validera all input, max längd på meddelanden |
| SQL injection | Använd ORM (SQLAlchemy), aldrig raw queries |
| XSS | Sanitize all output |

### 4.3 Data och GDPR

| Åtgärd | Implementation |
|--------|----------------|
| Dataminimering | Spara bara det nödvändiga |
| Kryptering i vila | Kryptera databas (AES-256) |
| Kryptering i transit | TLS 1.3 |
| Loggar | Inga personuppgifter i loggar |
| Radering | Endpoint för komplett radering per användare |
| Retention | Auto-radera konversationer efter 30 dagar (konfigurerbart) |
| Backup | Krypterade backups, samma retention |
| DPA | Personuppgiftsbiträdesavtal med varje kund |

### 4.4 Multi-tenant isolation

| Åtgärd | Implementation |
|--------|----------------|
| Databasschema | Varje kund har tenant_id på all data |
| Queries | Alla queries filtrerar på tenant_id |
| Middleware | Extrahera tenant från JWT/API-nyckel |
| Validation | Dubbelkolla tenant-tillhörighet vid varje request |
| Tester | Automatiska tester för tenant-läckage |

### 4.5 Widget-säkerhet

| Åtgärd | Implementation |
|--------|----------------|
| Domänvalidering | Widget funkar bara på godkända domäner |
| API-nyckel | Publik nyckel i widget, begränsade rättigheter |
| Rate limiting | Per IP: 30 meddelanden/minut |
| Content length | Max 1000 tecken per meddelande |
| Sanitization | Rensa HTML/script från input |

### 4.6 AI-specifika risker

| Risk | Åtgärd |
|------|--------|
| Prompt injection | Systemprompt separerad, validera input |
| Data läckage | AI har bara tillgång till kundens data |
| Olämpligt innehåll | Moderation-lager eller filter |
| Hallucinationer | Tydlig fallback: "Jag är osäker, kontakta..." |

### 4.7 Infrastruktur

| Åtgärd | Implementation |
|--------|----------------|
| Brandvägg | Bara port 443 öppen |
| SSH | Nyckelbaserad, ingen root-login |
| Uppdateringar | Automatiska säkerhetspatchar |
| Övervakning | Alerts vid onormalt beteende |
| DDoS-skydd | Cloudflare eller liknande framför |
| Backups | Dagliga, testade, offsite |

### 4.8 Loggning och audit

| Vad loggas | Syfte |
|------------|-------|
| Inloggningar | Säkerhet |
| Misslyckade försök | Intrångsdetektering |
| Admin-ändringar | Audit trail |
| API-anrop (metadata) | Felsökning |
| Fel och exceptions | Debugging |

**Loggas INTE:**
- Lösenord
- Konversationsinnehåll i klartext
- Personuppgifter

---

## 5. Tech Stack — Rekommendation

### Backend
```
Språk:          Python 3.11+
Framework:      FastAPI
Databas:        PostgreSQL
ORM:            SQLAlchemy
Cache:          Redis
AI:             Ollama + Llama 3.1
Vektorsök:      Chroma eller pgvector
Auth:           python-jose (JWT)
Validation:     Pydantic
```

### Frontend (Admin)
```
Framework:      Next.js 14 eller React + Vite
Styling:        Tailwind CSS
Komponenter:    shadcn/ui
State:          Zustand eller React Query
Forms:          React Hook Form + Zod
```

### Widget
```
Framework:      Preact (liten bundle) eller vanilla JS
Styling:        CSS-in-JS eller inlined
Bundle size:    Max 50 KB gzipped
```

### Infrastruktur
```
Hosting:        GleSYS / Binero (Sverige)
Container:      Docker + Docker Compose
Reverse proxy:  Nginx eller Caddy
SSL:            Let's Encrypt
CI/CD:          GitHub Actions
Monitoring:     Uptime Kuma (self-hosted)
```

---

## 6. Databasschema (förenklat)

```sql
-- Kunder (tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    api_key_hash VARCHAR(255),
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Användare (admin-panel)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kunskapsbas
CREATE TABLE knowledge_items (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Konversationer
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    session_id VARCHAR(255),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Meddelanden
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20), -- 'user' eller 'assistant'
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Statistik (aggregerad, ej persondata)
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    date DATE,
    conversations_count INT,
    messages_count INT,
    unanswered_count INT
);
```

---

## 7. API-endpoints (MVP)

### Publikt (Widget)
```
POST /api/v1/chat
  Body: { "message": "...", "session_id": "..." }
  Headers: X-API-Key: <public_key>
  Response: { "reply": "...", "session_id": "..." }
```

### Admin (kräver auth)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

GET    /api/v1/knowledge
POST   /api/v1/knowledge
PUT    /api/v1/knowledge/:id
DELETE /api/v1/knowledge/:id

GET    /api/v1/stats/overview
GET    /api/v1/stats/top-questions
GET    /api/v1/stats/unanswered

GET    /api/v1/conversations
GET    /api/v1/conversations/:id
DELETE /api/v1/conversations/:id

GET    /api/v1/settings
PUT    /api/v1/settings
```

---

## 8. MVP — Prioritering

### Vecka 1–2: Backend
- [ ] Projektsetup (FastAPI, PostgreSQL, Docker)
- [ ] Tenant-modell
- [ ] Auth (login, JWT)
- [ ] Knowledge CRUD
- [ ] Chat-endpoint med Ollama

### Vecka 3–4: Admin-panel
- [ ] Login-sida
- [ ] Dashboard (enkel)
- [ ] Kunskapshantering (lägg till, redigera, ta bort)
- [ ] Inställningar (namn, färg, välkomstmeddelande)
- [ ] Widget-embed kod

### Vecka 5: Widget
- [ ] Grundläggande chatt-UI
- [ ] Koppling till backend
- [ ] Styling (anpassningsbar färg)
- [ ] Responsiv (mobil)

### Vecka 6: Polish
- [ ] Tester
- [ ] Dokumentation
- [ ] Deployment till svensk server
- [ ] Första demo till potentiell kund

---

## 9. Sammanfattning för Claude Code

**Projektnamn:** Bobot

**Vad det är:**
SaaS-plattform där fastighetsbolag bygger egen AI-chatbot. Kunden lägger in frågor/svar, widgeten svarar användare.

**Tech:**
- Backend: Python/FastAPI + PostgreSQL + Ollama
- Admin: Next.js + Tailwind
- Widget: Preact eller vanilla JS

**Börja med:**
1. Backend med auth och knowledge CRUD
2. Chat-endpoint som använder Ollama
3. Enkel admin-panel
4. Widget

**Säkerhet:**
- Multi-tenant med tenant_id på allt
- JWT-auth
- HTTPS only
- Input validation
- GDPR-compliant (radering, retention)

**Design:**
- Enkelt och rent
- Tailwind + shadcn/ui för admin
- Liten bundle för widget (<50 KB)
