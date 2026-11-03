import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { fetchItems } from "@/lib/items";
import ShoppingList from "@/components/ShoppingList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  if (!user) redirect("/login");

  const items = await fetchItems();
  return <ShoppingList user={user} initialItems={items} />;
}
