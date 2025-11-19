import { KeycloakUser } from "@/types/user";
import { UserTable } from "@/components/shared/users/UserTable";

interface UserListProps {
  users: KeycloakUser[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return <UserTable users={users} />;
};
