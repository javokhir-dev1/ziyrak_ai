import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateLogDto {
  @IsIn(['success', 'error', 'info'])
  type: 'success' | 'error' | 'info';

  @IsString()
  action: string;

  @IsString()
  message: string;

  @IsOptional() @IsString()
  user?: string;
}
