import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { BlogPost, HeroContent } from "@shared/schema";

function formatDate(dateStr: string | Date | null, lang: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "no" ? "nb-NO" : "en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Blog() {
  const { lang, t } = useLanguage();
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const { data: hero } = useQuery<HeroContent>({ queryKey: ["/api/hero", "blog"] });

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${hero ? t(hero, "title") : ui("blog", lang)} | Max Flis & Bad AS`}
        description={hero ? t(hero, "description") : ""}
        canonical="/blog"
      />
      <section className="relative py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{ui("blog", lang)}</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2" data-testid="text-blog-title">
              {hero ? t(hero, "title") : ui("blog", lang)}
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
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-md bg-zinc-800" />
                  <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="bg-zinc-900 border-zinc-800 group cursor-pointer h-full" data-testid={`card-blog-${post.id}`}>
                    <div className="relative aspect-video rounded-t-md overflow-hidden">
                      <img src={post.coverImage} alt={t(post, "title")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{t(post, "category")}</Badge>
                        <span className="flex items-center gap-1 text-zinc-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedAt, lang)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{t(post, "title")}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{t(post, "excerpt")}</p>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mt-4">
                        {ui("readMore", lang)} <ArrowRight className="w-3.5 h-3.5" />
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
