import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  universityId: z.string().min(1, "University ID required"),
  department: z.string().min(1, "Department required"),
  batch: z.string().min(1, "Batch required"),
  role: z.string().min(1, "Role required"),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", universityId: "", department: "", batch: "", role: "Student", phone: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast({ title: "Account created!", description: `Welcome to Sondhan AI, ${res.user.name}!` });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Registration failed", description: err?.data?.error ?? "Please try again", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="text-2xl font-bold text-primary cursor-pointer">Sondhan AI</span></Link>
          <p className="text-muted-foreground text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input data-testid="input-name" placeholder="Rahim Ahmed" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input data-testid="input-email" type="email" placeholder="you@uttara.ac.bd" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input data-testid="input-password" type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="universityId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>University ID</FormLabel>
                    <FormControl><Input data-testid="input-university-id" placeholder="UU2105123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl><Input data-testid="input-department" placeholder="CSE" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="batch" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl><Input data-testid="input-batch" placeholder="2021" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl><Input data-testid="input-phone" placeholder="01700000000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button data-testid="button-submit" type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login"><span className="text-primary cursor-pointer hover:underline">Sign in</span></Link>
        </p>
      </div>
    </div>
  );
}
