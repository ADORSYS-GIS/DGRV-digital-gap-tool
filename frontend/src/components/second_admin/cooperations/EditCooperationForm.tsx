import React, { useState } from "react";
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
import { useTranslation } from "react-i18next";

interface EditCooperationFormProps {
  cooperation: Cooperation;
  onUpdate: (cooperation: Cooperation) => void;
}

export const EditCooperationForm: React.FC<EditCooperationFormProps> = ({
  cooperation,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(cooperation.name);
  const [description, setDescription] = useState(cooperation.description);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...cooperation,
      name,
      description,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("common.edit", { defaultValue: "Edit" })}
        >
          <FilePenLine className="mr-2 h-4 w-4" />{" "}
          {t("common.edit", { defaultValue: "Edit" })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("secondAdmin.cooperations.edit.title", {
              defaultValue: "Edit Cooperation",
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={t(
              "secondAdmin.cooperations.form.namePlaceholder",
              { defaultValue: "Cooperation Name" },
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label={t(
              "secondAdmin.cooperations.form.namePlaceholder",
              { defaultValue: "Cooperation Name" },
            )}
          />
          <Textarea
            placeholder={t(
              "secondAdmin.cooperations.form.descriptionPlaceholder",
              { defaultValue: "Cooperation Description" },
            )}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            aria-label={t(
              "secondAdmin.cooperations.form.descriptionPlaceholder",
              { defaultValue: "Cooperation Description" },
            )}
          />
          <Button type="submit">
            {t("secondAdmin.cooperations.edit.save", {
              defaultValue: "Save Changes",
            })}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
