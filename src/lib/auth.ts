import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getUserFromToken() {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("siftly_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; email: string };
  } catch (error) {
    return null;
  }
}