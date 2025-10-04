// database.ts
import { Injectable } from "@kernel/decorators/Injectable";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { AppConfig } from "@shared/config/AppConfig";

@Injectable()
export class DatabaseService {
  public readonly db: NeonDatabase;

  constructor(private readonly config: AppConfig) {
    const url = this.config.db?.url;
    if (!url) {
      throw new Error("DATABASE_URL não configurada em AppConfig.database.url");
    }

    // Neon serverless client com cache de conexão para permitir transações
    neonConfig.fetchConnectionCache = true;

    const pool = new Pool({ connectionString: url });

    this.db = drizzle(pool);
  }
}
