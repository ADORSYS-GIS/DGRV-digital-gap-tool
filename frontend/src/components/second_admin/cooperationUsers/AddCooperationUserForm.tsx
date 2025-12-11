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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={newUserRole || "No role will be assigned"}
              disabled
            />
          </div>
          <Button type="submit" disabled={isPending || !newUserRole}>
            {isPending ? "Adding..." : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
