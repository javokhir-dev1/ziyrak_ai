import { IsBoolean, IsString, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean()
  autoReplyEnabled?: boolean;

  @IsOptional() @IsString()
  commentReplyTemplate?: string;

  @IsOptional() @IsBoolean()
  autoDmEnabled?: boolean;

  @IsOptional() @IsString()
  dmTemplate?: string;

  @IsOptional() @IsBoolean()
  keywordsEnabled?: boolean;

  @IsOptional() @IsArray()
  keywords?: string[];

  @IsOptional() @IsArray()
  targetPostIds?: string[];

  @IsOptional() @IsNumber() @Min(1) @Max(168)
  userCooldownHours?: number;

  @IsOptional() @IsNumber() @Min(1) @Max(1000)
  dailyLimit?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(30)
  replyDelaySeconds?: number;
}
