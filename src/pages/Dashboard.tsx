import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Dashboard — redirects to /dashboard which now uses RoutePlanner.
 * Kept for backward compatibility with auth redirects.
 */
export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Redirecting to Route Planner...</div>
    </div>
  );
}
