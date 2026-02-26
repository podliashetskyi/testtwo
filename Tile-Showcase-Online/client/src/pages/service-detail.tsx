import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { Service } from "@shared/schema";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();

  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: ["/api/services", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 bg-zinc-800 mb-8" />
          <Skeleton className="w-full aspect-video rounded-md bg-zinc-800 mb-6" />
          <Skeleton className="h-10 w-96 bg-zinc-800 mb-4" />
          <Skeleton className="h-40 w-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{lang === "no" ? "Tjeneste ikke funnet" : "Service Not Found"}</h1>
          <Link href="/services">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> {ui("backTo", lang)} {ui("services", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = t(service, "title");
  const content = t(service, "content");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": title,
    "description": t(service, "excerpt"),
    "provider": { "@type": "Organization", "name": "Max Flis & Bad AS" },
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${title} | Max Flis & Bad AS`}
        description={t(service, "excerpt")}
        canonical={`/services/${service.slug}`}
        ogImage={service.image || undefined}
        jsonLd={jsonLd}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/services">
          <Button variant="ghost" className="text-zinc-400 mb-8 -ml-2" data-testid="button-back-services">
            <ArrowLeft className="w-4 h-4 mr-2" /> {ui("backTo", lang)} {ui("services", lang)}
          </Button>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6" data-testid="text-service-title">{title}</h1>

        {service.image && (
          <div className="relative aspect-video rounded-md overflow-hidden mb-10 bg-zinc-900">
            <img src={service.image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-invert prose-zinc max-w-none">
          {content.split("\n\n").map((block, i) => {
            if (block.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{block.replace("## ", "")}</h2>;
            if (block.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-white mt-8 mb-3">{block.replace("### ", "")}</h3>;
            if (block.startsWith("- ")) {
              const items = block.split("\n").filter(line => line.startsWith("- "));
              return <ul key={i} className="list-disc list-inside space-y-2 my-4">{items.map((item, j) => <li key={j} className="text-zinc-300">{item.replace("- ", "")}</li>)}</ul>;
            }
            return <p key={i} className="text-zinc-300 leading-relaxed mb-4">{block}</p>;
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-md p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{lang === "no" ? "Interessert i denne tjenesten?" : "Interested in This Service?"}</h3>
            <p className="text-zinc-400 mb-5">{lang === "no" ? "Kontakt oss for et uforpliktende tilbud." : "Contact us for a free estimate."}</p>
            <Link href="/#contact">
              <Button data-testid="button-service-contact">
                {ui("freeEstimate", lang)} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
