import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsDate,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateMovieDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  genres: string[];

  @ApiProperty({ format: 'date-time' }) // Important for Swagger
  @IsNotEmpty()
  @IsDateString() // Validates and converts from string
  releaseDate: string; // Keep as string in DTO for input

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  director: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  actors: string[];
}
