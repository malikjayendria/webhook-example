import { Router } from "express";
import webhookRoutes from "./modules/webhooks/pms.webhook.routes";
import eventRoutes from "./modules/events/event.routes";
import guestProfileRoutes from "./modules/guest_profiles/guest_profile.routes";

const router = Router();

router.use("/webhooks", webhookRoutes);
router.use("/events", eventRoutes);
router.use("/guest-profiles", guestProfileRoutes);

export default router;
