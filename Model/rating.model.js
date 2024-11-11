import mongoose,{Schema} from "mongoose";

const ratingSchema = new Schema({
    rating: {
        type: Number,
        // required: true,
        default:0,
        min: 0, // Minimum rating value
        max: 5  // Maximum rating value
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referencing the User model
        // required: true
      },
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you are rating a product
        // required: true
      },
      review: {
        type: String,
        trim: true,
        maxlength: 500, // Limits the comment length
      },
      createdAt: {
        type: Date,
        default: Date.now
      },


})

export const Rating = mongoose.model("Rating",ratingSchema)