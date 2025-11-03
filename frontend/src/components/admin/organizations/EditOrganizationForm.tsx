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
import { useUpdateOrganization } from "@/hooks/organizations/useUpdateOrganization";
import { Organization } from "@/types/organization";
import { FilePenLine } from "lucide-react";

interface EditOrganizationFormProps {
  organization: Organization;
}

export const EditOrganizationForm: React.FC<EditOrganizationFormProps> = ({
  organization,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateMutation = useUpdateOrganization();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;

    if (name && domain) {
      updateMutation.mutate(
        { ...organization, name, domain },
        {
          onSuccess: () => {
            setIsOpen(false);
          },
        },
      );
    }
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
          <DialogTitle>Edit Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Organization Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={organization.name}
              required
            />
          </div>
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700"
            >
              Domain
            </label>
            <Input
              id="domain"
              name="domain"
              type="text"
              defaultValue={organization.domain}
              required
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
