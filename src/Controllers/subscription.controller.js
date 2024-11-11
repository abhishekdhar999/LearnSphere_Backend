import { Subscription } from "../../Model/subscription.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { User } from "../../Model/user.model.js";

const subscribe = asyncHandler(async (req, res) => {

    const subscriberId = req.user._id;
const {channelId} = req.body

    const subscription = await Subscription.create({
        subscriber : subscriberId,
        channel: channelId
    })

    if(!subscription){
        throw new ApiError(400, "Failed to subscribe")
    }

    const populatedSubscription = await Subscription.findById(subscription._id)
    .populate("subscriber")
    .populate("channel")

if(!populatedSubscription){
    throw new ApiError(400, "Failed to subscribe")
}

const user = await User.findByIdAndUpdate(
    channelId, // The ID of the user
    {
        $inc: { subscribersCount: 1 } , // Increment the 
    $push:{subscribers:subscriberId}
},
    { new: true } // Return the updated user document
  );

  user.populate("subscribers")
  
  if (!user) {
    throw new ApiError(400, "Channel not found");
  }

  console.log("user",user)
    console.log("populatedSubscription",populatedSubscription)
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            populatedSubscription,
            "Subscription created successfully",
        )
    )
});

const unSubscribe = asyncHandler(async(req,res)=>{
    const subscriberId = req.user._id;

    const {channelId} = req.body;

    const subscription = await Subscription.findOneAndDelete({
        subscriber: subscriberId,
        channel: channelId
      });

    if(!subscription){
        throw new ApiError(400, "Failed to unsubscribe")
    }
    const user = await User.findByIdAndUpdate(
        channelId, // The ID of the user
        {
             $inc: { subscribersCount: -1 } , // Decrement the 
        $pull : {subscribers:subscriberId}
    },
        { new: true } // Return the updated user document
        
    )
    if (!user) {
        throw new ApiError(400, "Channel not found");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user:user,
                    subscription:subscription
                },
                "Unsubscribed successfully",
                )
                )
})

const isSubscribed = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;
    const {channelId} = req.params;

    console.log("channel id ", channelId);

    // Check if the subscriber ID is in the channel's subscribers array
    const checkIsSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: { $in: [subscriberId] }
    });

    if (!checkIsSubscribed) {
        return res.status(200).json({ isSubscribed: false });
    }
    
    return res.status(200).json({ isSubscribed: true });
});


// const getSubscribers = async

export {subscribe,unSubscribe,isSubscribed}