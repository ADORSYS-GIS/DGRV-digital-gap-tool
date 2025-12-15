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
import { Textarea } from "@/components/ui/textarea";
import { useAddOrganization } from "@/hooks/organizations/useAddOrganization";
import { PlusCircle, Building2 } from "lucide-react";

export const AddOrganizationForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addOrganizationMutation = useAddOrganization();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const description = formData.get("description") as string;

    if (name && domain) {
      addOrganizationMutation.mutate({
        name,
        domain,
        description: description || "",
      });
      setIsOpen(false);
      event.currentTarget.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Add New Organization
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              Enter the details to create a new cooperative organization.
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                Organization Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Green Valley Coop"
                className="h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="domain"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                Domain
              </label>
              <Input
                id="domain"
                name="domain"
                type="text"
                required
                placeholder="e.g. greenvalley.com"
                className="h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the organization"
                className="min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={addOrganizationMutation.isPending}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {addOrganizationMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Adding...
                  </span>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
