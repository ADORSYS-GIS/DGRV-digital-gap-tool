import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SelectStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (state: "current" | "desired") => void;
}

export const SelectStateDialog = ({
  isOpen,
  onClose,
  onSelect,
}: SelectStateDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {t("adminLevels.selectState.title")}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {t("adminLevels.selectState.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 p-6">
          <div
            className="group relative p-4 border-2 border-transparent rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-500 hover:shadow-lg bg-gray-50 dark:bg-gray-800"
            onClick={() => onSelect("current")}
          >
            <div className="text-center">
              <TrendingDown className="h-12 w-12 mx-auto text-blue-500 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t("adminLevels.selectState.currentTitle")}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("adminLevels.selectState.currentDesc")}
              </p>
            </div>
          </div>
          <div
            className="group relative p-4 border-2 border-transparent rounded-lg cursor-pointer transition-all duration-300 hover:border-green-500 hover:shadow-lg bg-gray-50 dark:bg-gray-800"
            onClick={() => onSelect("desired")}
          >
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-green-500 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t("adminLevels.selectState.desiredTitle")}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("adminLevels.selectState.desiredDesc")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
