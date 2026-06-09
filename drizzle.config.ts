import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models/schema.ts",
  out: "./src/models",
  schemaFilter: ["nodeapi"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // remove ssl entirely
  },
});
