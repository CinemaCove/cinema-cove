import { CuratedListEntity } from '../entities/curated-list.entity';

export abstract class CuratedListsRepository {
  abstract findAll(): Promise<CuratedListEntity[]>;
  abstract findById(id: string): Promise<CuratedListEntity | null>;
}
