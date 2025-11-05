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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

// Defining the hook directly in the component file to avoid export/import issues.
function useUpdateCooperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cooperation: Omit<Cooperation, "syncStatus">) =>
      cooperationRepository.update(cooperation.id, {
        ...cooperation,
        syncStatus: "updated",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
}

interface EditCooperationFormProps {
  cooperation: Cooperation;
}

export const EditCooperationForm: React.FC<EditCooperationFormProps> = ({
  cooperation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(cooperation.name);
  const [description, setDescription] = useState(cooperation.description);
  const { mutate: updateCooperation, isPending: isLoading } =
    useUpdateCooperation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCooperation({
      ...cooperation,
      name,
      description,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilePenLine className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Cooperation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
