import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePendingSyncCount } from "@/hooks/usePendingSyncCount";
import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OfflineBanner = () => {
  const { isOffline } = useOnlineStatus();
  const pendingCount = usePendingSyncCount();
  const { t } = useTranslation();

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium ${
        isOffline
          ? "bg-amber-50 text-amber-800 border-b border-amber-200"
          : "bg-blue-50 text-blue-800 border-b border-blue-200"
      }`}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>
            {t("offline.globalBanner", {
              defaultValue:
                "You are offline. Your work is saved locally and will sync when you reconnect.",
            })}
            {pendingCount > 0 &&
              ` (${pendingCount} ${t("offline.pendingItems", { defaultValue: "item(s) pending sync" })})`}
          </span>
        </>
      ) : (
        <>
          <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>
            {t("offline.syncing", {
              count: pendingCount,
              defaultValue: `Syncing ${pendingCount} saved item(s)…`,
            })}
          </span>
        </>
      )}
    </div>
  );
};
