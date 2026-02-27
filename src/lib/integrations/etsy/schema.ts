import { z } from "zod";

export const etsyWebhookPayloadSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  timestamp: z.union([z.number(), z.string()]),
  shop_id: z.union([z.string(), z.number()]),
  listing_id: z.union([z.string(), z.number()]),
  delivery_id: z.string().optional(),
});

export type EtsyWebhookPayload = z.infer<typeof etsyWebhookPayloadSchema>;

export interface EtsyListingInventory {
  products: Array<{
    product_id?: number | string;
    sku?: string[];
    offerings?: Array<{
      quantity?: number;
      offering_id?: number | string;
    }>;
  }>;
}
