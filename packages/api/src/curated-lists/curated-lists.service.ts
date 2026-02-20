import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CuratedList, CuratedListDocument } from './schemas/curated-list.schema';

@Injectable()
export class CuratedListsService {
  constructor(
    @InjectModel(CuratedList.name)
    private readonly curatedListModel: Model<CuratedListDocument>,
  ) {}

  findAll(): Promise<CuratedListDocument[]> {
    return this.curatedListModel.find().sort({ order: 1 }).exec();
  }

  findById(id: string): Promise<CuratedListDocument | null> {
    return this.curatedListModel.findById(id).exec();
  }
}
