import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const CURRENT_USER_COOKIE = "currentUserId";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}
