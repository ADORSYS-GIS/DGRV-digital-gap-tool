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
import { Mail, User, Shield, UserPlus } from "lucide-react";

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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Invite User
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              Send an invitation to add a new user to the organization.
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="John"
                            className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                            {...field}
                          />
                        </div>
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
                      <FormLabel className="text-gray-700">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Doe"
                            className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Role</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={field.value[0]}
                          disabled
                          className="pl-10 h-11 rounded-lg bg-gray-50 border-gray-200 text-gray-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid || inviteUserMutation.isPending
                  }
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {inviteUserMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Inviting...
                    </span>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
