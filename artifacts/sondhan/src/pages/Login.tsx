import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast({ title: "Welcome back!", description: `Logged in as ${res.user.name}` });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Login failed", description: err?.data?.error ?? "Invalid credentials", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><span className="text-2xl font-bold text-primary cursor-pointer">Sondhan AI</span></Link>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input data-testid="input-email" type="email" placeholder="you@university.edu.bd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input data-testid="input-password" type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button data-testid="button-submit" type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo credentials:</p>
            <p>Admin: <span className="font-mono">admin@sondhan.ai</span> / <span className="font-mono">admin123</span></p>
            <p>Student: <span className="font-mono">rahim@buet.ac.bd</span> / <span className="font-mono">student123</span></p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          No account?{" "}
          <Link href="/register"><span className="text-primary cursor-pointer hover:underline">Register here</span></Link>
        </p>
      </div>
    </div>
  );
}
