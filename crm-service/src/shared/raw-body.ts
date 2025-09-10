import { json } from "express";

// kita perlu raw body utk hitung HMAC atas body asli
export const jsonWithRaw = json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
});
