import * as React from "react";
import { useState } from "react";
import {
  DigitalisationLevelForm,
  DigitalisationLevelFormValues,
} from "@/components/admin/digitalisation/DigitalisationLevelForm";
import { DigitalisationLevelList } from "@/components/admin/digitalisation/DigitalisationLevelList";
import { DigitalisationLevel } from "@/components/admin/digitalisation/DigitalisationLevelItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ManageDigitalisationLevels: React.FC = () => {
  const [levels, setLevels] = useState<DigitalisationLevel[]>([
    { id: "1", level: 1, description: "Initial stage of digitalization" },
    { id: "2", level: 2, description: "Basic digital presence" },
  ]);
  const [editingLevel, setEditingLevel] = useState<
    DigitalisationLevel | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (data: DigitalisationLevelFormValues) => {
    setIsSubmitting(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (editingLevel) {
      setLevels(
        levels.map((l) => (l.id === editingLevel.id ? { ...l, ...data } : l)),
      );
    } else {
      setLevels([...levels, { id: Date.now().toString(), ...data }]);
    }
    setIsSubmitting(false);
    setEditingLevel(undefined);
    setIsDialogOpen(false);
  };

  const handleEdit = (level: DigitalisationLevel) => {
    setEditingLevel(level);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLevels(levels.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Digitalization Levels</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingLevel(undefined)}>
            Add New Level
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? "Edit" : "Create"} Digitalization Level
            </DialogTitle>
          </DialogHeader>
          <DigitalisationLevelForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            {...(editingLevel && {
              initialData: {
                level: editingLevel.level,
                description: editingLevel.description,
              },
            })}
          />
        </DialogContent>
      </Dialog>
      <div className="mt-4">
        <DigitalisationLevelList
          levels={levels}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
};

export default ManageDigitalisationLevels;
