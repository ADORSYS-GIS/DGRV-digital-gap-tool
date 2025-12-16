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

/**
 * Dialog form for inviting a new user into a cooperation.
 * Automatically assigns the correct role based on the current user's role.
 */
export const AddCooperationUserForm = () => {
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

  const handleCancel = () => {
    setIsOpen(false);
  };

  const triggerLabel = isPending ? "Inviting user…" : "Add user";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 rounded-full shadow-sm transition-all hover:shadow-md"
          disabled={isPending || !newUserRole}
          aria-label={triggerLabel}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add a new user
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Invite a new admin or member to this cooperation. They will receive
            an email with access details once their account is created.
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-4"
          aria-label="Add cooperation user form"
        >
          <div className="space-y-2">
            <Label htmlFor="coop-user-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coop-user-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="name@example.org"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coop-user-first-name">First name</Label>
              <Input
                id="coop-user-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coop-user-last-name">Last name</Label>
              <Input
                id="coop-user-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coop-user-role">Role</Label>
            <Input
              id="coop-user-role"
              value={
                newUserRole
                  ? newUserRole === "coop_admin"
                    ? "Cooperation admin"
                    : "Cooperation user"
                  : "No role will be assigned with your current permissions"
              }
              disabled
            />
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
              disabled={isPending || !newUserRole}
              className="w-full sm:w-auto"
            >
              {isPending ? "Adding…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
