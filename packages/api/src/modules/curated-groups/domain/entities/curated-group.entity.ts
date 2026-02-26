export interface FranchiseListItem {
  name: string;
  tmdbListId: string;
  unified: boolean;
}

export class CuratedGroupEntity {
  public id: string | null = null;
  public name: string = '';
  public description: string = '';
  public imagePath: string | null = null;
  public icon: string = '';
  public order: number = 0;
  public lists: FranchiseListItem[] = [];
  public changeVersion: number = 1;
}
