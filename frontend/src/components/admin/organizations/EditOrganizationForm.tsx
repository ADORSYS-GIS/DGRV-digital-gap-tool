import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateOrganization } from "@/hooks/organizations/useUpdateOrganization";
import { Organization } from "@/types/organization";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  domain: z.string().min(2, "Domain must be at least 2 characters."),
});

interface EditOrganizationFormProps {
  organization: Organization;
  onSuccess: () => void;
}

export const EditOrganizationForm = ({
  organization,
  onSuccess,
}: EditOrganizationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      domain: organization.domain,
    },
  });

  const updateOrganization = useUpdateOrganization();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateOrganization.mutate(
      { ...organization, ...values },
      {
        onSuccess,
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Domain</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization domain" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};
