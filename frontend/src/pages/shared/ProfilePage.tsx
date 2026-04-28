import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMe, useUpdateMe, useChangePassword } from "@/hooks/users/useMe";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, Users, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
    const { t } = useTranslation();
    const { roles: authRoles } = useAuth();
    const { data: user, isLoading } = useMe();
    const updateMeMutation = useUpdateMe();
    const changePasswordMutation = useChangePassword();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    React.useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [user]);

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateMeMutation.mutate({ first_name: firstName, last_name: lastName });
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return;
        }
        changePasswordMutation.mutate({ old_password: oldPassword, new_password: newPassword }, {
            onSuccess: () => {
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        });
    };

    if (isLoading) return <LoadingSpinner className="min-h-[400px]" />;

    return (
        <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                        {t("profile.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        {t("profile.subtitle")}
                    </p>
                </div>
            </div>

            {/* Account Roles */}
            <div className="flex flex-wrap gap-2 mb-6">
                {authRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/10 flex items-center gap-1.5 capitalize font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {role.replace(/_/g, " ")}
                    </Badge>
                ))}
            </div>

            <div className="grid gap-8">
                {/* Personal Information */}
                <Card className="border-primary/5 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <User className="w-5 h-5 text-primary" />
                            {t("profile.personal_info")}
                        </CardTitle>
                        <CardDescription>
                            {t("profile.personal_info_desc")}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdateProfile}>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-sm font-medium">{t("profile.firstName")}</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-sm font-medium">{t("profile.lastName")}</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">{t("profile.username")}</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        value={user?.username || ""}
                                        disabled
                                        className="pl-10 bg-muted/50 font-mono text-xs cursor-not-allowed border-muted"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">{t("profile.email")}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="pl-10 bg-muted/50 font-mono text-xs cursor-not-allowed border-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/5 border-t border-muted p-6">
                            <Button
                                type="submit"
                                disabled={updateMeMutation.isPending}
                                className="w-full sm:w-auto min-w-[140px]"
                            >
                                {updateMeMutation.isPending ? t("common.saving") : t("profile.update_profile")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Security / Password */}
                <Card className="border-primary/5 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <Lock className="w-5 h-5 text-primary" />
                            {t("profile.security")}
                        </CardTitle>
                        <CardDescription>
                            {t("profile.password_change_desc")}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleChangePassword}>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">{t("profile.old_password")}</Label>
                                <div className="relative">
                                    <Input
                                        id="oldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">{t("profile.new_password")}</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t("profile.confirm_password")}</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm font-medium text-destructive animate-pulse">
                                    {t("profile.password_mismatch")}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/5 border-t border-muted p-6">
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full sm:w-auto min-w-[140px] border-primary/20 hover:bg-primary/5"
                                disabled={changePasswordMutation.isPending || !newPassword || newPassword !== confirmPassword}
                            >
                                {changePasswordMutation.isPending ? t("common.saving") : t("profile.change_password_btn")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
