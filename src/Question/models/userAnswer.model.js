import mongoose from 'mongoose';

const UserAnswerSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizeUser',
      required: true,
    },
    topics: [
      {
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Topic',
          required: true,
        },
        topicName: String,
        questions: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Question',
              required: true,
            },
            questionTitle: String,
            options: [String],
            selectedOption: Number,
            correctAnswer: String,
            userAnswer: String,
            explanationLink : String,
            isCorrect: Boolean,
          },
        ],
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['passed', 'failed'],
    },
  },
  { timestamps: true }
);

const UserAnswerModel = mongoose.model('UserAnswer', UserAnswerSchema);

export default UserAnswerModel;
