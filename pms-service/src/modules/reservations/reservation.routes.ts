import { Router } from "express";
import * as ctrl from "./reservation.controller";

const r = Router();

// Basic CRUD operations
r.post("/", ctrl.create);
r.get("/", ctrl.list);
r.get("/:id", ctrl.detail);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

// Advanced filtering and search
r.get("/guest/:guestId", ctrl.getByGuest);
r.get("/status/:status", ctrl.getByStatus);
r.get("/upcoming/list", ctrl.getUpcoming);
r.get("/stats/overview", ctrl.getStats);

export default r;
