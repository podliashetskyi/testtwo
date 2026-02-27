import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard, Image, FileText, Mail, LogOut, Plus, Pencil, Trash2,
  ArrowLeft, Save, Eye, Star, Wrench, MessageSquare, Type, Settings,
  Upload, X, CheckCircle, AlertCircle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";
import type {
  PortfolioProject, BlogPost, ContactSubmission,
  Service, Review, HeroContent, SiteSetting,
} from "@shared/schema";

const MAX = { title: 100, subtitle: 120, slug: 80, category: 50, excerpt: 200, author: 80 };
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const editBtnClass = "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20";
const deleteBtnClass = "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300";

type AdminView =
  | "dashboard"
  | "portfolio" | "portfolio-new" | "portfolio-edit"
  | "blog" | "blog-new" | "blog-edit"
  | "services" | "services-new" | "services-edit"
  | "reviews" | "reviews-new" | "reviews-edit"
  | "hero" | "hero-edit"
  | "settings"
  | "contacts";

function autoSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const near = len >= max * 0.8;
  const over = len > max;
  if (!near) return null;
  return (
    <span className={`text-xs ${over ? "text-red-400 font-medium" : "text-zinc-500"}`}>
      {len}/{max}
    </span>
  );
}

function ImageUploader({ value, onChange, testId, label }: {
  value: string; onChange: (v: string) => void; testId: string; label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setError("");
    setSuccess("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only .jpg, .png, and .webp files are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(data.message);
      }
      const data = await res.json();
      onChange(data.url);
      setSuccess("Image uploaded");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  }, [doUpload]);

  return (
    <div>
      <label className="text-zinc-300 text-sm font-medium block mb-2">{label}</label>
      <div className="space-y-2">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-zinc-700 hover:border-zinc-500"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          data-testid={`${testId}-dropzone`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = ""; }}
            data-testid={`${testId}-file`}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-zinc-400 py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-1">
              <Upload className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-400 text-sm">Drop image here or click to browse</span>
              <span className="text-zinc-600 text-xs">JPG, PNG, WebP up to 5MB</span>
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => { onChange(e.target.value); setError(""); setSuccess(""); }}
            placeholder="Or paste image URL"
            className="bg-zinc-800 border-zinc-700 text-white text-sm"
            data-testid={testId}
          />
          {value && (
            <Button type="button" size="sm" variant="ghost" className="text-zinc-500 hover:text-zinc-300 shrink-0 px-2" onClick={() => onChange("")}>
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {value && (
          <img src={value} alt="Preview" className="h-16 w-auto rounded-md object-cover border border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
      </div>
    </div>
  );
}

function BilingualInput({ label, valueNo, valueEn, onChangeNo, onChangeEn, testIdPrefix, maxLen }: {
  label: string; valueNo: string; valueEn: string;
  onChangeNo: (v: string) => void; onChangeEn: (v: string) => void;
  testIdPrefix: string; maxLen?: number;
}) {
  return (
    <div>
      <label className="text-zinc-300 text-sm font-medium block mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs">Norsk</span>
            {maxLen && <CharCount value={valueNo} max={maxLen} />}
          </div>
          <Input value={valueNo} onChange={(e) => onChangeNo(maxLen ? e.target.value.slice(0, maxLen) : e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" data-testid={`${testIdPrefix}-no`} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs">English</span>
            {maxLen && <CharCount value={valueEn} max={maxLen} />}
          </div>
          <Input value={valueEn} onChange={(e) => onChangeEn(maxLen ? e.target.value.slice(0, maxLen) : e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" data-testid={`${testIdPrefix}-en`} />
        </div>
      </div>
    </div>
  );
}

function BilingualTextarea({ label, valueNo, valueEn, onChangeNo, onChangeEn, rows = 5, testIdPrefix, hint, maxLen }: {
  label: string; valueNo: string; valueEn: string;
  onChangeNo: (v: string) => void; onChangeEn: (v: string) => void;
  rows?: number; testIdPrefix: string; hint?: string; maxLen?: number;
}) {
  return (
    <div>
      <label className="text-zinc-300 text-sm font-medium block mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs">Norsk</span>
            {maxLen && <CharCount value={valueNo} max={maxLen} />}
          </div>
          <Textarea value={valueNo} onChange={(e) => onChangeNo(maxLen ? e.target.value.slice(0, maxLen) : e.target.value)} rows={rows} className="bg-zinc-800 border-zinc-700 text-white resize-none" data-testid={`${testIdPrefix}-no`} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs">English</span>
            {maxLen && <CharCount value={valueEn} max={maxLen} />}
          </div>
          <Textarea value={valueEn} onChange={(e) => onChangeEn(maxLen ? e.target.value.slice(0, maxLen) : e.target.value)} rows={rows} className="bg-zinc-800 border-zinc-700 text-white resize-none" data-testid={`${testIdPrefix}-en`} />
        </div>
      </div>
      {hint && <p className="text-zinc-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [view, setView] = useState<AdminView>("dashboard");
  const [editId, setEditId] = useState<number | null>(null);

  const { data: authData, isLoading: authLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/me"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!authLoading && !authData?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [authData, authLoading, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/admin/logout"); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      setLocation("/admin/login");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Skeleton className="h-10 w-40 bg-zinc-800" />
      </div>
    );
  }

  if (!authData?.isAdmin) return null;

  const navItems: { id: AdminView; label: string; icon: any; match?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Portfolio", icon: Image, match: "portfolio" },
    { id: "blog", label: "Blog Posts", icon: FileText, match: "blog" },
    { id: "services", label: "Services", icon: Wrench, match: "services" },
    { id: "reviews", label: "Reviews", icon: MessageSquare, match: "reviews" },
    { id: "hero", label: "Hero Content", icon: Type, match: "hero" },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "contacts", label: "Messages", icon: Mail },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.match) return view.startsWith(item.match);
    return view === item.id;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <SEO title="Admin Panel | Max Flis & Bad AS" description="Admin panel" noindex />
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col shrink-0">
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg">Admin Panel</h2>
          <p className="text-zinc-500 text-xs mt-1">Manage your website</p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setEditId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive(item) ? "bg-primary/10 text-primary" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              data-testid={`nav-admin-${item.id}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-zinc-800 pt-4 space-y-2">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <Eye className="w-4 h-4" /> View Site
            </button>
          </Link>
          <button onClick={() => logoutMutation.mutate()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors" data-testid="button-admin-logout">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {view === "dashboard" && <DashboardView />}
        {view === "portfolio" && <PortfolioListView onNew={() => setView("portfolio-new")} onEdit={(id) => { setEditId(id); setView("portfolio-edit"); }} />}
        {view === "portfolio-new" && <PortfolioFormView onBack={() => setView("portfolio")} />}
        {view === "portfolio-edit" && editId && <PortfolioFormView id={editId} onBack={() => setView("portfolio")} />}
        {view === "blog" && <BlogListView onNew={() => setView("blog-new")} onEdit={(id) => { setEditId(id); setView("blog-edit"); }} />}
        {view === "blog-new" && <BlogFormView onBack={() => setView("blog")} />}
        {view === "blog-edit" && editId && <BlogFormView id={editId} onBack={() => setView("blog")} />}
        {view === "services" && <ServicesListView onNew={() => setView("services-new")} onEdit={(id) => { setEditId(id); setView("services-edit"); }} />}
        {view === "services-new" && <ServiceFormView onBack={() => setView("services")} />}
        {view === "services-edit" && editId && <ServiceFormView id={editId} onBack={() => setView("services")} />}
        {view === "reviews" && <ReviewsListView onNew={() => setView("reviews-new")} onEdit={(id) => { setEditId(id); setView("reviews-edit"); }} />}
        {view === "reviews-new" && <ReviewFormView onBack={() => setView("reviews")} />}
        {view === "reviews-edit" && editId && <ReviewFormView id={editId} onBack={() => setView("reviews")} />}
        {view === "hero" && <HeroListView onEdit={(id) => { setEditId(id); setView("hero-edit"); }} />}
        {view === "hero-edit" && editId && <HeroFormView id={editId} onBack={() => setView("hero")} />}
        {view === "settings" && <SettingsView />}
        {view === "contacts" && <ContactsView />}
      </main>
    </div>
  );
}

function DashboardView() {
  const { data: projects } = useQuery<PortfolioProject[]>({ queryKey: ["/api/portfolio"] });
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const { data: allServices } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: allReviews } = useQuery<Review[]>({ queryKey: ["/api/reviews"] });
  const { data: contacts } = useQuery<ContactSubmission[]>({ queryKey: ["/api/admin/contacts"] });

  const stats = [
    { label: "Portfolio Projects", value: projects?.length ?? 0, icon: Image },
    { label: "Blog Posts", value: posts?.length ?? 0, icon: FileText },
    { label: "Services", value: allServices?.length ?? 0, icon: Wrench },
    { label: "Reviews", value: allReviews?.length ?? 0, icon: MessageSquare },
    { label: "Contact Messages", value: contacts?.length ?? 0, icon: Mail },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" data-testid="text-admin-dashboard">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-zinc-400 text-sm">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PortfolioListView({ onNew, onEdit }: { onNew: () => void; onEdit: (id: number) => void }) {
  const { toast } = useToast();
  const { data: projects, isLoading } = useQuery<PortfolioProject[]>({ queryKey: ["/api/portfolio"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/portfolio/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] }); toast({ title: "Project deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Portfolio Projects</h1>
        <Button onClick={onNew} data-testid="button-new-project"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {projects?.map((project) => (
            <Card key={project.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4" data-testid={`admin-project-${project.id}`}>
              <img src={project.coverImage} alt={project.titleNo} className="w-16 h-16 rounded-md object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{project.titleNo}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">{project.categoryNo}</Badge>
                  {project.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className={editBtnClass} onClick={() => onEdit(project.id)} data-testid={`button-edit-project-${project.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" className={deleteBtnClass} onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate(project.id); }} data-testid={`button-delete-project-${project.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioFormView({ id, onBack }: { id?: number; onBack: () => void }) {
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing } = useQuery<PortfolioProject[]>({ queryKey: ["/api/portfolio"], enabled: isEdit });
  const project = existing?.find((p) => p.id === id);

  const [form, setForm] = useState({
    titleNo: "", titleEn: "", slug: "",
    shortDescriptionNo: "", shortDescriptionEn: "",
    descriptionNo: "", descriptionEn: "",
    categoryNo: "", categoryEn: "",
    coverImage: "", images: "" as string, featured: false,
  });

  useEffect(() => {
    if (project) {
      setForm({
        titleNo: project.titleNo, titleEn: project.titleEn, slug: project.slug,
        shortDescriptionNo: project.shortDescriptionNo, shortDescriptionEn: project.shortDescriptionEn,
        descriptionNo: project.descriptionNo, descriptionEn: project.descriptionEn,
        categoryNo: project.categoryNo, categoryEn: project.categoryEn,
        coverImage: project.coverImage, images: (project.images || []).join(", "),
        featured: project.featured ?? false,
      });
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { ...form, images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [] };
      if (isEdit) await apiRequest("PUT", `/api/admin/portfolio/${id}`, body);
      else await apiRequest("POST", "/api/admin/portfolio", body);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] }); toast({ title: isEdit ? "Project updated" : "Project created" }); onBack(); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const f = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const addImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images}, ${url}` : url,
    }));
  };

  return (
    <div>
      <Button variant="ghost" className="text-zinc-400 mb-6 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio</Button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? "Edit Project" : "New Project"}</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-4xl">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5" data-testid="form-admin-portfolio">
          <BilingualInput label="Title" valueNo={form.titleNo} valueEn={form.titleEn} onChangeNo={(v) => { f("titleNo", v); if (!isEdit) f("slug", autoSlug(v)); }} onChangeEn={(v) => f("titleEn", v)} testIdPrefix="input-project-title" maxLen={MAX.title} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 text-sm font-medium">Slug</label>
              <CharCount value={form.slug} max={MAX.slug} />
            </div>
            <Input value={form.slug} onChange={(e) => f("slug", e.target.value.slice(0, MAX.slug))} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-project-slug" />
          </div>
          <BilingualInput label="Category" valueNo={form.categoryNo} valueEn={form.categoryEn} onChangeNo={(v) => f("categoryNo", v)} onChangeEn={(v) => f("categoryEn", v)} testIdPrefix="input-project-category" maxLen={MAX.category} />
          <BilingualTextarea label="Short Description" valueNo={form.shortDescriptionNo} valueEn={form.shortDescriptionEn} onChangeNo={(v) => f("shortDescriptionNo", v)} onChangeEn={(v) => f("shortDescriptionEn", v)} rows={3} testIdPrefix="input-project-short-desc" maxLen={MAX.excerpt} />
          <BilingualTextarea label="Full Description" valueNo={form.descriptionNo} valueEn={form.descriptionEn} onChangeNo={(v) => f("descriptionNo", v)} onChangeEn={(v) => f("descriptionEn", v)} rows={8} testIdPrefix="input-project-desc" />
          <ImageUploader value={form.coverImage} onChange={(v) => f("coverImage", v)} testId="input-project-cover" label="Cover Image" />
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Additional Images</label>
            <div className="space-y-2">
              <ImageUploader value="" onChange={addImage} testId="input-project-add-image" label="Upload Additional Image" />
              {form.images && (
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Current URLs (comma separated)</span>
                  <Textarea value={form.images} onChange={(e) => f("images", e.target.value)} rows={2} className="bg-zinc-800 border-zinc-700 text-white resize-none text-sm" data-testid="input-project-images" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700" data-testid="input-project-featured" />
            <label className="text-zinc-300 text-sm font-medium">Featured project (shown on homepage)</label>
          </div>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-project">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? "Saving..." : (isEdit ? "Update Project" : "Create Project")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function BlogListView({ onNew, onEdit }: { onNew: () => void; onEdit: (id: number) => void }) {
  const { toast } = useToast();
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/blog/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/blog"] }); toast({ title: "Post deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
        <Button onClick={onNew} data-testid="button-new-post"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => (
            <Card key={post.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4" data-testid={`admin-post-${post.id}`}>
              <img src={post.coverImage} alt={post.titleNo} className="w-16 h-16 rounded-md object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{post.titleNo}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs mt-1">{post.categoryNo}</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className={editBtnClass} onClick={() => onEdit(post.id)} data-testid={`button-edit-post-${post.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" className={deleteBtnClass} onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }} data-testid={`button-delete-post-${post.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogFormView({ id, onBack }: { id?: number; onBack: () => void }) {
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"], enabled: isEdit });
  const post = existing?.find((p) => p.id === id);

  const [form, setForm] = useState({
    titleNo: "", titleEn: "", slug: "",
    excerptNo: "", excerptEn: "",
    contentNo: "", contentEn: "",
    categoryNo: "", categoryEn: "",
    coverImage: "",
  });

  useEffect(() => {
    if (post) {
      setForm({
        titleNo: post.titleNo, titleEn: post.titleEn, slug: post.slug,
        excerptNo: post.excerptNo, excerptEn: post.excerptEn,
        contentNo: post.contentNo, contentEn: post.contentEn,
        categoryNo: post.categoryNo, categoryEn: post.categoryEn,
        coverImage: post.coverImage,
      });
    }
  }, [post]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) await apiRequest("PUT", `/api/admin/blog/${id}`, form);
      else await apiRequest("POST", "/api/admin/blog", form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/blog"] }); toast({ title: isEdit ? "Post updated" : "Post created" }); onBack(); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const f = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div>
      <Button variant="ghost" className="text-zinc-400 mb-6 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog</Button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? "Edit Post" : "New Post"}</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-4xl">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5" data-testid="form-admin-blog">
          <BilingualInput label="Title" valueNo={form.titleNo} valueEn={form.titleEn} onChangeNo={(v) => { f("titleNo", v); if (!isEdit) f("slug", autoSlug(v)); }} onChangeEn={(v) => f("titleEn", v)} testIdPrefix="input-post-title" maxLen={MAX.title} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 text-sm font-medium">Slug</label>
              <CharCount value={form.slug} max={MAX.slug} />
            </div>
            <Input value={form.slug} onChange={(e) => f("slug", e.target.value.slice(0, MAX.slug))} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-post-slug" />
          </div>
          <BilingualInput label="Category" valueNo={form.categoryNo} valueEn={form.categoryEn} onChangeNo={(v) => f("categoryNo", v)} onChangeEn={(v) => f("categoryEn", v)} testIdPrefix="input-post-category" maxLen={MAX.category} />
          <BilingualTextarea label="Excerpt" valueNo={form.excerptNo} valueEn={form.excerptEn} onChangeNo={(v) => f("excerptNo", v)} onChangeEn={(v) => f("excerptEn", v)} rows={3} testIdPrefix="input-post-excerpt" maxLen={MAX.excerpt} />
          <BilingualTextarea label="Content" valueNo={form.contentNo} valueEn={form.contentEn} onChangeNo={(v) => f("contentNo", v)} onChangeEn={(v) => f("contentEn", v)} rows={12} testIdPrefix="input-post-content" hint="Use ## for headings, - for bullet points. Separate paragraphs with blank lines." />
          <ImageUploader value={form.coverImage} onChange={(v) => f("coverImage", v)} testId="input-post-cover" label="Cover Image" />
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-post">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? "Saving..." : (isEdit ? "Update Post" : "Create Post")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function ServicesListView({ onNew, onEdit }: { onNew: () => void; onEdit: (id: number) => void }) {
  const { toast } = useToast();
  const { data: allServices, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/services/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/services"] }); toast({ title: "Service deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <Button onClick={onNew} data-testid="button-new-service"><Plus className="w-4 h-4 mr-2" /> New Service</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {allServices?.map((service) => (
            <Card key={service.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4" data-testid={`admin-service-${service.id}`}>
              {service.image && <img src={service.image} alt={service.titleNo} className="w-16 h-16 rounded-md object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{service.titleNo}</h3>
                {service.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs mt-1"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className={editBtnClass} onClick={() => onEdit(service.id)} data-testid={`button-edit-service-${service.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" className={deleteBtnClass} onClick={() => { if (confirm("Delete this service?")) deleteMutation.mutate(service.id); }} data-testid={`button-delete-service-${service.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceFormView({ id, onBack }: { id?: number; onBack: () => void }) {
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing } = useQuery<Service[]>({ queryKey: ["/api/services"], enabled: isEdit });
  const service = existing?.find((s) => s.id === id);

  const [form, setForm] = useState({
    titleNo: "", titleEn: "", slug: "",
    excerptNo: "", excerptEn: "",
    contentNo: "", contentEn: "",
    image: "", featured: false,
  });

  useEffect(() => {
    if (service) {
      setForm({
        titleNo: service.titleNo, titleEn: service.titleEn, slug: service.slug,
        excerptNo: service.excerptNo, excerptEn: service.excerptEn,
        contentNo: service.contentNo, contentEn: service.contentEn,
        image: service.image || "", featured: service.featured ?? false,
      });
    }
  }, [service]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { ...form, image: form.image || null };
      if (isEdit) await apiRequest("PUT", `/api/admin/services/${id}`, body);
      else await apiRequest("POST", "/api/admin/services", body);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/services"] }); toast({ title: isEdit ? "Service updated" : "Service created" }); onBack(); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const f = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div>
      <Button variant="ghost" className="text-zinc-400 mb-6 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Services</Button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? "Edit Service" : "New Service"}</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-4xl">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5" data-testid="form-admin-service">
          <BilingualInput label="Title" valueNo={form.titleNo} valueEn={form.titleEn} onChangeNo={(v) => { f("titleNo", v); if (!isEdit) f("slug", autoSlug(v)); }} onChangeEn={(v) => f("titleEn", v)} testIdPrefix="input-service-title" maxLen={MAX.title} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 text-sm font-medium">Slug</label>
              <CharCount value={form.slug} max={MAX.slug} />
            </div>
            <Input value={form.slug} onChange={(e) => f("slug", e.target.value.slice(0, MAX.slug))} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-service-slug" />
          </div>
          <BilingualTextarea label="Excerpt" valueNo={form.excerptNo} valueEn={form.excerptEn} onChangeNo={(v) => f("excerptNo", v)} onChangeEn={(v) => f("excerptEn", v)} rows={3} testIdPrefix="input-service-excerpt" maxLen={MAX.excerpt} />
          <BilingualTextarea label="Content" valueNo={form.contentNo} valueEn={form.contentEn} onChangeNo={(v) => f("contentNo", v)} onChangeEn={(v) => f("contentEn", v)} rows={10} testIdPrefix="input-service-content" hint="Use ## for headings, - for bullet points." />
          <ImageUploader value={form.image} onChange={(v) => f("image", v)} testId="input-service-image" label="Service Image" />
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700" data-testid="input-service-featured" />
            <label className="text-zinc-300 text-sm font-medium">Featured service (shown on homepage)</label>
          </div>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-service">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? "Saving..." : (isEdit ? "Update Service" : "Create Service")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function ReviewsListView({ onNew, onEdit }: { onNew: () => void; onEdit: (id: number) => void }) {
  const { toast } = useToast();
  const { data: allReviews, isLoading } = useQuery<Review[]>({ queryKey: ["/api/reviews"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/reviews/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/reviews"] }); toast({ title: "Review deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <Button onClick={onNew} data-testid="button-new-review"><Plus className="w-4 h-4 mr-2" /> New Review</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {allReviews?.map((review) => (
            <Card key={review.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4" data-testid={`admin-review-${review.id}`}>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium">{review.authorName}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => <Star key={`e${i}`} className="w-3.5 h-3.5 text-zinc-700" />)}
                </div>
                <p className="text-zinc-400 text-sm mt-1 line-clamp-1">{review.textNo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className={editBtnClass} onClick={() => onEdit(review.id)} data-testid={`button-edit-review-${review.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" className={deleteBtnClass} onClick={() => { if (confirm("Delete this review?")) deleteMutation.mutate(review.id); }} data-testid={`button-delete-review-${review.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewFormView({ id, onBack }: { id?: number; onBack: () => void }) {
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing } = useQuery<Review[]>({ queryKey: ["/api/reviews"], enabled: isEdit });
  const review = existing?.find((r) => r.id === id);
  const [validationErrors, setValidationErrors] = useState<{
    authorName?: string;
    rating?: string;
    textNo?: string;
    textEn?: string;
  }>({});

  const [form, setForm] = useState({
    authorName: "", rating: 0,
    textNo: "", textEn: "",
    featured: true,
  });

  useEffect(() => {
    if (review) {
      setForm({
        authorName: review.authorName, rating: review.rating,
        textNo: review.textNo, textEn: review.textEn,
        featured: review.featured ?? true,
      });
    }
  }, [review]);

  const validateForm = () => {
    const nextErrors: {
      authorName?: string;
      rating?: string;
      textNo?: string;
      textEn?: string;
    } = {};

    if (!form.authorName.trim()) nextErrors.authorName = "Author name is required";
    if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) nextErrors.rating = "Rating is required";
    if (!form.textNo.trim()) nextErrors.textNo = "Norwegian text is required";
    if (!form.textEn.trim()) nextErrors.textEn = "English text is required";

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Please fill all required review fields");
      }
      if (isEdit) await apiRequest("PUT", `/api/admin/reviews/${id}`, form);
      else await apiRequest("POST", "/api/admin/reviews", form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/reviews"] }); toast({ title: isEdit ? "Review updated" : "Review created" }); onBack(); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  return (
    <div>
      <Button variant="ghost" className="text-zinc-400 mb-6 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Reviews</Button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? "Edit Review" : "New Review"}</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-4xl">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5" data-testid="form-admin-review">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 text-sm font-medium">Author Name</label>
              <CharCount value={form.authorName} max={MAX.author} />
            </div>
            <Input
              value={form.authorName}
              onChange={(e) => {
                setForm({ ...form, authorName: e.target.value.slice(0, MAX.author) });
                if (validationErrors.authorName) setValidationErrors((prev) => ({ ...prev, authorName: undefined }));
              }}
              className="bg-zinc-800 border-zinc-700 text-white"
              data-testid="input-review-author"
            />
            {validationErrors.authorName && <p className="text-red-400 text-xs mt-1">{validationErrors.authorName}</p>}
          </div>
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, rating: r });
                    if (validationErrors.rating) setValidationErrors((prev) => ({ ...prev, rating: undefined }));
                  }}
                  className="p-1"
                  data-testid={`button-rating-${r}`}
                >
                  <Star className={`w-6 h-6 ${r <= form.rating ? "fill-primary text-primary" : "text-zinc-700"}`} />
                </button>
              ))}
            </div>
            {validationErrors.rating && <p className="text-red-400 text-xs mt-1">{validationErrors.rating}</p>}
          </div>
          <BilingualTextarea
            label="Review Text"
            valueNo={form.textNo}
            valueEn={form.textEn}
            onChangeNo={(v) => {
              setForm({ ...form, textNo: v });
              if (validationErrors.textNo) setValidationErrors((prev) => ({ ...prev, textNo: undefined }));
            }}
            onChangeEn={(v) => {
              setForm({ ...form, textEn: v });
              if (validationErrors.textEn) setValidationErrors((prev) => ({ ...prev, textEn: undefined }));
            }}
            rows={4}
            testIdPrefix="input-review-text"
          />
          {(validationErrors.textNo || validationErrors.textEn) && (
            <div className="text-red-400 text-xs space-y-1">
              {validationErrors.textNo && <p>{validationErrors.textNo}</p>}
              {validationErrors.textEn && <p>{validationErrors.textEn}</p>}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded border-zinc-700" data-testid="input-review-featured" />
            <label className="text-zinc-300 text-sm font-medium">Featured review (shown on homepage)</label>
          </div>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-review">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? "Saving..." : (isEdit ? "Update Review" : "Create Review")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function HeroListView({ onEdit }: { onEdit: (id: number) => void }) {
  const { data: heroes, isLoading } = useQuery<HeroContent[]>({ queryKey: ["/api/hero"] });

  const pageLabels: Record<string, string> = {
    home: "Home Page",
    portfolio: "Portfolio Page",
    blog: "Blog Page",
    services: "Services Page",
    contact: "Contact Section",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Hero Content</h1>
      <p className="text-zinc-400 text-sm mb-6">Edit the hero titles and descriptions for each page.</p>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {heroes?.map((hero) => (
            <Card key={hero.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4" data-testid={`admin-hero-${hero.pageKey}`}>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium">{pageLabels[hero.pageKey] || hero.pageKey}</h3>
                <p className="text-zinc-400 text-sm mt-1 truncate">{hero.titleNo}</p>
              </div>
              <Button size="sm" variant="outline" className={editBtnClass} onClick={() => onEdit(hero.id)} data-testid={`button-edit-hero-${hero.pageKey}`}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroFormView({ id, onBack }: { id: number; onBack: () => void }) {
  const { toast } = useToast();
  const { data: heroes } = useQuery<HeroContent[]>({ queryKey: ["/api/hero"] });
  const hero = heroes?.find((h) => h.id === id);

  const [form, setForm] = useState({
    pageKey: "", titleNo: "", titleEn: "",
    subtitleNo: "", subtitleEn: "",
    descriptionNo: "", descriptionEn: "",
  });

  useEffect(() => {
    if (hero) {
      setForm({
        pageKey: hero.pageKey,
        titleNo: hero.titleNo, titleEn: hero.titleEn,
        subtitleNo: hero.subtitleNo || "", subtitleEn: hero.subtitleEn || "",
        descriptionNo: hero.descriptionNo || "", descriptionEn: hero.descriptionEn || "",
      });
    }
  }, [hero]);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/admin/hero/${id}`, form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/hero"] }); toast({ title: "Hero content updated" }); onBack(); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const f = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div>
      <Button variant="ghost" className="text-zinc-400 mb-6 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hero Content</Button>
      <h1 className="text-2xl font-bold text-white mb-6">Edit Hero - {form.pageKey}</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-4xl">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5" data-testid="form-admin-hero">
          <BilingualInput label="Title" valueNo={form.titleNo} valueEn={form.titleEn} onChangeNo={(v) => f("titleNo", v)} onChangeEn={(v) => f("titleEn", v)} testIdPrefix="input-hero-title" maxLen={MAX.title} />
          <BilingualInput label="Subtitle" valueNo={form.subtitleNo} valueEn={form.subtitleEn} onChangeNo={(v) => f("subtitleNo", v)} onChangeEn={(v) => f("subtitleEn", v)} testIdPrefix="input-hero-subtitle" maxLen={MAX.subtitle} />
          <BilingualTextarea label="Description" valueNo={form.descriptionNo} valueEn={form.descriptionEn} onChangeNo={(v) => f("descriptionNo", v)} onChangeEn={(v) => f("descriptionEn", v)} rows={4} testIdPrefix="input-hero-desc" maxLen={MAX.excerpt} />
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-hero">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? "Saving..." : "Update Hero Content"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function SettingsView() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({ queryKey: ["/api/settings"] });

  const settingKeys = [
    { key: "business_name", label: "Business Name" },
    { key: "phone", label: "Phone Number" },
    { key: "email", label: "Email Address" },
    { key: "address", label: "Address" },
    { key: "business_hours", label: "Business Hours" },
    { key: "instagram_url", label: "Instagram URL" },
    { key: "facebook_url", label: "Facebook URL" },
    { key: "meta_description", label: "SEO Meta Description" },
  ];

  const [formValues, setFormValues] = useState<Record<string, { valueNo: string; valueEn: string }>>({});

  useEffect(() => {
    if (settings) {
      const values: Record<string, { valueNo: string; valueEn: string }> = {};
      for (const sk of settingKeys) {
        const existing = settings.find(s => s.key === sk.key);
        values[sk.key] = {
          valueNo: existing?.valueNo || "",
          valueEn: existing?.valueEn || "",
        };
      }
      setFormValues(values);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; valueNo: string; valueEn: string }) => {
      await apiRequest("POST", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Setting saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 bg-zinc-800 rounded-md" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Site Settings</h1>
      <p className="text-zinc-400 text-sm mb-6">Manage contact information, social links, and SEO settings.</p>
      <div className="space-y-6 max-w-4xl">
        {settingKeys.map((sk) => {
          const val = formValues[sk.key] || { valueNo: "", valueEn: "" };
          return (
            <Card key={sk.key} className="bg-zinc-900 border-zinc-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <BilingualInput
                    label={sk.label}
                    valueNo={val.valueNo}
                    valueEn={val.valueEn}
                    onChangeNo={(v) => setFormValues((prev) => ({ ...prev, [sk.key]: { ...prev[sk.key], valueNo: v } }))}
                    onChangeEn={(v) => setFormValues((prev) => ({ ...prev, [sk.key]: { ...prev[sk.key], valueEn: v } }))}
                    testIdPrefix={`input-setting-${sk.key}`}
                  />
                </div>
                <Button
                  size="sm"
                  className="mt-6"
                  onClick={() => saveMutation.mutate({ key: sk.key, valueNo: val.valueNo, valueEn: val.valueEn })}
                  disabled={saveMutation.isPending}
                  data-testid={`button-save-setting-${sk.key}`}
                >
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ContactsView() {
  const { toast } = useToast();
  const { data: contacts, isLoading } = useQuery<ContactSubmission[]>({ queryKey: ["/api/admin/contacts"] });
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const selectedContact = contacts?.find((c) => c.id === selectedContactId) ?? null;

  const markReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: number; isRead: boolean }) => {
      await apiRequest("PATCH", `/api/admin/contacts/${id}/read`, { isRead });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      setSelectedContactId(null);
      toast({ title: "Message deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openContact = (contact: ContactSubmission) => {
    setSelectedContactId(contact.id);
    if (!contact.isRead) {
      markReadMutation.mutate({ id: contact.id, isRead: true });
    }
  };

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (pendingDeleteId === null) return;
    deleteMutation.mutate(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Contact Messages</h1>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 bg-zinc-800 rounded-md" />)}</div>
      ) : contacts?.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
          <Mail className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No messages yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts?.map((contact) => (
            <Card
              key={contact.id}
              className={`bg-zinc-900 border-zinc-800 p-5 cursor-pointer transition-colors ${
                contact.isRead ? "hover:border-zinc-700" : "border-primary/40 bg-zinc-900/90 hover:border-primary/60"
              }`}
              data-testid={`admin-contact-${contact.id}`}
              onClick={() => openContact(contact)}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-white font-medium truncate">{contact.name}</h3>
                  <Badge variant={contact.isRead ? "outline" : "default"} className={contact.isRead ? "" : "bg-primary text-primary-foreground"}>
                    {contact.isRead ? "Read" : "Unread"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-zinc-500 text-xs">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={deleteBtnClass}
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(contact.id);
                    }}
                    data-testid={`button-delete-contact-${contact.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                <span>{contact.email}</span>
                {contact.phone && <span>{contact.phone}</span>}
              </div>
              <p className="text-zinc-300 text-sm line-clamp-2 break-words [overflow-wrap:anywhere]">{contact.message}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedContact} onOpenChange={(open) => { if (!open) setSelectedContactId(null); }}>
        {selectedContact && (
          <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="pr-8 break-words [overflow-wrap:anywhere]">
                Message from {selectedContact.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant={selectedContact.isRead ? "outline" : "default"} className={selectedContact.isRead ? "" : "bg-primary text-primary-foreground"}>
                  {selectedContact.isRead ? "Read" : "Unread"}
                </Badge>
                <span className="text-zinc-400">{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : ""}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-400">Email</p>
                <p className="text-zinc-200 break-all">{selectedContact.email}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-400">Phone</p>
                <p className="text-zinc-200">{selectedContact.phone || "-"}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-400">Message</p>
                <p className="text-zinc-200 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{selectedContact.message}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className={deleteBtnClass}
                  onClick={() => requestDelete(selectedContact.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-contact-dialog"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Message
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-contact"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
