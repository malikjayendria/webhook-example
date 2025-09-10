import { Request, Response, NextFunction } from "express";
import { handleWebhook } from "./pms.webhook.service";
import { ok, fail } from "../../shared/http";

export async function receive(req: Request, res: Response, next: NextFunction) {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Headers:", req.headers);
  console.log("Raw body available:", !!(req as any).rawBody);
  console.log("Body:", req.body);
  try {
    await handleWebhook(req);
    res.status(202).json(ok({ received: true })); // 202 Accepted
  } catch (e: any) {
    console.log("Webhook error:", e.message);
    next(e);
  }
}
