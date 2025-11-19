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
import { PlusCircle } from "lucide-react";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";
import { Cooperation } from "@/types/cooperation";

interface AddCooperationFormProps {
  onAdd: (cooperation: Omit<Cooperation, "id" | "syncStatus">) => void;
}

export const AddCooperationForm: React.FC<AddCooperationFormProps> = ({
  onAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: addCooperation, isPending: isLoading } = useAddCooperation();

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Cooperation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Cooperation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Cooperation Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Cooperation Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Cooperation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
