import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import { useUpdateUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
  department: z.string().optional(),
  batch: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, login, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateUser();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      department: user?.department ?? "",
      batch: user?.batch ?? "",
    },
  });

  const onSubmit = (data: ProfileForm) => {
    if (!user) return;
    updateMutation.mutate({ id: user.id, data }, {
      onSuccess: (updated) => {
        const updatedUser = { ...user, ...updated };
        localStorage.setItem("sondhan_user", JSON.stringify(updatedUser));
        login(token!, updatedUser);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated", description: "Your changes have been saved." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error ?? "Failed to update", variant: "destructive" });
      },
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">University ID</p>
              <p className="font-medium font-mono">{user?.universityId ?? "—"}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Verified</p>
              <p className="font-medium">{user?.isVerified ? "Yes" : "No"}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input data-testid="input-name" {...field} /></FormControl>
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
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input data-testid="input-phone" placeholder="01700000000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button data-testid="button-save" type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppShell>
  );
}
