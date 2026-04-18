import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { PlusCircle } from "lucide-react";
import { useAddCooperationUser } from "@/hooks/cooperationUsers/useAddCooperationUser";
import { AddCooperationUser } from "@/types/cooperationUser";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";

/**
 * Dialog form for inviting a new user into a cooperative.
 * Automatically assigns the correct role based on the current user's role.
 */
export const AddCooperationUserForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedDimensionIds, setSelectedDimensionIds] = useState<string[]>(
    [],
  );
  const { t } = useTranslation();
  const { mutate: addUser, isPending } = useAddCooperationUser();
  const { user: currentUser } = useAuth();
  const { cooperationId } = useParams<{ cooperationId: string }>();
  const organizationIdFromHook = useOrganizationId();
  const organizationId =
    currentUser?.organization || organizationIdFromHook || "";

  const { data: dimensions = [] } = useDimensions();
  const { data: assignedDimensionIds = [] } =
    useOrganizationDimensions(organizationId);

  const filteredDimensions = dimensions.filter((d) =>
    assignedDimensionIds.includes(d.id),
  );

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
      dimensionIds: newUserRole === ROLES.COOP_USER ? selectedDimensionIds : [],
    };
    addUser(
      { user, cooperationId },
      {
        onSuccess: () => {
          toast.success(t("secondAdminCooperationUsers.add.toast.success"));
          setIsOpen(false);
          setEmail("");
          setFirstName("");
          setLastName("");
          setSelectedDimensionIds([]);
        },
        onError: (error) => {
          toast.error(error.message || t("secondAdminCooperationUsers.add.toast.error"));
        },
      },
    );
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const triggerLabel = isPending
    ? t("secondAdminCooperationUsers.add.triggerLabel.inviting")
    : t("secondAdminCooperationUsers.add.triggerLabel.add");

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
            {t("secondAdminCooperationUsers.add.title")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("secondAdminCooperationUsers.add.description")}
          </p>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-4"
          aria-label={t("secondAdminCooperationUsers.add.form.ariaLabel")}
        >
          <div className="space-y-2">
            <Label htmlFor="coop-user-email">
              {t("secondAdminCooperationUsers.add.form.emailLabel")} <span className="text-destructive">*</span>
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
              <Label htmlFor="coop-user-first-name">{t("secondAdminCooperationUsers.add.form.firstNameLabel")}</Label>
              <Input
                id="coop-user-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("secondAdminCooperationUsers.add.form.firstNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coop-user-last-name">{t("secondAdminCooperationUsers.add.form.lastNameLabel")}</Label>
              <Input
                id="coop-user-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("secondAdminCooperationUsers.add.form.lastNamePlaceholder")}
              />
            </div>
          </div>
          {newUserRole === ROLES.COOP_USER && (
            <div className="space-y-2">
              <Label>{t("secondAdminCooperationUsers.add.form.dimensionsLabel")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("secondAdminCooperationUsers.add.form.dimensionsDescription")}
              </p>
              <div className="mt-2 grid gap-2 max-h-56 overflow-y-auto rounded-md border bg-muted/40 p-3">
                {filteredDimensions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("secondAdminCooperationUsers.add.form.noDimensions")}
                  </p>
                )}
                {filteredDimensions.map((dimension) => (
                  <label
                    key={dimension.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedDimensionIds.includes(dimension.id)}
                      onCheckedChange={(checked) => {
                        setSelectedDimensionIds((prev) =>
                          checked
                            ? [...prev, dimension.id]
                            : prev.filter((id) => id !== dimension.id),
                        );
                      }}
                    />
                    <span>{dimension.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="coop-user-role">{t("secondAdminCooperationUsers.add.form.roleLabel")}</Label>
            <Input
              id="coop-user-role"
              value={
                newUserRole
                  ? newUserRole === ROLES.COOP_ADMIN
                    ? t("secondAdminCooperationUsers.add.form.roleCoopAdmin")
                    : t("secondAdminCooperationUsers.add.form.roleCoopUser")
                  : t("secondAdminCooperationUsers.add.form.noRole")
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
              {t("secondAdminCooperationUsers.add.form.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !newUserRole}
              className="w-full sm:w-auto"
            >
              {isPending ? t("secondAdminCooperationUsers.add.form.adding") : t("secondAdminCooperationUsers.add.form.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
