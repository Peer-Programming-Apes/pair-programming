import Version from "./version";

export default class VersionVector {
  constructor(siteID) {
    this.localVersion = new Version(siteID);
    this.versions = [this.localVersion];
  }

  increment() {
    this.localVersion.counter++;
  }

  // Update vector with new version received from another site
  update(incomingVersion) {
    let existingVersion = this.getVersionFromVectors(incomingVersion);

    if (!existingVersion) {
      const newVersion = new Version(incomingVersion.siteID);
      newVersion.update(incomingVersion);
      this.versions.push(newVersion);
    } else {
      existingVersion.update(incomingVersion);
    }
  }

  // Check if the incoming remote operation has already been applied to our crdt
  hasBeenApplied(incomingVersion) {
    let localIncomingVersion = this.getVersionFromVectors(incomingVersion);
    if (!localIncomingVersion) {
      return false;
    }

    const isIncomingLower =
      incomingVersion.counter <= localIncomingVersion.counter;
    const isInExceptions =
      localIncomingVersion.exceptions.indexOf(incomingVersion.counter) >= 0;
    return isIncomingLower && !isInExceptions;
  }

  getVersionFromVectors(version) {
    let localVersion = null;
    for (let i = 0; i < this.versions.length; i++) {
      if (this.versions[i].siteID === version.siteID) {
        localVersion = this.versions[i];
        break;
      }
    }
    return localVersion;
  }

  getLocalVersion() {
    const localVersion = new Version(this.localVersion.siteID);
    localVersion.counter = this.localVersion.counter;
    return localVersion;
  }
}
