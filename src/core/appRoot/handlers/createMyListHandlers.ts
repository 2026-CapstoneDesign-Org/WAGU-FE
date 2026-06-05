import type { Dispatch, SetStateAction } from 'react';

import {
  deleteList,
  getListDetail,
  getMyLists,
  mapListDetailToMyList,
  mapListSummaryToMyList,
  setRepresentativeList,
  toggleListVisibility,
  updateList,
} from '../../../api/wagu';
import type { MyList } from '../../../types/myLists';
import type { AuthSession } from '../types';

type CreateMyListHandlersDeps = {
  session: AuthSession | null;
  setMyLists: Dispatch<SetStateAction<MyList[]>>;
  setMyListLikeStateById: Dispatch<SetStateAction<Record<string, boolean>>>;
};

function buildNextListsAfterDelete(lists: MyList[], targetId: string) {
  const nextLists = lists.filter((list) => list.id !== targetId);

  if (!nextLists.some((list) => list.isRepresentative) && nextLists.length > 0) {
    return nextLists.map((list, index) => ({
      ...list,
      isRepresentative: index === 0,
      isPrivate: index === 0 ? false : list.isPrivate,
    }));
  }

  return nextLists;
}

export function createMyListHandlers({
  session,
  setMyLists,
  setMyListLikeStateById,
}: CreateMyListHandlersDeps) {
  const refreshMyLists = async (accessToken: string) => {
    const summaries = await getMyLists(accessToken);
    const listHydrationResults = await Promise.all(
      summaries.map(async (summary, index) => {
        try {
          const detail = await getListDetail(accessToken, summary.id);
          return {
            isLiked: detail.isLiked ?? summary.isLiked ?? false,
            list: mapListDetailToMyList(detail, index),
          };
        } catch {
          return {
            isLiked: summary.isLiked ?? false,
            list: mapListSummaryToMyList(summary, index),
          };
        }
      }),
    );

    setMyLists(listHydrationResults.map((item) => item.list));
    setMyListLikeStateById(
      Object.fromEntries(listHydrationResults.map((item) => [item.list.id, item.isLiked])),
    );
    return listHydrationResults.map((item) => item.list);
  };

  const handleRenameMyList = async (listId: string, title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const applyLocalRename = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                title: trimmedTitle,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalRename();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRename();
      return;
    }

    await updateList(session.accessToken, parsedListId, {
      title: trimmedTitle,
    });
    applyLocalRename();
  };

  const handleToggleMyListPrivacy = async (listId: string) => {
    const applyLocalToggle = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                isPrivate: !list.isPrivate,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalToggle();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalToggle();
      return;
    }

    await toggleListVisibility(session.accessToken, parsedListId);
    applyLocalToggle();
  };

  const handleSetRepresentativeMyList = async (listId: string) => {
    const applyLocalRepresentative = () => {
      setMyLists((current) =>
        current.map((list) => ({
          ...list,
          isRepresentative: list.id === listId,
          isPrivate: list.id === listId ? false : list.isPrivate,
        })),
      );
    };

    if (!session?.accessToken) {
      applyLocalRepresentative();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRepresentative();
      return;
    }

    await setRepresentativeList(session.accessToken, parsedListId);
    applyLocalRepresentative();
  };

  const handleDeleteMyList = async (listId: string) => {
    const applyLocalDelete = () => {
      setMyLists((current) => buildNextListsAfterDelete(current, listId));
    };

    if (!session?.accessToken) {
      applyLocalDelete();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalDelete();
      return;
    }

    await deleteList(session.accessToken, parsedListId);
    applyLocalDelete();
  };

  return {
    handleDeleteMyList,
    handleRenameMyList,
    handleSetRepresentativeMyList,
    handleToggleMyListPrivacy,
    refreshMyLists,
  };
}
