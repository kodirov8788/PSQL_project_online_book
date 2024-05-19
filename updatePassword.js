const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = new Sequelize("bookstore", "myuser", "0099", {
  host: "localhost",
  dialect: "postgres",
});

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});

async function updatePasswords() {
  try {
    await sequelize.authenticate();
    console.log("Connection to PostgreSQL has been established successfully.");

    const users = await User.findAll();
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("temporary_password", salt);
      user.password = hashedPassword;
      await user.save();
    }

    console.log("Passwords updated successfully.");
    await sequelize.close();
  } catch (error) {
    console.error("Unable to update passwords:", error);
  }
}

updatePasswords();
