import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/constants/roles";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import { useInviteUser } from "@/hooks/users/useInviteUser";
import { UserInvitationRequest } from "@/openapi-client/types.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const inviteUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  roles: z
    .array(z.string())
    .min(1, { message: "At least one role is required" }),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

interface InviteUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export const InviteUserForm: React.FC<InviteUserFormProps> = ({
  isOpen,
  onClose,
  orgId,
}) => {
  const { isAdmin, isOrgAdmin, isCoopAdmin } = useCurrentUser();

  const getRoleToAssign = () => {
    if (isAdmin) return ROLES.ORG_ADMIN;
    if (isOrgAdmin) return ROLES.COOP_ADMIN;
    if (isCoopAdmin) return ROLES.COOP_USER;
    return "";
  };

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      roles: [getRoleToAssign()],
    },
  });

  const inviteUserMutation = useInviteUser(orgId);

  const handleSubmit = (values: InviteUserFormValues) => {
    const invitation: Omit<UserInvitationRequest, "id"> = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      roles: values.roles,
    };
    inviteUserMutation.mutate(invitation, {
      onSuccess: () => {
        onClose();
        form.reset();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value[0]}
                      disabled
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || inviteUserMutation.isPending
                }
              >
                {inviteUserMutation.isPending ? "Inviting..." : "Invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
