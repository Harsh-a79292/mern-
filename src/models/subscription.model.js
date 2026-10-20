import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // jo user subscribe kar raha hai
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // jis channel ko subscribe kiya ja raha hai
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);