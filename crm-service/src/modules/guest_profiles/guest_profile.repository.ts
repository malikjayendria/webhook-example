import { AppDataSource } from "../../config/data-source";
import { GuestProfile } from "../../domain/guest_profile.entity";
import { Between } from "typeorm";

export const gpRepo = AppDataSource.getRepository(GuestProfile);

export async function upsertGuestFromGuestPayload(p: any) {
  // p mengikuti payload PMS: { id,email,name,phone,date_of_birth,country, ... }
  let gp = await gpRepo.findOne({ where: { email: p.email } });
  if (!gp) gp = gpRepo.create({ email: p.email });
  gp.name = p.name ?? gp.name;
  gp.phone = p.phone ?? gp.phone;
  gp.date_of_birth = p.date_of_birth ?? gp.date_of_birth;
  gp.country = p.country ?? gp.country;
  return gpRepo.save(gp);
}

export async function applyReservationAggregation(p: any) {
  // p: reservation dari PMS
  // update aggregate sederhana (nights_lifetime, last_reservation, total_reservations)
  // nights: (check_out - check_in) dalam hari
  const nights = (() => {
    try {
      const ci = new Date(p.check_in);
      const co = new Date(p.check_out);
      return Math.max(0, Math.round((+co - +ci) / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  })();

  // kita butuh email untuk mengikat—PMS tidak mengirim email di reservation,
  // jadi terbaiknya payload reservation yang diemit PMS sudah menyertakan nested guest { email, ... }.
  // Untuk sekarang, fallback: cari profil by email di p.guest?.email
  const email = p.guest?.email;
  if (!email) return;

  let gp = await gpRepo.findOne({ where: { email } });
  if (!gp) gp = gpRepo.create({ email });

  gp.total_reservations = (gp.total_reservations ?? 0) + 1;
  gp.nights_lifetime = (gp.nights_lifetime ?? 0) + nights;
  gp.last_reservation = {
    room_number: p.room_number,
    check_in: p.check_in,
    check_out: p.check_out,
    status: p.status,
  };
  await gpRepo.save(gp);
}
