import Identifier from "./identifier.mjs";

export default class Char {
  constructor(
    value,
    counter,
    siteID,
    position
  ) {
    this.value = value;
    this.counter = counter;
    this.siteID = siteID;
    this.position = position;
  }

  compareTo(otherChar) {
    let comp, id1, id2;
    const pos1 = this.position;
    const pos2 = otherChar.position;
    const minLength = Math.min(pos1.length, pos2.length);
    for (let i = 0; i < minLength; i++) {
      id1 = pos1[i];
      id2 = pos2[i];
      comp = id1.compareTo(id2);
      if (comp !== 0) {
        return comp;
      }
    }
    if (pos1.length < pos2.length) {
      return -1;
    } else if (pos1.length > pos2.length) {
      return 1;
    } else {
      return 0;
    }
  }
}
