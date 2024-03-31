import { prop, getModelForClass } from "@typegoose/typegoose";

class Skill {
  @prop({ required: true })
  public skill!: string;

  @prop({ required: true })
  public rate!: number;
}

class Applicant {
  @prop({ required: true })
  public firstName!: string;

  @prop({ required: true })
  public lastName!: string;

  @prop({ required: true })
  public email!: string;

  @prop({ required: true })
  public phone!: string;

  @prop({ required: true })
  public applyFor!: string;

  @prop({ required: true })
  public cv!: string;

  @prop({ type: () => [Skill], _id: false })
  public skills!: Skill[];
}

const ApplicantModel = getModelForClass(Applicant);

export { Applicant, ApplicantModel, Skill };
