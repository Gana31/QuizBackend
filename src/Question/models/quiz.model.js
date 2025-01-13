import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Quiz name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser', // Reference the user model
      required: true,
    },
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizeUser', // Reference the user model
      },
    ],
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const QuizModel = mongoose.model('Quiz', QuizSchema);

export default QuizModel;
