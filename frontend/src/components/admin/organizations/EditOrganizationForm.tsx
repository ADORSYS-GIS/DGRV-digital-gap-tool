import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
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

interface EditOrganizationFormProps {
  organization: Organization;
  onSuccess: () => void;
}

export const EditOrganizationForm = ({
  organization,
  onSuccess,
}: EditOrganizationFormProps) => {
  const { t } = useTranslation();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(
            2,
            t("admin.organizations.validation.nameMin", {
              defaultValue: "Name must be at least 2 characters.",
            }),
          ),
        domain: z
          .string()
          .min(
            2,
            t("admin.organizations.validation.domainMin", {
              defaultValue: "Domain must be at least 2 characters.",
            }),
          ),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      domain: organization.domain,
    },
    mode: "onChange",
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
              <FormLabel>
                {t("admin.organizations.form.nameLabel", {
                  defaultValue: "Organization Name",
                })}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "admin.organizations.form.namePlaceholder",
                    { defaultValue: "Enter organization name" },
                  )}
                  {...field}
                />
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
              <FormLabel>
                {t("admin.organizations.form.domainLabel", {
                  defaultValue: "Organization Domain",
                })}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "admin.organizations.form.domainPlaceholder",
                    { defaultValue: "Enter organization domain" },
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending
            ? t("common.saving", { defaultValue: "Saving..." })
            : t("admin.organizations.edit.saveChanges", {
                defaultValue: "Save Changes",
              })}
        </Button>
      </form>
    </Form>
  );
};
