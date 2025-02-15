import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.schema';
import { CreateListItemDto } from './dto/create-list-item.dto';

@Injectable()
export class ListService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async addToList(
    username: string,
    createListItemDto: CreateListItemDto,
  ): Promise<User> {
    // find the user
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check for duplicate item in the list
    const isDuplicate = user.myList.some(
      (item) =>
        item.contentId === createListItemDto.contentId &&
        item.contentType === createListItemDto.contentType,
    );

    if (isDuplicate) {
      throw new ConflictException('Item already exists in the list');
    }

    // add item to the list
    user.myList.push({
      contentId: createListItemDto.contentId,
      contentType: createListItemDto.contentType,
    });

    return user.save();
  }
}
