import { AddonConfigEntity } from '../entities';

export interface UpdateAddonConfigData {
  name?: string;
  type?: 'movie' | 'tv';
  languages?: string[];
  sort?: string;
  includeAdult?: boolean;
  minVoteAverage?: number | null;
  minVoteCount?: number | null;
  releaseDateFrom?: number | null;
  releaseDateTo?: number | null;
  installedVersion?: number | null;
}

export interface FindExistingTmdbListQuery {
  tmdbListType?: string;
  tmdbListId?: string;
  type?: string;
}

export interface FindExistingTraktListQuery {
  traktListType?: string;
  traktListId?: string;
  type?: string;
}

export abstract class AddonConfigsRepository {
  abstract findByOwner(userId: string): Promise<AddonConfigEntity[]>;
  abstract findById(id: string): Promise<AddonConfigEntity | null>;
  abstract countByOwner(userId: string): Promise<number>;
  abstract create(entity: AddonConfigEntity): Promise<AddonConfigEntity>;
  abstract update(
    id: string,
    userId: string,
    data: UpdateAddonConfigData,
  ): Promise<AddonConfigEntity | null>;
  abstract deleteByOwner(id: string, userId: string): Promise<boolean>;
  abstract findExistingTmdbList(
    userId: string,
    query: FindExistingTmdbListQuery,
  ): Promise<AddonConfigEntity | null>;
  abstract findExistingTraktList(
    userId: string,
    query: FindExistingTraktListQuery,
  ): Promise<AddonConfigEntity | null>;
  abstract findExistingFranchiseGroup(
    userId: string,
    curatedGroupId: string,
  ): Promise<AddonConfigEntity | null>;
}
