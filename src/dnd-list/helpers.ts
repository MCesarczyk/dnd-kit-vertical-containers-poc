import { UniqueIdentifier } from "@dnd-kit/core";

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
