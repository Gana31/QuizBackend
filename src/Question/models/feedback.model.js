import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    quizName: {
      type: String,
      required: true,
    },
    quizCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the teacher who created the quiz
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who submitted the feedback
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    question: {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
      selectedAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
    adminReply: {
      type: String,
      default: null, // Will be updated by the teacher
    },
    adminReplied: {
      type: Boolean,
      default: false, // Tracks if the teacher replied
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", FeedbackSchema);
