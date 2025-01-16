import { ApiError } from "../../../utils/ApiError.js";
import feedbackModel from "../models/feedback.model.js";


class FeedbackService {
  // Add feedback
  async addFeedback(feedbackData) {
    try {
      const feedback = await feedbackModel.create(feedbackData);
      return feedback;
    } catch (error) {
      console.log(error)
      throw new ApiError(500, "Error creating feedback", error);
    }
  }

  // Update admin reply
  async updateAdminReply(feedbackId, adminReply) {
    try {
      const feedback = await feedbackModel.findByIdAndUpdate(
        feedbackId,
        { adminReply, adminReplied: true },
        { new: true }
      );

      if (!feedback) {
        throw new ApiError(404, "Feedback not found");
      }

      return feedback;
    } catch (error) {
      throw new ApiError(500, "Error updating admin reply", error);
    }
  }

  // Get feedback for user
  async getUserFeedback(userId) {
    try {
      const feedbacks = await feedbackModel.find({ userId });
      return feedbacks;
    } catch (error) {
      throw new ApiError(500, "Error fetching user feedback", error);
    }
  }

  // Get feedback for teacher
  async getTeacherFeedback(quizCreatorId) {
    try {
      const feedbacks = await feedbackModel.find({ quizCreator: quizCreatorId });
      return feedbacks;
    } catch (error) {
      throw new ApiError(500, "Error fetching teacher feedback", error);
    }
  }
}

export default FeedbackService;
