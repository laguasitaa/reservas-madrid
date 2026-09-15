-- Agrega nombre de huésped a cada reserva (solo identificación, sin
-- teléfono ni datos de contacto).

alter table reservations add column if not exists guest_name text;
