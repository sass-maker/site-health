export type SourceManifestGate = {
  dataMode: unknown;
  validationStatus: unknown;
  authoritative: unknown;
};

export function assertSourceManifestCanServe(manifest: SourceManifestGate) {
  if (
    manifest.dataMode === "official" &&
    (manifest.validationStatus !== "passed" || manifest.authoritative !== true)
  ) {
    throw new Error(
      "Official-data mode is blocked because the source validation manifest has not passed.",
    );
  }
  if (manifest.dataMode !== "demo" && manifest.dataMode !== "official") {
    throw new Error("The local database has an unsupported data mode.");
  }
}
