import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddOrganization } from "@/hooks/organizations/useAddOrganization";
import { PlusCircle } from "lucide-react";

export const AddOrganizationForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addOrganizationMutation = useAddOrganization();
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) || "";
    const domain = (formData.get("domain") as string) || "";
    const description = (formData.get("description") as string) || "";

    if (name && domain) {
      // Ensure required fields for type are provided (description included)
      addOrganizationMutation.mutate({ name, domain, description });
      setIsOpen(false);
      event.currentTarget.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />{" "}
          {t("admin.organizations.add.button", {
            defaultValue: "Add Organization",
          })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("admin.organizations.add.title", {
              defaultValue: "Add New Organization",
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {t("admin.organizations.form.nameLabel", {
                defaultValue: "Organization Name",
              })}
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder={t("admin.organizations.form.namePlaceholder", {
                defaultValue: "Enter organization name",
              })}
            />
          </div>
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700"
            >
              {t("admin.organizations.form.domainLabel", {
                defaultValue: "Domain",
              })}
            </label>
            <Input
              id="domain"
              name="domain"
              type="text"
              required
              placeholder={t("admin.organizations.form.domainPlaceholder", {
                defaultValue: "Enter organization domain",
              })}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              {t("admin.organizations.form.descriptionLabel", {
                defaultValue: "Description (optional)",
              })}
            </label>
            <Textarea
              id="description"
              name="description"
              className="min-h-[100px]"
              placeholder={t(
                "admin.organizations.form.descriptionPlaceholder",
                { defaultValue: "Add a brief description (optional)" },
              )}
            />
          </div>
          <Button type="submit" disabled={addOrganizationMutation.isPending}>
            {addOrganizationMutation.isPending
              ? t("common.adding", { defaultValue: "Adding..." })
              : t("admin.organizations.add.button", {
                  defaultValue: "Add Organization",
                })}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
