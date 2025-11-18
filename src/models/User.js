"use strict";

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init({
    email: {
      type: DataTypes.STRING(155),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255], 
      },
    },

    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },



  }, {
    sequelize,
    modelName: 'user',
    tableName: 'user',
    underscored: true,
    timestamps: 'user',
    createdAt: 'created_at',
    updated_at: 'updated_at'
  });

  return User;
};
