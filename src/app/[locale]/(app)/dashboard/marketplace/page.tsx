import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MarketplacePanel } from "@/components/marketplace/MarketplacePanel";
import {
  getAllPublishedTags,
  getPublishedTopics,
  getTutorRoomsForCopy,
} from "@/lib/marketplace-topics";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ roomId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    redirect(localePath(locale, "/dashboard"));
  }

  const [topics, availableTags, rooms] = await Promise.all([
    getPublishedTopics(),
    getAllPublishedTags(),
    getTutorRoomsForCopy(session.user.id),
  ]);

  return (
    <MarketplacePanel
      locale={locale}
      topics={topics}
      availableTags={availableTags}
      rooms={rooms}
      preselectedRoomId={query.roomId ?? null}
    />
  );
}
