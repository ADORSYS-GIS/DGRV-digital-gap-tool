import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AddCooperationUserForm } from "@/components/second_admin/cooperationUsers/AddCooperationUserForm";
import { CooperationUserList } from "@/components/second_admin/cooperationUsers/CooperationUserList";
import { useCooperationUsers } from "@/hooks/cooperationUsers/useCooperationUsers";
import { useTranslation } from "react-i18next";

export default function ManageCooperationUsersPage() {
  const { t } = useTranslation();
  const { data: users, isLoading, error } = useCooperationUsers();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("manageCooperationUsersPage.title")}
        </h1>
        <AddCooperationUserForm />
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("manageCooperationUsersPage.errorMessage", { message: error.message })}
        </p>
      )}
      {users && <CooperationUserList users={users} />}
    </div>
  );
}
