import { AppDataSource } from "../../config/data-source";
import { Reservation } from "../../domain/reservation.entity";

export const reservationRepo = AppDataSource.getRepository(Reservation);
