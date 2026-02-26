import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { SiInstagram, SiFacebook } from "react-icons/si";
import { useLanguage, ui } from "@/lib/language";
import { useQuery } from "@tanstack/react-query";
import type { SiteSetting } from "@shared/schema";
import logoImg from "@assets/image_1771002504083.png";

function getSettingVal(settings: SiteSetting[] | undefined, key: string, lang: string): string {
  const s = settings?.find(s => s.key === key);
  if (!s) return "";
  return lang === "en" ? s.valueEn : s.valueNo;
}

export default function Footer() {
  const { lang } = useLanguage();
  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/settings"] });

  const businessName = getSettingVal(settings, "business_name", lang);
  const phone = getSettingVal(settings, "phone", lang);
  const email = getSettingVal(settings, "email", lang);
  const address = getSettingVal(settings, "address", lang);
  const instagramUrl = getSettingVal(settings, "instagram_url", lang);
  const facebookUrl = getSettingVal(settings, "facebook_url", lang);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <img src={logoImg} alt={businessName || "Max Flis & Bad AS"} className="h-10" />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {lang === "no"
                ? "Profesjonell flislegging for kjøkken, bad og mer. Vi forvandler rom med presisjonshåndverk."
                : "Professional tile installation for kitchens, bathrooms, and more. Transforming spaces with precision craftsmanship."}
            </p>
            <div className="flex gap-3 mt-5">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors hover:text-primary hover:bg-zinc-700" data-testid="link-social-instagram">
                  <SiInstagram className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors hover:text-primary hover:bg-zinc-700" data-testid="link-social-facebook">
                  <SiFacebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{lang === "no" ? "Hurtiglenker" : "Quick Links"}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-zinc-400 text-sm hover:text-primary transition-colors">{ui("home", lang)}</Link></li>
              <li><Link href="/services" className="text-zinc-400 text-sm hover:text-primary transition-colors">{ui("services", lang)}</Link></li>
              <li><Link href="/portfolio" className="text-zinc-400 text-sm hover:text-primary transition-colors">{ui("portfolio", lang)}</Link></li>
              <li><Link href="/blog" className="text-zinc-400 text-sm hover:text-primary transition-colors">{ui("blog", lang)}</Link></li>
              <li><Link href="/#contact" className="text-zinc-400 text-sm hover:text-primary transition-colors">{ui("contact", lang)}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{ui("services", lang)}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/services/kitchen-tiling" className="text-zinc-400 text-sm hover:text-primary transition-colors">{lang === "no" ? "Kjøkkenflislegging" : "Kitchen Tiling"}</Link></li>
              <li><Link href="/services/bathroom-renovation" className="text-zinc-400 text-sm hover:text-primary transition-colors">{lang === "no" ? "Baderomoppussing" : "Bathroom Renovation"}</Link></li>
              <li><Link href="/services/floor-tiling" className="text-zinc-400 text-sm hover:text-primary transition-colors">{lang === "no" ? "Gulvflislegging" : "Floor Tiling"}</Link></li>
              <li><Link href="/services/outdoor-tiling" className="text-zinc-400 text-sm hover:text-primary transition-colors">{lang === "no" ? "Utendørs flislegging" : "Outdoor Tiling"}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{lang === "no" ? "Kontaktinfo" : "Contact Info"}</h3>
            <ul className="space-y-3">
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-zinc-400 text-sm hover:text-primary transition-colors">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <a href={`mailto:${email}`} className="text-zinc-400 text-sm hover:text-primary transition-colors">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-zinc-400 text-sm">{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">&copy; {new Date().getFullYear()} {businessName || "Max Flis & Bad AS"}. {ui("allRightsReserved", lang)}.</p>
        </div>
      </div>
    </footer>
  );
}
