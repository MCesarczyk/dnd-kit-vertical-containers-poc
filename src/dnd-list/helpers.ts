import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "./types";

export const getColor = (id: UniqueIdentifier) => {
  switch (String(id)[0]) {
    case "1":
      return "#ef769f";
    case "2":
      return "#ffda6c";
    case "3":
      return "#00bcd4";
    case "4":
      return "#7193f1";
  }

  return undefined;
}

export const findContainer = (items: Items, id: UniqueIdentifier) => {
  if (id in items) {
    return id;
  }

  return Object.keys(items).find((key) => items[key].includes(id));
};

export const getIndex = (items: Items, id: UniqueIdentifier) => {
  const container = findContainer(items, id);

  if (!container) {
    return -1;
  }

  const index = items[container].indexOf(id);

  return index;
};

export const getNextContainerId = (items: Items, offset?: number) => {
  const containerIds = Object.keys(items);
  const lastContainerId = containerIds[containerIds.length - 1];
  const sanitizedId = lastContainerId.replace(/[^0-9]/g, "");

  return `${parseInt(sanitizedId) + 1 + (offset || 0)}-container`;
}

export const getNewFakeContainerId = (items: Items, index?: number) => {
  const newContainerIdRaw = getNextContainerId(items, index);
  const newContainerId = newContainerIdRaw.replace(
    "-container",
    "-fake-container"
  );

  return newContainerId;
};
