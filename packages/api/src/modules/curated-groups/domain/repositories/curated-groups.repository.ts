import { CuratedGroupEntity } from '../entities/curated-group.entity';

export abstract class CuratedGroupsRepository {
  abstract findAll(): Promise<CuratedGroupEntity[]>;
  abstract findById(id: string): Promise<CuratedGroupEntity | null>;
}
