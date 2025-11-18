import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;

    if (name && domain) {
      addOrganizationMutation.mutate({ name, domain });
      setIsOpen(false);
      event.currentTarget.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Organization Name
            </label>
            <Input id="name" name="name" type="text" required />
          </div>
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700"
            >
              Domain
            </label>
            <Input id="domain" name="domain" type="text" required />
          </div>
          <Button type="submit" disabled={addOrganizationMutation.isPending}>
            {addOrganizationMutation.isPending
              ? "Adding..."
              : "Add Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
