import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "./types";

export const  getColor = (id: UniqueIdentifier) => {
  switch (String(id)[0]) {
    case "A":
      return "#ef769f";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#7193f1";
  }

  return undefined;
}

export const getNextContainerId = (items: Items) => {
  const containerIds = Object.keys(items);
  const lastContainerId = containerIds[containerIds.length - 1];
  const sanitizedId = lastContainerId.replace(/[^A-Z]/g, "");

  return `${String.fromCharCode(sanitizedId.charCodeAt(0) + 1)}-container`;
}
