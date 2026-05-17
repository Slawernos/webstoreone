// Teszt környezetben töröljük a Clerk kulcsokat,
// hogy az auth middleware tesztelhetően 401-et adjon vissza
// (ne próbáljon érvénytelen kulcsokkal csatlakozni Clerkhez)
delete process.env.CLERK_SECRET_KEY;
delete process.env.CLERK_PUBLISHABLE_KEY;
