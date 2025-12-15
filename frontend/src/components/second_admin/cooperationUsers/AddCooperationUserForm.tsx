import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { PlusCircle } from "lucide-react";
import { useAddCooperationUser } from "@/hooks/cooperationUsers/useAddCooperationUser";
import { AddCooperationUser } from "@/types/cooperationUser";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useTranslation } from "react-i18next";

export const AddCooperationUserForm = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { mutate: addUser, isPending } = useAddCooperationUser();
  const { user: currentUser } = useAuth();
  const { cooperationId } = useParams<{ cooperationId: string }>();

  const getNewUserRole = () => {
    if (currentUser?.roles?.includes(ROLES.COOP_ADMIN)) {
      return "coop_user";
    }
    if (
      currentUser?.roles?.includes(ROLES.ORG_ADMIN) ||
      currentUser?.roles?.includes(ROLES.ADMIN)
    ) {
      return "coop_admin";
    }
    return null;
  };

  const newUserRole = getNewUserRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserRole || !cooperationId) return;

    const user: AddCooperationUser = {
      email,
      firstName,
      lastName,
      roles: [newUserRole],
    };
    addUser(
      { user, cooperationId },
      {
        onSuccess: () => {
          setIsOpen(false);
          setEmail("");
          setFirstName("");
          setLastName("");
        },
      },
    );
  };

  const resolvedRoleDisplay =
    newUserRole === "coop_admin"
      ? t("roles.coop_admin", { defaultValue: "Cooperation Admin" })
      : newUserRole === "coop_user"
        ? t("roles.coop_user", { defaultValue: "Cooperation User" })
        : t("secondAdmin.cooperationUsers.form.noRoleAssigned", {
            defaultValue: "No role will be assigned",
          });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button aria-label={t("secondAdmin.cooperationUsers.add.button", { defaultValue: "Add User" })}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("secondAdmin.cooperationUsers.add.button", { defaultValue: "Add User" })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("secondAdmin.cooperationUsers.add.title", {
              defaultValue: "Add a New User",
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">
              {t("secondAdmin.cooperationUsers.form.email", { defaultValue: "Email" })}
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              aria-label={t("secondAdmin.cooperationUsers.form.email", { defaultValue: "Email" })}
            />
          </div>
          <div>
            <Label htmlFor="firstName">
              {t("secondAdmin.cooperationUsers.form.firstName", { defaultValue: "First Name" })}
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label={t("secondAdmin.cooperationUsers.form.firstName", { defaultValue: "First Name" })}
            />
          </div>
          <div>
            <Label htmlFor="lastName">
              {t("secondAdmin.cooperationUsers.form.lastName", { defaultValue: "Last Name" })}
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-label={t("secondAdmin.cooperationUsers.form.lastName", { defaultValue: "Last Name" })}
            />
          </div>
          <div>
            <Label htmlFor="role">
              {t("secondAdmin.cooperationUsers.form.role", { defaultValue: "Role" })}
            </Label>
            <Input
              id="role"
              value={resolvedRoleDisplay}
              disabled
              aria-label={t("secondAdmin.cooperationUsers.form.role", { defaultValue: "Role" })}
            />
          </div>
          <Button type="submit" disabled={isPending || !newUserRole}>
            {isPending
              ? t("common.adding", { defaultValue: "Adding..." })
              : t("secondAdmin.cooperationUsers.add.button", { defaultValue: "Add User" })}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
