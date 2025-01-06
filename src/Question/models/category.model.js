import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";

const CategoryModel = sequelize.define("quizecategories", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Category name cannot be empty" },
      notNull: { msg: "Category name is required" },
    },
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
  tableName: "quizecategories",
  timestamps: true,
  underscored: true,
});

export default CategoryModel;
