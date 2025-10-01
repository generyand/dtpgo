import { initializeDatabase } from "@/lib/db/connection-check";

// Initialize database connection check on server startup
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}
