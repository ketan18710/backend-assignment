import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListService } from './list.service';
import { AddToListDto } from './dto/create-list-item.dto';

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
    status: 200,
    description: 'Item successfully added to list',
  })
  @ApiResponse({
    status: 400,
    description: 'Item already exists in the list',
  })
  async addToList(
    @Param('username') username: string,
    @Body() addToListDto: AddToListDto,
  ) {
    const updatedUser = await this.listService.addToList(
      username,
      addToListDto.listItem,
    );

    return {
      username: updatedUser.username,
      myList: updatedUser.myList,
    };
  }
}
