import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";

/**
 * Entry point for creating a new cooperative profile.
 * Uses a dialog-based form with clear labels, helper copy and loading states.
 */
export const AddCooperationForm: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const organizationId = useOrganizationId();
  const { mutate: addCooperation, isPending: isLoading } = useAddCooperation(
    organizationId || undefined,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addCooperation({
      name,
      description,
      domains: [],
    });
    setName("");
    setDescription("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const triggerLabel = isLoading
    ? t("secondAdminCooperations.add.loadingLabel")
    : t("secondAdminCooperations.add.triggerLabel");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 rounded-full shadow-sm transition-all hover:shadow-md"
          aria-label={triggerLabel}
          disabled={isLoading}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("secondAdminCooperations.add.title")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("secondAdminCooperations.add.description")}
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-4"
          aria-label={t("secondAdminCooperations.add.ariaLabel")}
        >
          <div className="space-y-2">
            <label
              htmlFor="cooperative-name"
              className="text-sm font-medium leading-none text-foreground"
            >
              {t("secondAdminCooperations.add.nameLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              id="cooperative-name"
              placeholder="e.g. Green Valley Cooperative"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t("secondAdminCooperations.add.nameHelper")}
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cooperative-description"
              className="text-sm font-medium leading-none text-foreground"
            >
              {t("secondAdminCooperations.add.descriptionLabel")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="cooperative-description"
              placeholder="Briefly describe the cooperative, its focus and members."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[110px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("secondAdminCooperations.add.descriptionHelper")}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCancel}
            >
              {t("secondAdminCooperations.add.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("secondAdminCooperations.add.saving")}
                </>
              ) : (
                t("secondAdminCooperations.add.submit")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
