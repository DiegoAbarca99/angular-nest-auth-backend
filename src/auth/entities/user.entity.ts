import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema() //Define propiedas que deben cumplirse para las columnsas de la bd cuando se complementa con  @Prop
export class User {

    _id?: string;

    @Prop({ unique: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, minlength: 6 })
    password?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];


}

export const userSchema = SchemaFactory.createForClass(User);
