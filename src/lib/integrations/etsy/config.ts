export interface EtsyConfig {
  clientId: string;
  clientSecret?: string;
  apiKey?: string;
  accessToken: string;
  refreshToken?: string;
  webhookSigningSecret?: string;
  shopId: string;
}

export function getEtsyConfig(): EtsyConfig {
  const accessToken = process.env.ETSY_OAUTH_ACCESS_TOKEN ?? "";
  const shopId = process.env.ETSY_SHOP_ID ?? "";
  const clientId = process.env.ETSY_CLIENT_ID ?? "";

  if (!accessToken || !shopId || !clientId) {
    throw new Error("Missing required Etsy configuration (ETSY_CLIENT_ID, ETSY_OAUTH_ACCESS_TOKEN, ETSY_SHOP_ID)");
  }

  return {
    clientId,
    clientSecret: process.env.ETSY_CLIENT_SECRET,
    apiKey: process.env.ETSY_API_KEY,
    accessToken,
    refreshToken: process.env.ETSY_OAUTH_REFRESH_TOKEN,
    webhookSigningSecret: process.env.ETSY_WEBHOOK_SIGNING_SECRET,
    shopId,
  };
}
