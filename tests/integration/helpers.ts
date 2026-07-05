import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3001";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export async function getSeededUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Seeded user ${email} not found — did the test DB get seeded?`);
  return user;
}

export async function loginAs(email: string): Promise<{ cookie: string; userId: string }> {
  const user = await getSeededUser(email);
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!res.ok || !setCookie) {
    throw new Error(`Login failed for ${email}: ${res.status}`);
  }
  return { cookie: setCookie.split(";")[0], userId: user.id };
}

export function authedFetch(cookie: string) {
  return (path: string, init: RequestInit = {}) =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Cookie: cookie },
    });
}
