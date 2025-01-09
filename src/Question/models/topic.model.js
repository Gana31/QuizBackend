import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
    },
    description: {
      type: String,
      required: [true, 'Topic description is required'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser',
      required: true,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
    },
    marksPerQuestion: {
      type: Number,
      required: [true, 'Marks per question are required'],
      min: [1, 'Marks per question must be at least 1'],
    },
    maxQuestions: {
      type: Number,
      required: [true, 'Maximum questions are required'],
      min: [1, 'Maximum questions must be at least 1'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TopicModel = mongoose.model('Topic', TopicSchema);

export default TopicModel;
