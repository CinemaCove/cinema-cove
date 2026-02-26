export class CuratedListEntity {
  public id: string | null = null;
  public tmdbListId: string = '';
  public name: string = '';
  public description: string = '';
  public imagePath: string | null = null;
  public icon: string = '';
  public order: number = 0;
  public unified: boolean = false;
  public changeVersion: number = 1;
}
