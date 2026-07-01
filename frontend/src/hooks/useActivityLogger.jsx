import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function useActivityLogger() {
  const location = useLocation();

  useEffect(() => {
    async function logPageView() {
      try {
        const userStr = localStorage.getItem("user");
        let user_id = null;
        let user_name = "Anonymous";
        let role = "guest";

        if (userStr) {
          const user = JSON.parse(userStr);
          user_id = user.id || user._id;
          user_name = user.name || "Anonymous";
          role = user.role || "guest";
        }

        // Avoid logging repeated hits to the same page too aggressively if needed,
        // but for now, we just log on every route change.
        await fetch(`${API_URL}/api/v1/stats/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            user_name,
            role,
            action: "PAGE_VIEW",
            details: location.pathname,
          }),
        });
      } catch (err) {
        // Silently fail for analytics to not disrupt user experience
        console.error("Activity logging failed:", err);
      }
    }

    logPageView();
  }, [location.pathname]);
}
