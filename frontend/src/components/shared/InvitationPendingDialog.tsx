import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface InvitationPendingDialogProps {
  isOpen: boolean;
}

export const InvitationPendingDialog = ({
  isOpen,
}: InvitationPendingDialogProps) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("shared.invitationPending.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("shared.invitationPending.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogout}>{t("shared.invitationPending.logout")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
