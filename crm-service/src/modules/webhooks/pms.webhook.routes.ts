import { Router } from "express";
import { receive } from "./pms.webhook.controller";
import { jsonWithRaw } from "../../shared/raw-body";

const r = Router();

// gunakan jsonWithRaw agar rawBody tersedia untuk verifikasi HMAC
r.post("/pms", jsonWithRaw, receive);

export default r;
