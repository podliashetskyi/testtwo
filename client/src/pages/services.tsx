import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { Service, HeroContent } from "@shared/schema";

export default function Services() {
  const { lang, t } = useLanguage();
  const { data: allServices, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: hero } = useQuery<HeroContent>({ queryKey: ["/api/hero", "services"] });

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${hero ? t(hero, "title") : ui("services", lang)} | Max Flis & Bad AS`}
        description={hero ? t(hero, "description") : ""}
        canonical="/services"
      />
      <section className="relative py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{ui("services", lang)}</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2" data-testid="text-services-title">
              {hero ? t(hero, "title") : ui("services", lang)}
            </h1>
            {hero && <p className="text-zinc-400 mt-4 leading-relaxed">{t(hero, "description")}</p>}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 bg-zinc-800 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allServices?.map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`}>
                  <Card className="bg-zinc-900 border-zinc-800 group cursor-pointer h-full" data-testid={`card-service-${service.id}`}>
                    {service.image && (
                      <div className="relative aspect-video rounded-t-md overflow-hidden">
                        <img src={service.image} alt={t(service, "title")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{t(service, "title")}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{t(service, "excerpt")}</p>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mt-4">
                        {ui("learnMore", lang)} <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
