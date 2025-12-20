import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface NoDimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoDimensionsModal({ isOpen, onClose }: NoDimensionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <DialogTitle className="text-lg font-semibold">
              No Dimensions Assigned
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-4 text-sm text-muted-foreground">
          Your organization does not have any dimensions assigned to it. Please
          contact an administrator to assign dimensions before you can create an
          assessment.
        </DialogDescription>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
