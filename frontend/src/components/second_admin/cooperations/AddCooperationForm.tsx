import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";

export const AddCooperationForm: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const addCooperationMutation = useAddCooperation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCooperationMutation.mutate({ name, description });
    setIsOpen(false);
    setName("");
    setDescription("");
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
          <div>
            <Label htmlFor="name">Cooperation Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={addCooperationMutation.isPending}>
            {addCooperationMutation.isPending ? "Adding..." : "Add Cooperation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
