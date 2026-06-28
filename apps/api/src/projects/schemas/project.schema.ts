import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ProjectGenre {
  THRILLER = 'thriller',
  DRAMA = 'drama',
  COMEDY = 'comedy',
  HORROR = 'horror',
  SCI_FI = 'sci_fi',
  DOCUMENTARY = 'documentary',
  ACTION = 'action',
  ROMANCE = 'romance',
  FANTASY = 'fantasy',
  ANIMATION = 'animation',
}

export enum ProjectStage {
  IDEA = 'idea',
  SCENARIO = 'scenario',
  SNIPPET = 'snippet',
  IN_PRODUCTION = 'in_production',
}

export enum RoleNeeded {
  DIRECTOR = 'director',
  ACTOR = 'actor',
  SCREENWRITER = 'screenwriter',
  CINEMATOGRAPHER = 'cinematographer',
  EDITOR = 'editor',
  SOUND_DESIGNER = 'sound_designer',
  COMPOSER = 'composer',
  PRODUCER = 'producer',
  COSTUME_DESIGNER = 'costume_designer',
  MAKEUP_ARTIST = 'makeup_artist',
}

export enum MediaSnippetType {
  VIDEO = 'video',
  IMAGE = 'image',
  LINK = 'link',
}

@Schema({ _id: false })
export class MediaSnippet {
  @Prop({ required: true })
  url: string;

  @Prop({ enum: MediaSnippetType, required: true })
  type: MediaSnippetType;
}

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 300 })
  teaser: string;

  @Prop()
  fullDocument?: string;

  @Prop({ enum: ProjectGenre, required: true })
  genre: ProjectGenre;

  @Prop({ enum: ProjectStage, required: true })
  stage: ProjectStage;

  @Prop({ type: [{ type: String, enum: RoleNeeded }], default: [] })
  rolesNeeded: RoleNeeded[];

  @Prop()
  customRoleNeeded?: string;

  @Prop({ type: [MediaSnippet], default: [] })
  mediaSnippets: MediaSnippet[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  accessList: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
