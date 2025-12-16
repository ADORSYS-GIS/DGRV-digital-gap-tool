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

/**
 * Entry point for creating a new cooperation profile.
 * Uses a dialog-based form with clear labels, helper copy and loading states.
 */
export const AddCooperationForm: React.FC = () => {
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

  const handleCancel = () => {
    setIsOpen(false);
  };

  const triggerLabel = isLoading ? "Saving cooperative…" : "Add cooperative";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 rounded-full shadow-sm transition-all hover:shadow-md"
          aria-label={triggerLabel}
          disabled={isLoading}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add new cooperative
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new cooperative profile to start tracking assessments and
            action plans.
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-4"
          aria-label="Create cooperative form"
        >
          <div className="space-y-2">
            <label
              htmlFor="cooperation-name"
              className="text-sm font-medium leading-none text-foreground"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="cooperation-name"
              placeholder="e.g. Green Valley Cooperative"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Use the official name that admins and members recognize.
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cooperation-description"
              className="text-sm font-medium leading-none text-foreground"
            >
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="cooperation-description"
              placeholder="Briefly describe the cooperative, its focus and members."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[110px]"
            />
            <p className="text-xs text-muted-foreground">
              This helps other admins quickly understand what this cooperative
              is about.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Create cooperative"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
