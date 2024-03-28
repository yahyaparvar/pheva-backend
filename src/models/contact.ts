import { prop, getModelForClass } from "@typegoose/typegoose";

class Contact {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public company!: string;

  @prop({ required: true })
  public corporateEmail!: string;

  @prop({ required: true })
  public subject!: string;

  @prop({ required: true })
  public projectBudget!: string;

  @prop({ required: true })
  public description!: string;

  @prop()
  public attachment?: string;
}

const ContactModel = getModelForClass(Contact);

export { Contact, ContactModel };
