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
import { useTranslation } from "react-i18next";

interface NoDimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoDimensionsModal({ isOpen, onClose }: NoDimensionsModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <DialogTitle className="text-lg font-semibold">
              {t("shared.assessments.noDimensionsTitle")}
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-4 text-sm text-muted-foreground">
          {t("shared.assessments.noDimensionsDesc")}
        </DialogDescription>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full">
            {t("shared.assessments.ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
