import { CuratedListEntity } from '../../domain/entities/curated-list.entity';

export class CuratedListDto {
  public readonly id: string;
  public readonly tmdbListId: string;
  public readonly name: string;
  public readonly description: string;
  public readonly imagePath: string | null;
  public readonly icon: string;
  public readonly order: number;

  constructor(entity: CuratedListEntity) {
    this.id = entity.id!;
    this.tmdbListId = entity.tmdbListId;
    this.name = entity.name;
    this.description = entity.description;
    this.imagePath = entity.imagePath;
    this.icon = entity.icon;
    this.order = entity.order;
  }
}
