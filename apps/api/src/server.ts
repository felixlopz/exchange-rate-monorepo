import app from "./app";
import { createTables } from "./config/database";
import { startScheduler } from "./jobs/scheduler";
import config from "./config/enviroment";

const PORT = config.PORT;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await createTables();

    // Start scheduler for auto-scraping
    startScheduler();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
