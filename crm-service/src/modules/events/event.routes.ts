import { Router } from "express";
import { list } from "./event.controller";
const r = Router();
r.get("/", list);
export default r;
