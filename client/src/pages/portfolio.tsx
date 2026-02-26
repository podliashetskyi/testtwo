import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { PortfolioProject, HeroContent } from "@shared/schema";

export default function Portfolio() {
  const { lang, t } = useLanguage();
  const { data: projects, isLoading } = useQuery<PortfolioProject[]>({ queryKey: ["/api/portfolio"] });
  const { data: hero } = useQuery<HeroContent>({ queryKey: ["/api/hero", "portfolio"] });

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${hero ? t(hero, "title") : ui("portfolio", lang)} | Max Flis & Bad AS`}
        description={hero ? t(hero, "description") : ""}
        canonical="/portfolio"
      />
      <section className="relative py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{ui("portfolio", lang)}</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2" data-testid="text-portfolio-title">
              {hero ? t(hero, "title") : ui("portfolio", lang)}
            </h1>
            {hero && <p className="text-zinc-400 mt-4 leading-relaxed">{t(hero, "description")}</p>}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-[4/3] rounded-md bg-zinc-800" />
                  <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects?.map((project) => (
                <Link key={project.id} href={`/portfolio/${project.slug}`}>
                  <Card className="bg-zinc-900 border-zinc-800 group cursor-pointer h-full" data-testid={`card-portfolio-${project.id}`}>
                    <div className="relative aspect-[4/3] rounded-t-md overflow-hidden">
                      <img src={project.coverImage} alt={t(project, "title")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-3">{t(project, "category")}</Badge>
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{t(project, "title")}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{t(project, "shortDescription")}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === "no" ? "Klar til å starte prosjektet ditt?" : "Ready to Start Your Project?"}
          </h2>
          <p className="text-zinc-400 mt-3 mb-6">{lang === "no" ? "Kontakt oss for en gratis konsultasjon." : "Get in touch for a free consultation."}</p>
          <Link href="/#contact">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-colors" data-testid="button-portfolio-contact">
              {lang === "no" ? "Få et tilbud" : "Request a Quote"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
