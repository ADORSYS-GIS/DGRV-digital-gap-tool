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

interface EditCooperationFormProps {
  cooperation: Cooperation;
  onUpdate: (cooperation: Cooperation) => void;
}

export const EditCooperationForm: React.FC<EditCooperationFormProps> = ({
  cooperation,
  onUpdate,
}) => {
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
        <Button variant="outline" size="sm">
          <FilePenLine className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Cooperative</DialogTitle>
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
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
