import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class Details {
  @Prop()
  bio: string;

  @Prop()
  otherName: string;

  @Prop()
  job: string;

  @Prop()
  workplace: string;

  @Prop()
  highSchool: string;

  @Prop()
  college: string;

  @Prop()
  currentCity: string;

  @Prop()
  hometown: string;

  @Prop({ enum: ['Single', 'In a relationship', 'Married', 'Divorced'] })
  relationship: string;

  @Prop()
  instagram: string;
}

export const DetailsSchema = SchemaFactory.createForClass(Details);
