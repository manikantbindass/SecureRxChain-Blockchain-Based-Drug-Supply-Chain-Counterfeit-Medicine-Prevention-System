const mongoose = require('mongoose');
require('dotenv').config();

async function clearDB() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/securerxchain");
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('drugmetadata').deleteMany({});
    console.log("Database cleared");
    process.exit(0);
}
clearDB();
