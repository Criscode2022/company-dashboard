import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import {
  Client,
  CompanyStats,
  DailyMemory,
  DailyProgress,
  Feature,
  Project,
  Version,
} from "../models";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.databaseUrl.replace(/\/+$/, "");
  private readonly schema = environment.databaseSchema || "public";

  private getHeaders(options?: { write?: boolean }): HttpHeaders {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Profile": this.schema,
    };

    // Add API key for Neon Data API CORS
    const apiKey = (environment as any).apiKey;
    if (apiKey) {
      headers["apikey"] = apiKey;
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (options?.write) {
      headers["Content-Profile"] = this.schema;
      headers["Prefer"] = "return=representation";
      headers["Content-Type"] = "application/json";
    }

    return new HttpHeaders(headers);
  }

  // ==================== CLIENTS ====================
  async getClients(): Promise<Client[]> {
    return this.select<Client>("clients", {
      order: "name",
    });
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.selectOne<Client>("clients", {
      filters: { id: `eq.${id}` },
    });
  }

  async createClient(
    client: Omit<Client, "id" | "created_at" | "updated_at">,
  ): Promise<Client> {
    return this.insert<Client>("clients", client);
  }

  // ==================== PROJECTS ====================
  async getProjects(clientId?: string): Promise<Project[]> {
    const filters: Record<string, string> = {};
    if (clientId) {
      filters["client_id"] = `eq.${clientId}`;
    }

    return this.select<Project>("projects", {
      order: "created_at.desc",
      filters,
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.selectOne<Project>("projects", {
      filters: { id: `eq.${id}` },
    });
  }

  async createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project> {
    return this.insert<Project>("projects", project);
  }

  async updateProject(
    id: string,
    data: Partial<Project>,
  ): Promise<Project | undefined> {
    return this.update<Project>("projects", id, data);
  }

  // ==================== DAILY PROGRESS ====================
  async getDailyProgress(
    projectId?: string,
    days: number = 30,
  ): Promise<DailyProgress[]> {
    const filters: Record<string, string> = {};
    if (projectId) {
      filters["project_id"] = `eq.${projectId}`;
    }

    // Get last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    filters["date"] = `gte.${startDate.toISOString().split("T")[0]}`;

    return this.select<DailyProgress>("daily_progress", {
      order: "date.desc",
      filters,
    });
  }

  async addDailyProgress(
    progress: Omit<DailyProgress, "id" | "created_at">,
  ): Promise<DailyProgress> {
    return this.insert<DailyProgress>("daily_progress", progress);
  }

  // ==================== VERSIONS ====================
  async getVersions(projectId: string): Promise<Version[]> {
    return this.select<Version>("versions", {
      filters: { project_id: `eq.${projectId}` },
      order: "created_at.desc",
    });
  }

  async createVersion(
    version: Omit<Version, "id" | "created_at">,
  ): Promise<Version> {
    return this.insert<Version>("versions", version);
  }

  // ==================== FEATURES ====================
  async getFeatures(projectId: string): Promise<Feature[]> {
    return this.select<Feature>("features", {
      filters: { project_id: `eq.${projectId}` },
      order: "priority.asc,created_at.desc",
    });
  }

  async createFeature(
    feature: Omit<Feature, "id" | "created_at">,
  ): Promise<Feature> {
    return this.insert<Feature>("features", feature);
  }

  async updateFeature(
    id: string,
    data: Partial<Feature>,
  ): Promise<Feature | undefined> {
    return this.update<Feature>("features", id, data);
  }

  // ==================== DAILY MEMORY ====================
  async getDailyMemories(): Promise<DailyMemory[]> {
    return this.select<DailyMemory>("daily_memory", {
      order: "date.desc",
    });
  }

  async getDailyMemory(date: string): Promise<DailyMemory | undefined> {
    return this.selectOne<DailyMemory>("daily_memory", {
      filters: { date: `eq.${date}` },
    });
  }

  async createDailyMemory(
    memory: Omit<DailyMemory, "id" | "created_at" | "updated_at">,
  ): Promise<DailyMemory> {
    return this.insert<DailyMemory>("daily_memory", memory);
  }

  // ==================== COMPANY STATS ====================
  async getCompanyStats(days: number = 30): Promise<CompanyStats[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.select<CompanyStats>("company_stats", {
      filters: { date: `gte.${startDate.toISOString().split("T")[0]}` },
      order: "date.asc",
    });
  }

  async getLatestStats(): Promise<CompanyStats | undefined> {
    return this.selectOne<CompanyStats>("company_stats", {
      order: "date.desc",
    });
  }

  // ==================== GENERIC CRUD ====================
  async select<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, string>;
      order?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<T[]> {
    const url = `${this.baseUrl}/${table}`;
    let params = new HttpParams();

    if (options?.select) {
      params = params.set("select", options.select);
    }

    if (options?.order) {
      params = params.set("order", options.order);
    }

    if (typeof options?.limit === "number") {
      params = params.set("limit", String(options.limit));
    }

    if (typeof options?.offset === "number") {
      params = params.set("offset", String(options.offset));
    }

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined) {
          params = params.set(key, value);
        }
      }
    }

    return firstValueFrom(
      this.http.get<T[]>(url, {
        params,
        headers: this.getHeaders(),
      }),
    );
  }

  async selectOne<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, string>;
      order?: string;
    },
  ): Promise<T | undefined> {
    const rows = await this.select<T>(table, { ...options, limit: 1 });
    return rows[0];
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/${table}`;
    const rows = await firstValueFrom(
      this.http.post<T[]>(url, data, {
        headers: this.getHeaders({ write: true }),
      }),
    );
    if (!rows?.[0]) {
      throw new Error("Insert failed: no row returned");
    }
    return rows[0];
  }

  async update<T>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T | undefined> {
    if (Object.keys(data).length === 0) {
      return this.selectOne<T>(table, { filters: { id: `eq.${id}` } });
    }

    const url = `${this.baseUrl}/${table}`;
    const params = new HttpParams().set("id", `eq.${id}`);

    const rows = await firstValueFrom(
      this.http.patch<T[]>(url, data, {
        params,
        headers: this.getHeaders({ write: true }),
      }),
    );
    return rows?.[0];
  }

  async delete<T>(table: string, id: string): Promise<T | undefined> {
    const url = `${this.baseUrl}/${table}`;
    const params = new HttpParams().set("id", `eq.${id}`);

    const rows = await firstValueFrom(
      this.http.delete<T[]>(url, {
        params,
        headers: this.getHeaders({ write: true }),
      }),
    );

    return rows?.[0];
  }
}
