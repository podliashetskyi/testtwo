import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "no" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (item: Record<string, any>, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Language) || "no";
    }
    return "no";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const t = useCallback(
    (item: Record<string, any>, field: string): string => {
      const noKey = `${field}No`;
      const enKey = `${field}En`;
      if (lang === "en") {
        return item[enKey] || item[noKey] || "";
      }
      return item[noKey] || item[enKey] || "";
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export const uiText: Record<string, Record<Language, string>> = {
  home: { no: "Hjem", en: "Home" },
  portfolio: { no: "Portefølje", en: "Portfolio" },
  blog: { no: "Blogg", en: "Blog" },
  services: { no: "Tjenester", en: "Services" },
  contact: { no: "Kontakt", en: "Contact" },
  viewOurWork: { no: "Se vårt arbeid", en: "View Our Work" },
  freeEstimate: { no: "Gratis estimat", en: "Free Estimate" },
  featuredProjects: { no: "Utvalgte prosjekter", en: "Featured Projects" },
  viewAllProjects: { no: "Se alle prosjekter", en: "View All Projects" },
  ourServices: { no: "Våre tjenester", en: "Our Services" },
  viewAllServices: { no: "Se alle tjenester", en: "View All Services" },
  customerReviews: { no: "Kundevurderinger", en: "Customer Reviews" },
  getInTouch: { no: "Ta kontakt", en: "Get In Touch" },
  name: { no: "Navn", en: "Name" },
  email: { no: "E-post", en: "Email" },
  phone: { no: "Telefon", en: "Phone" },
  message: { no: "Melding", en: "Message" },
  send: { no: "Send melding", en: "Send Message" },
  sending: { no: "Sender...", en: "Sending..." },
  contactSuccess: { no: "Meldingen din er sendt!", en: "Your message has been sent!" },
  contactSuccessDesc: { no: "Vi tar kontakt med deg snart.", en: "We'll get back to you soon." },
  contactError: { no: "Kunne ikke sende melding", en: "Failed to send message" },
  readMore: { no: "Les mer", en: "Read More" },
  learnMore: { no: "Lær mer", en: "Learn More" },
  backTo: { no: "Tilbake til", en: "Back to" },
  allRightsReserved: { no: "Alle rettigheter reservert", en: "All rights reserved" },
  averageRating: { no: "Gjennomsnittlig vurdering", en: "Average Rating" },
  basedOnReviews: { no: "Basert på anmeldelser", en: "Based on reviews" },
  pageNotFound: { no: "Siden ble ikke funnet", en: "Page Not Found" },
  goHome: { no: "Gå til forsiden", en: "Go Home" },
  loading: { no: "Laster...", en: "Loading..." },
  category: { no: "Kategori", en: "Category" },
  featured: { no: "Utvalgt", en: "Featured" },
  gallery: { no: "Galleri", en: "Gallery" },
  publishedAt: { no: "Publisert", en: "Published" },
  address: { no: "Adresse", en: "Address" },
  businessHours: { no: "Åpningstider", en: "Business Hours" },
};

export function ui(key: string, lang: Language): string {
  return uiText[key]?.[lang] || key;
}
