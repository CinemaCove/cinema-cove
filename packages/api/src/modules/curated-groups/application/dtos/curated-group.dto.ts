import { CuratedGroupEntity, FranchiseListItem } from '../../domain/entities/curated-group.entity';

export class CuratedGroupDto {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly imagePath: string | null;
  public readonly icon: string;
  public readonly order: number;
  public readonly lists: FranchiseListItem[];
  public readonly changeVersion: number;

  constructor(entity: CuratedGroupEntity) {
    this.id = entity.id!;
    this.name = entity.name;
    this.description = entity.description;
    this.imagePath = entity.imagePath;
    this.icon = entity.icon;
    this.order = entity.order;
    this.lists = entity.lists;
    this.changeVersion = entity.changeVersion;
  }
}
