import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum CreativeRole {
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
  CUSTOM = 'custom',
}

export enum GenreTag {
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

export enum PortfolioItemType {
  LINK = 'link',
  UPLOAD = 'upload',
}

@Schema({ _id: false })
export class Location {
  @Prop()
  city?: string;

  @Prop()
  region?: string;

  @Prop()
  country?: string;
}

@Schema()
export class PortfolioItem {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop({ enum: PortfolioItemType, required: true })
  type: PortfolioItemType;

  @Prop()
  fileUrl?: string;
}

@Schema({ _id: false })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  review?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  googleId?: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  bio?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: Location })
  location?: Location;

  @Prop({ type: [{ type: String, enum: CreativeRole }], default: [] })
  roles: CreativeRole[];

  @Prop()
  customRole?: string;

  @Prop({ type: [{ type: String, enum: GenreTag }], default: [] })
  genreTags: GenreTag[];

  @Prop({ type: [PortfolioItem], default: [] })
  portfolio: PortfolioItem[];

  @Prop({ type: [Rating], default: [] })
  ratings: Rating[];

  @Prop({ default: 0 })
  averageRating: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
