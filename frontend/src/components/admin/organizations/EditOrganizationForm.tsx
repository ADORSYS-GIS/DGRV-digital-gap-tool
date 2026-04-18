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

import { useTranslation } from "react-i18next";

const formSchema = (t: any) =>
  z.object({
    name: z.string().min(2, t("adminOrgs.validation.nameMin")),
    domain: z.string().min(2, t("adminOrgs.validation.domainMin")),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

interface EditOrganizationFormProps {
  organization: Organization;
  onSuccess: () => void;
}

export const EditOrganizationForm = ({
  organization,
  onSuccess,
}: EditOrganizationFormProps) => {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      name: organization.name,
      domain: organization.domain,
    },
  });

  const updateOrganization = useUpdateOrganization();

  const onSubmit = (values: FormValues) => {
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
              <FormLabel>{t("adminOrgs.form.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("adminOrgs.form.namePlaceholder")} {...field} />
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
              <FormLabel>{t("adminOrgs.form.domain")}</FormLabel>
              <FormControl>
                <Input placeholder={t("adminOrgs.form.domainPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending ? t("adminOrgs.form.updating") : t("common.save")}
        </Button>
      </form>
    </Form>
  );
};
