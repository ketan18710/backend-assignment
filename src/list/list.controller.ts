import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListService } from './list.service';
import { AddToListDto, CreateListItemDto } from './dto/create-list-item.dto';
import { ListQueryDto } from './dto/list-query.dto';

@ApiTags('List')
@Controller('users/:username/list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  @ApiParam({
    name: 'username',
    description: 'Username of the user adding the item',
  })
  @ApiResponse({
    status: 0,
    description: 'Item successfully added to list',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Item already exists in the list',
  })
  async addToList(
    @Param('username') username: string,
    @Body() addToListDto: AddToListDto,
  ) {
    return this.listService.addToList(username, addToListDto.listItem);
  }

  @Get()
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved user's list",
  })
  async listMyItems(
    @Param('username') username: string,
    @Query() query: ListQueryDto,
  ) {
    return this.listService.listMyItems(username, query);
  }

  @Delete()
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Item successfully removed from list',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found in list',
  })
  async removeFromList(
    @Param('username') username: string,
    @Body() createListItemDto: CreateListItemDto,
  ) {
    return this.listService.removeFromList(username, createListItemDto);
  }
}
