import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, ui } from "@/lib/language";
import { useQuery } from "@tanstack/react-query";
import type { SiteSetting } from "@shared/schema";
import logoImg from "@assets/image_1771002504083.png";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/settings"] });
  const phoneSetting = settings?.find(s => s.key === "phone");
  const phone = phoneSetting ? (lang === "en" ? phoneSetting.valueEn : phoneSetting.valueNo) : "";

  const navLinks = [
    { label: ui("home", lang), path: "/" },
    { label: ui("services", lang), path: "/services" },
    { label: ui("portfolio", lang), path: "/portfolio" },
    { label: ui("blog", lang), path: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link href="/" className="flex items-center" data-testid="link-logo">
            <img src={logoImg} alt="Max Flis&Bad AS" className="h-10" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.path
                      ? "text-primary"
                      : "text-zinc-300 hover:text-white"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "no" ? "en" : "no")}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-primary text-sm transition-colors"
              data-testid="button-language-switch"
            >
              <Globe className="w-4 h-4" />
              {lang === "no" ? "EN" : "NO"}
            </button>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-zinc-300 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                {phone}
              </a>
            )}
            <Link href="/#contact">
              <Button size="sm" data-testid="button-get-quote">
                {lang === "no" ? "Få et tilbud" : "Get a Quote"}
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-zinc-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 pb-4">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} onClick={() => setMobileOpen(false)}>
              <span
                className={`block px-3 py-3 rounded-md text-sm font-medium cursor-pointer ${
                  location === link.path
                    ? "text-primary bg-zinc-900"
                    : "text-zinc-300"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => setLang(lang === "no" ? "en" : "no")}
              className="flex items-center gap-2 text-zinc-300 text-sm px-3"
              data-testid="button-language-switch-mobile"
            >
              <Globe className="w-4 h-4 text-primary" />
              {lang === "no" ? "Switch to English" : "Bytt til norsk"}
            </button>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-zinc-300 text-sm px-3">
                <Phone className="w-4 h-4 text-primary" />
                {phone}
              </a>
            )}
            <Link href="/#contact" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full" data-testid="button-get-quote-mobile">
                {lang === "no" ? "Få et tilbud" : "Get a Quote"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
