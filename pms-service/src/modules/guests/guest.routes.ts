import { Router } from "express";
import * as ctrl from "./guest.controller";
import { getWebhookStatus } from "../../shared/webhook";
import { ok } from "../../shared/http";

const r = Router();

r.post("/", ctrl.create);
r.get("/", ctrl.list);
r.get("/:id", ctrl.detail);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

// Webhook monitoring endpoint
r.get("/webhook/status", (req, res) => {
  const status = getWebhookStatus();
  res.json(ok(status));
});

export default r;
