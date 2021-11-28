export default class Identifier {
  constructor(digit, siteID) {
    this.digit = digit;
    this.siteID = siteID;
  }

  compareTo(otherID) {
    if (this.digit < otherID.digit) {
      return -1;
    } else if (this.digit > otherID.digit) {
      return 1;
    } else {
      return this.siteID.localeCompare(otherID.siteID);
    }
  }
}
