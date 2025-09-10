import { Router } from "express";
import * as ctrl from "./reservation.controller";
const r = Router();

r.post("/", ctrl.create);
r.get("/", ctrl.list);
r.get("/:id", ctrl.detail);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

export default r;
