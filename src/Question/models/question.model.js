import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";

const QuestionModel = sequelize.define("questions", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Question text cannot be empty" },
      notNull: { msg: "Question text is required" },
    },
  },
  type: {
    type: DataTypes.ENUM("text_mcq", "image_mcq"),
    allowNull: false,
    validate: {
      isIn: [["text_mcq", "image_mcq"]],
      notNull: { msg: "Question type is required" },
    },
  },
  correct_option_id: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Correct option ID cannot be empty" },
      notNull: { msg: "Correct option ID is required" },
    },
  },
  topic_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Creator ID cannot be empty" },
      notNull: { msg: "Creator ID is required" },
    },
  },
}, {
  tableName: "questions",
  timestamps: true,
  underscored: true,
});

export default QuestionModel;
