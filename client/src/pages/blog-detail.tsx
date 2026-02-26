import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { BlogPost } from "@shared/schema";

function formatDate(dateStr: string | Date | null, lang: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "no" ? "nb-NO" : "en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{lang === "no" ? "Innlegg ikke funnet" : "Post Not Found"}</h1>
          <Link href="/blog">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> {ui("backTo", lang)} {ui("blog", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = t(post, "title");
  const content = t(post, "content");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": t(post, "excerpt"),
    "image": post.coverImage,
    "datePublished": post.publishedAt,
    "author": { "@type": "Organization", "name": "Max Flis & Bad AS" },
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO
        title={`${title} | Max Flis & Bad AS`}
        description={t(post, "excerpt")}
        canonical={`/blog/${post.slug}`}
        ogImage={post.coverImage}
        ogType="article"
        jsonLd={jsonLd}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog">
          <Button variant="ghost" className="text-zinc-400 mb-8 -ml-2" data-testid="button-back-blog">
            <ArrowLeft className="w-4 h-4 mr-2" /> {ui("backTo", lang)} {ui("blog", lang)}
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{t(post, "category")}</Badge>
          <span className="flex items-center gap-1 text-zinc-500 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.publishedAt, lang)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight" data-testid="text-blog-post-title">{title}</h1>

        <div className="relative aspect-video rounded-md overflow-hidden mb-10 bg-zinc-900">
          <img src={post.coverImage} alt={title} className="w-full h-full object-cover" data-testid="img-blog-cover" />
        </div>

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
            <h3 className="text-xl font-bold text-white mb-2">{lang === "no" ? "Trenger du profesjonell flislegging?" : "Need Professional Tile Installation?"}</h3>
            <p className="text-zinc-400 mb-5">{lang === "no" ? "Kontakt oss i dag for en gratis konsultasjon." : "Contact us today for a free consultation."}</p>
            <Link href="/#contact">
              <Button data-testid="button-blog-contact">
                {ui("getInTouch", lang)} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
