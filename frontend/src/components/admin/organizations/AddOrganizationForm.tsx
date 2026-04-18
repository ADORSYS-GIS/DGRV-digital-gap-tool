import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAddOrganization } from "@/hooks/organizations/useAddOrganization";
import { PlusCircle, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const organizationSchema = (t: any) =>
  z.object({
    name: z
      .string()
      .min(1, t("adminOrgs.validation.nameRequired"))
      .refine((s) => !s.includes(" "), t("adminOrgs.validation.nameNoSpaces")),
    domain: z.string().min(1, t("adminOrgs.validation.domainRequired")),
    description: z.string().optional(),
  });

type OrganizationFormValues = z.infer<ReturnType<typeof organizationSchema>>;

export const AddOrganizationForm: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const addOrganizationMutation = useAddOrganization();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema(t)),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
    },
  });

  const handleSubmit = (values: OrganizationFormValues) => {
    addOrganizationMutation.mutate(
      {
        ...values,
        description: values.description || "",
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4" /> {t("adminOrgs.addBtn")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("adminOrgs.form.titleAdd")}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {t("adminOrgs.form.descAdd")}
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("adminOrgs.form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("adminOrgs.form.namePlaceholder")}
                        {...field}
                        className="h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
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
                    <FormLabel>{t("adminOrgs.form.domain")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("adminOrgs.form.domainPlaceholder")}
                        {...field}
                        className="h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("adminOrgs.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("adminOrgs.form.descPlaceholder")}
                        {...field}
                        className="min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={addOrganizationMutation.isPending}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {addOrganizationMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t("adminOrgs.form.saving")}
                    </span>
                  ) : (
                    t("adminOrgs.createBtn")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
