import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resouce name is required'],
      trim: true,
    },
    category :{
      type:String,
      required:[true,"category of resouce is required"]
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser', // Reference the user model
      required: true,
    },
    questions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResourceQuestion',
          },
    ],
  
   
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ResourceModel = mongoose.model('Resource', ResourceSchema);

export default ResourceModel;
