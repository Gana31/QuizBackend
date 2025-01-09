import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
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
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser',
      required: true,
    },
    selectedSets: {
      type: [String], // This will store an array of set names like ['A', 'B']
      default: [], // Default to an empty array
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const QuestionModel = mongoose.model('Question', QuestionSchema);

export default QuestionModel;
