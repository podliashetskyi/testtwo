import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { username, password });
      return res.json();
    },
    onSuccess: async () => {
      queryClient.setQueryData(["/api/admin/me"], { isAdmin: true });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      setLocation("/admin");
    },
    onError: () => {
      toast({ title: "Login Failed", description: "Invalid username or password", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <SEO title="Admin Login | Max Flis & Bad AS" description="Admin login" noindex />
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white" data-testid="text-admin-login-title">Admin Login</h1>
          <p className="text-zinc-400 text-sm mt-2">Sign in to manage your website content</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }} className="space-y-5" data-testid="form-admin-login">
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-admin-username" />
          </div>
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-2">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-admin-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-admin-login">
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
