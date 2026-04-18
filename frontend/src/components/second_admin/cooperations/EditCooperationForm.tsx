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
import { FilePenLine } from "lucide-react";
import { Cooperation } from "@/types/cooperation";

interface EditCooperationFormProps {
  /**
   * Existing cooperative to edit.
   */
  cooperation: Cooperation;
  /**
   * Called with the updated cooperative payload when the form is submitted.
   */
  onUpdate: (cooperation: Cooperation) => void;
}

/**
 * Inline edit dialog for updating an existing cooperative.
 * Keeps the layout and copy consistent with the add-cooperative flow.
 */
export const EditCooperationForm: React.FC<EditCooperationFormProps> = ({
  cooperation,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(cooperation.name);
  const [description, setDescription] = useState(cooperation.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...cooperation,
      name,
      description,
    });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setName(cooperation.name);
    setDescription(cooperation.description);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition-colors"
        >
          <FilePenLine className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("secondAdminCooperations.edit.triggerLabel")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t("secondAdminCooperations.edit.title")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("secondAdminCooperations.edit.description")}
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-4"
          aria-label={t("secondAdminCooperations.edit.ariaLabel")}
        >
          <div className="space-y-2">
            <label
              htmlFor={`edit-name-${cooperation.id}`}
              className="text-sm font-medium leading-none text-foreground"
            >
              {t("secondAdminCooperations.add.nameLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              id={`edit-name-${cooperation.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`edit-description-${cooperation.id}`}
              className="text-sm font-medium leading-none text-foreground"
            >
              {t("secondAdminCooperations.add.descriptionLabel")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              id={`edit-description-${cooperation.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[110px]"
            />
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
            <Button type="submit" className="w-full sm:w-auto">
              {t("secondAdminCooperations.edit.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
