export type DailyContentType = 'trivia' | 'fun-fact' | 'announcement';

export class DailyContentEntity {
  id: string | null = null;
  type: DailyContentType = 'trivia';
  title: string = '';
  question?: string;
  choices?: string[];
  correctChoiceIndex?: number;
  explanation?: string;
  content?: string;
  imageUrl?: string;
  publishAt: Date = new Date();
  expiresAt?: Date;
  createdBy: string = '';
}
