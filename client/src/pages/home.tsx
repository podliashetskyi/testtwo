import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, ArrowRight, Award, Send, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useMemo } from "react";
import { useLanguage, ui } from "@/lib/language";
import SEO from "@/components/seo";
import type { PortfolioProject, Service, Review, HeroContent, SiteSetting } from "@shared/schema";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getVal(settings: SiteSetting[] | undefined, key: string, lang: string): string {
  const s = settings?.find(s => s.key === key);
  if (!s) return "";
  return lang === "en" ? s.valueEn : s.valueNo;
}

const contactSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  message: z.string().min(1, "Required"),
});

type ContactForm = z.infer<typeof contactSchema>;

function HeroSection() {
  const { lang, t } = useLanguage();
  const { data: hero } = useQuery<HeroContent>({ queryKey: ["/api/hero", "home"] });

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      <div className="absolute inset-0">
        <img src="/images/hero-tile-work.png" alt="Professional tile installation" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-zinc-950/40" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          {hero && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">{t(hero, "subtitle")}</span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" data-testid="text-hero-title">
            {hero ? t(hero, "title") : (lang === "no" ? "Ekspert flislegging" : "Expert Tile Installation")}
          </h1>
          {hero && (
            <p className="text-lg text-zinc-300 leading-relaxed mb-8 max-w-lg">
              {t(hero, "description")}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link href="/portfolio">
              <Button size="lg" data-testid="button-view-work">
                {ui("viewOurWork", lang)}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#contact">
              <Button size="lg" variant="outline" className="border-zinc-600 text-white backdrop-blur-sm" data-testid="button-free-estimate">
                {ui("freeEstimate", lang)}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { lang, t } = useLanguage();
  const { data: allServices, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services/featured"] });
  const displayServices = useMemo(() => shuffle(allServices || []).slice(0, 4), [allServices]);

  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{lang === "no" ? "Hva vi gjør" : "What We Do"}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">{ui("ourServices", lang)}</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 bg-zinc-800 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayServices.map((svc) => (
              <Link key={svc.id} href={`/services/${svc.slug}`}>
                <Card className="bg-zinc-900 border-zinc-800 p-6 group cursor-pointer h-full" data-testid={`card-service-${svc.id}`}>
                  {svc.image && (
                    <div className="aspect-[16/9] rounded-md overflow-hidden mb-4">
                      <img src={svc.image} alt={t(svc, "title")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{t(svc, "title")}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t(svc, "excerpt")}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              {ui("viewAllServices", lang)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PortfolioPreview() {
  const { lang, t } = useLanguage();
  const { data: projects, isLoading } = useQuery<PortfolioProject[]>({ queryKey: ["/api/portfolio/featured"] });
  const displayProjects = useMemo(() => shuffle(projects || []).slice(0, 4), [projects]);

  return (
    <section className="py-20 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{lang === "no" ? "Vårt arbeid" : "Our Work"}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">{ui("featuredProjects", lang)}</h2>
          </div>
          <Link href="/portfolio">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" data-testid="button-view-all-projects">
              {ui("viewAllProjects", lang)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[4/3] rounded-md bg-zinc-800" />
                <Skeleton className="h-5 w-3/4 bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProjects.map((project) => (
              <Link key={project.id} href={`/portfolio/${project.slug}`}>
                <Card className="bg-zinc-800/50 border-zinc-700/50 group cursor-pointer" data-testid={`card-project-${project.id}`}>
                  <div className="relative aspect-[4/3] rounded-t-md overflow-hidden">
                    <img src={project.coverImage} alt={t(project, "title")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <span className="text-primary text-xs font-medium uppercase tracking-wider">{t(project, "category")}</span>
                    <h3 className="text-white font-semibold mt-1 group-hover:text-primary transition-colors">{t(project, "title")}</h3>
                    <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{t(project, "shortDescription")}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { lang, t } = useLanguage();
  const { data: allReviews } = useQuery<Review[]>({ queryKey: ["/api/reviews/featured"] });
  const displayReviews = useMemo(() => shuffle(allReviews || []).slice(0, 3), [allReviews]);
  const avgRating = allReviews && allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : "5.0";

  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{lang === "no" ? "Anmeldelser" : "Testimonials"}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">{ui("customerReviews", lang)}</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-white font-semibold text-lg">{avgRating}</span>
            <span className="text-zinc-400 text-sm">{ui("averageRating", lang)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <Card key={review.id} className="bg-zinc-900 border-zinc-800 p-6" data-testid={`card-review-${review.id}`}>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
                {Array.from({ length: 5 - review.rating }).map((_, i) => (
                  <Star key={`e${i}`} className="w-4 h-4 text-zinc-700" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-4">{t(review, "text")}</p>
              <p className="text-white font-medium text-sm">{review.authorName}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/settings"] });

  const phone = getVal(settings, "phone", lang);
  const email = getVal(settings, "email", lang);
  const hours = getVal(settings, "business_hours", lang);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({ title: ui("contactSuccess", lang), description: ui("contactSuccessDesc", lang) });
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: ui("contactError", lang), description: error.message, variant: "destructive" });
    },
  });

  return (
    <section id="contact" className="py-20 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{ui("getInTouch", lang)}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              {lang === "no" ? "Be om gratis estimat" : "Request a Free Estimate"}
            </h2>
            <p className="text-zinc-400 mt-4 leading-relaxed">
              {lang === "no" ? "Klar til å forvandle rommet ditt? Fyll ut skjemaet, så tar vi kontakt innen 24 timer." : "Ready to transform your space? Fill out the form and we'll get back to you within 24 hours."}
            </p>
            <div className="mt-8 space-y-5">
              {phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">{lang === "no" ? "Ring oss" : "Call Us"}</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-white font-medium">{phone}</a>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">{lang === "no" ? "E-post" : "Email Us"}</p>
                    <a href={`mailto:${email}`} className="text-white font-medium">{email}</a>
                  </div>
                </div>
              )}
              {hours && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">{ui("businessHours", lang)}</p>
                    <p className="text-white font-medium">{hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Card className="bg-zinc-800/50 border-zinc-700/50 p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5" data-testid="form-contact">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">{ui("name", lang)}</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" data-testid="input-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">{ui("email", lang)}</FormLabel>
                      <FormControl>
                        <Input type="email" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" data-testid="input-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">{ui("phone", lang)} ({lang === "no" ? "valgfritt" : "optional"})</FormLabel>
                      <FormControl>
                        <Input type="tel" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" data-testid="input-phone" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">{ui("message", lang)}</FormLabel>
                    <FormControl>
                      <Textarea rows={5} className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 resize-none" data-testid="input-message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-contact">
                  {mutation.isPending ? ui("sending", lang) : (
                    <>{ui("send", lang)}<Send className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { lang } = useLanguage();
  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/settings"] });
  const metaDesc = getVal(settings, "meta_description", lang);

  useEffect(() => {
    if (window.location.hash === "#contact") {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Max Flis & Bad AS",
    "description": metaDesc || "Professional tile installation services",
    "url": window.location.origin,
    "telephone": getVal(settings, "phone", lang),
    "email": getVal(settings, "email", lang),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": getVal(settings, "address", lang),
    },
  };

  return (
    <div>
      <SEO
        title={`Max Flis & Bad AS - ${lang === "no" ? "Profesjonell flislegging" : "Professional Tile Installation"}`}
        description={metaDesc || "Professional tile installation services"}
        canonical="/"
        jsonLd={jsonLd}
      />
      <HeroSection />
      <ServicesSection />
      <PortfolioPreview />
      <ReviewsSection />
      <ContactSection />
    </div>
  );
}
