import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";

export default async function Home() {
  const user = await getUserFromToken();
  redirect(user ? "/dashboard" : "/login");
}
