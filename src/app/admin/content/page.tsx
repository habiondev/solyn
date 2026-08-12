import { prisma } from "@/lib/prisma";
import { ContentClient, type ContentAsset } from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const assets = await prisma.siteAsset.findMany({
    orderBy: [{ category: "asc" }, { id: "asc" }],
  });
  const initial: ContentAsset[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    category: a.category,
    meta: (a.meta as any) ?? null,
    updatedAt: a.updatedAt.toISOString(),
  }));
  return <ContentClient initial={initial} />;
}
