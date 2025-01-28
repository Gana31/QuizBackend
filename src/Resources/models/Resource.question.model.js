import mongoose from "mongoose";

const ResourceQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    explanationLink: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ResourceQuestionModel = mongoose.model('ResourceQuestion', ResourceQuestionSchema);

export default ResourceQuestionModel;
