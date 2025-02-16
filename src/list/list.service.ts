import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.schema';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { ListQueryDto } from './dto/list-query.dto';

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

  async listMyItems(username: string, query: ListQueryDto) {
    // find the user
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // apply pagination
    const { limit = 10, offset = 0 } = query;
    const paginatedList = user.myList.slice(offset, offset + limit);

    return {
      total: user.myList.length,
      limit,
      offset,
      items: paginatedList,
    };
  }

  async removeFromList(
    username: string,
    createListItemDto: CreateListItemDto,
  ): Promise<User> {
    // find the user
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // find the index of the item to remove
    const itemIndex = user.myList.findIndex(
      (item) =>
        item.contentId === createListItemDto.contentId &&
        item.contentType === createListItemDto.contentType,
    );

    // if item not found, throw an error
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in the list');
    }

    // remove the item
    user.myList.splice(itemIndex, 1);

    return user.save();
  }
}
