import { getEtsyConfig } from "./config";
import { EtsyListingInventory } from "./schema";

type EtsyTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

const ETSY_BASE_URL = "https://openapi.etsy.com/v3";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 5;
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= maxAttempts) {
        break;
      }
      const waitMs = Math.min(2000, 250 * 2 ** (attempt - 1));
      await sleep(waitMs);
    }
  }

  throw lastError;
}

export class EtsyApiClient {
  private accessToken: string;
  private refreshToken?: string;
  private readonly clientId: string;
  private readonly clientSecret?: string;

  constructor() {
    const cfg = getEtsyConfig();
    this.accessToken = cfg.accessToken;
    this.refreshToken = cfg.refreshToken;
    this.clientId = cfg.clientId;
    this.clientSecret = cfg.clientSecret;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("ETSY_OAUTH_REFRESH_TOKEN is missing; cannot refresh access token");
    }

    const response = await fetch("https://api.etsy.com/v3/public/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        refresh_token: this.refreshToken,
        ...(this.clientSecret ? { client_secret: this.clientSecret } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Etsy token refresh failed with status ${response.status}`);
    }

    const payload = (await response.json()) as EtsyTokenResponse;
    this.accessToken = payload.access_token;
    this.refreshToken = payload.refresh_token ?? this.refreshToken;
    return this.accessToken;
  }

  async getListingInventory(listingId: string): Promise<EtsyListingInventory> {
    return withRetry(async () => {
      const response = await fetch(`${ETSY_BASE_URL}/application/listings/${listingId}/inventory`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "x-api-key": this.clientId,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        await this.refreshAccessToken();
        throw new Error("Unauthorized; refreshed token and retrying");
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        if (retryAfter > 0) {
          await sleep(retryAfter * 1000);
        }
        throw new Error(`Etsy API retryable status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`Etsy getListingInventory failed with status ${response.status}`);
      }

      return (await response.json()) as EtsyListingInventory;
    });
  }
}
