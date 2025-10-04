// database.ts
import { Injectable } from "@kernel/decorators/Injectable";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { AppConfig } from "@shared/config/AppConfig";
import { Pool } from "@neondatabase/serverless";

@Injectable()
export class DatabaseService {
  public readonly db: NeonDatabase;
  public readonly transaction: NeonDatabase["transaction"];
  private readonly pool: Pool;

  constructor(private readonly config: AppConfig) {
    const url = this.config.db?.url;
    if (!url) {
      throw new Error("DATABASE_URL não configurada em AppConfig.database.url");
    }

    this.pool = new Pool({ connectionString: url });
    this.db = drizzle(this.pool);
    this.transaction = this.db.transaction.bind(this.db);
  }
}
