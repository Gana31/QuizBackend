import FeedbackService from "../services/feedback.services.js";



const feedbackService = new FeedbackService();

export class FeedbackController {
  // Create feedback
  async createFeedback(req, res, next) {
    try {
      const userId = req.user.id; // From authenticated user
      const feedbackData = { ...req.body, userId };

      const feedback = await feedbackService.addFeedback(feedbackData);
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  // Update admin reply
  async updateAdminReply(req, res, next) {
    try {
      const { feedbackId } = req.params;
      const { adminReply } = req.body;

      const updatedFeedback = await feedbackService.updateAdminReply(
        feedbackId,
        adminReply
      );

      res.status(200).json({ success: true, data: updatedFeedback });
    } catch (error) {
      next(error);
    }
  }

  // Get user feedback
  async getUserFeedback(req, res, next) {
    try {
      const userId = req.user.id;
      const feedbacks = await feedbackService.getUserFeedback(userId);
      res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      next(error);
    }
  }

  // Get teacher feedback
  async getTeacherFeedback(req, res, next) {
    try {
      const quizCreatorId = req.user.id; // Assuming teacher is authenticated
      const feedbacks = await feedbackService.getTeacherFeedback(quizCreatorId);
      res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      next(error);
    }
  }
}
