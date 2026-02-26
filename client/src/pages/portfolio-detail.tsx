import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { PortfolioProject } from "@shared/schema";
import { useState } from "react";

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { lang, t } = useLanguage();

  const { data: project, isLoading, error } = useQuery<PortfolioProject>({
    queryKey: ["/api/portfolio", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 bg-zinc-800 mb-8" />
          <Skeleton className="w-full aspect-video rounded-md bg-zinc-800 mb-6" />
          <Skeleton className="h-10 w-96 bg-zinc-800 mb-4" />
          <Skeleton className="h-20 w-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{lang === "no" ? "Prosjekt ikke funnet" : "Project Not Found"}</h1>
          <Link href="/portfolio">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {ui("backTo", lang)} {ui("portfolio", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [project.coverImage, ...(project.images || [])];
  const title = t(project, "title");
  const description = t(project, "description");

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${title} | Max Flis & Bad AS`}
        description={t(project, "shortDescription")}
        canonical={`/portfolio/${project.slug}`}
        ogImage={project.coverImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": title,
          "description": t(project, "shortDescription"),
          "image": project.coverImage,
          "author": { "@type": "Organization", "name": "Max Flis & Bad AS" },
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/portfolio">
          <Button variant="ghost" className="text-zinc-400 mb-8 -ml-2" data-testid="button-back-portfolio">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {ui("backTo", lang)} {ui("portfolio", lang)}
          </Button>
        </Link>

        <div className="relative aspect-[16/9] rounded-md overflow-hidden mb-4 bg-zinc-900">
          <img src={allImages[selectedImage]} alt={title} className="w-full h-full object-cover" data-testid="img-project-main" />
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-zinc-800 hover:border-zinc-600"}`} data-testid={`button-thumbnail-${i}`}>
                <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="max-w-3xl">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">{t(project, "category")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="text-project-title">{title}</h1>
          <div className="prose prose-invert prose-zinc max-w-none">
            {description.split("\n\n").map((para, i) => (
              <p key={i} className="text-zinc-300 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-md p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{lang === "no" ? "Liker du det du ser?" : "Like What You See?"}</h3>
            <p className="text-zinc-400 mb-5">{lang === "no" ? "La oss skape noe vakkert for ditt rom også." : "Let us create something beautiful for your space too."}</p>
            <Link href="/#contact">
              <Button data-testid="button-project-contact">
                {ui("freeEstimate", lang)}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
