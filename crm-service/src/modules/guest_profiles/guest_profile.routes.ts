import { Router } from "express";
import { list } from "./guest_profile.controller";
const r = Router();
r.get("/", list);
export default r;
