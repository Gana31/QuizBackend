import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";

const QuestionOptionModel = sequelize.define("question_options", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: "question_options",
  timestamps: true,
  underscored: true,
});

export default QuestionOptionModel;
