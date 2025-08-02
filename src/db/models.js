const { sequelize } = require("./database");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  discordId: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
    field: "discord_id",
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "updated_at",
  },
});

const ShopItem = sequelize.define("ShopItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "updated_at",
  },
});

const UserInventory = sequelize.define("UserInventory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "user_id",
    references: {
      model: User,
      key: "discord_id",
    },
    onDelete: "CASCADE",
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "item_id",
    references: {
      model: ShopItem,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: "updated_at",
  },
});

User.hasMany(UserInventory, { foreignKey: "userId" });
ShopItem.hasMany(UserInventory, { foreignKey: "itemId" });

UserInventory.belongsTo(User, { foreignKey: "userId" });
UserInventory.belongsTo(ShopItem, { foreignKey: "itemId" });

module.exports = { User, ShopItem, UserInventory };