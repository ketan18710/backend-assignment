import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentType {
  MOVIE = 'Movie',
  TVSHOW = 'TVShow',
}

export class CreateListItemDto {
  @ApiProperty({
    description: 'Content ID to be added to list',
    example: 'movie123',
  })
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ContentType,
  })
  @IsNotEmpty()
  @IsEnum(ContentType)
  contentType: ContentType;
}

export class AddToListDto {
  @ApiProperty({
    description: 'List item details',
    type: CreateListItemDto,
  })
  @ValidateNested()
  @Type(() => CreateListItemDto)
  listItem: CreateListItemDto;
}
