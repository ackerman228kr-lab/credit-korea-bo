import type { Branch, Offer, RequestStatus, Settings, ValuationRequest } from "../types";

export interface Repository {
  getSettings(): Promise<Settings>;
  saveSettings(s: Omit<Settings, "updatedAt">): Promise<Settings>;

  listBranches(all?: boolean): Promise<Branch[]>;
  upsertBranch(b: Branch): Promise<void>;
  deleteBranch(id: string): Promise<void>;

  listOffers(all?: boolean): Promise<Offer[]>;
  upsertOffer(o: Offer): Promise<void>;
  deleteOffer(id: string): Promise<void>;

  listRequests(): Promise<ValuationRequest[]>;
  createRequest(r: ValuationRequest): Promise<void>;
  updateRequest(id: string, patch: { status?: RequestStatus; note?: string | null }): Promise<void>;
  deleteRequest(id: string): Promise<void>;

  /** Store an uploaded photo, returning its storage key. */
  uploadPhoto(name: string, data: ArrayBuffer, contentType: string): Promise<string>;
  /** Resolve a storage key to a URL the admin can view. */
  photoUrl(key: string): Promise<string>;
}
