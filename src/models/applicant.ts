import { prop, getModelForClass } from "@typegoose/typegoose";

class Applicant {
  @prop({ required: true })
  public firstName!: string;

  @prop({ required: true })
  public lastName!: string;

  @prop({ required: true,})
  public email!: string;

  @prop({ required: true })
  public phone!: string;

  @prop({ required: true })
  public applyFor!: string;
  @prop({ required: true })
  public cv!: string;
}

const ApplicantModel = getModelForClass(Applicant);

export { Applicant, ApplicantModel };
