import { Router } from "express";
import guestRoutes from "./modules/guests/guest.routes";
import reservationRoutes from "./modules/reservations/reservation.routes";

const router = Router();

router.use("/guests", guestRoutes);
router.use("/reservations", reservationRoutes);

export default router;
