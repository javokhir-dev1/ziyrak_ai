import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class UpdateDmMessagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  messages: string[];
}
