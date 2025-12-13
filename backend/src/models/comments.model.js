import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Content is required"]
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model("Comment", commentSchema);