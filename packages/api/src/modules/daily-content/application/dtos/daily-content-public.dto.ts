import { DailyContentEntity, DailyContentType } from '../../domain/entities/daily-content.entity';

export class DailyContentPublicDto {
  public readonly id: string;
  public readonly type: DailyContentType;
  public readonly title: string;
  public readonly question?: string;
  public readonly choices?: string[];
  public readonly correctChoiceIndex?: number;
  public readonly explanation?: string;
  public readonly content?: string;
  public readonly imageUrl?: string;
  public readonly publishAt: string;

  constructor(entity: DailyContentEntity) {
    this.id = entity.id!;
    this.type = entity.type;
    this.title = entity.title;
    this.question = entity.question;
    this.choices = entity.choices;
    this.correctChoiceIndex = entity.correctChoiceIndex;
    this.explanation = entity.explanation;
    this.content = entity.content;
    this.imageUrl = entity.imageUrl;
    this.publishAt = entity.publishAt.toISOString();
  }
}
