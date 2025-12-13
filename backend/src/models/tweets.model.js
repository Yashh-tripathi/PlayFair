import mongoose, { Schema } from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
    },
    {
        timestamps: true,
    }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);