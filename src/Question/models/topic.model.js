import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";

const TopicModel = sequelize.define("topics", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Topic name cannot be empty" },
      notNull: { msg: "Topic name is required" },
    },
  },
  category_id: {
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
  tableName: "topics",
  timestamps: true,
  underscored: true,
});

export default TopicModel;
