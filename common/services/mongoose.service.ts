import debug from 'debug';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  throw dotenvResult.error;
}

const mongoURI = dotenvResult?.parsed?.MONGO_URI ?? '';

const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
  private count = 0;

  private mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    // useFindAndModify: false,
  };

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry = () => {
    log('Attempting MongoDB connection (will retry if needed)');
    mongoose
      .connect(mongoURI, this.mongooseOptions)
      .then(() => {
        log('MongoDB is connected');
      })
      .catch((err) => {
        const retrySeconds = 5;
        log(
          `MongoDB connection unsuccessful (will retry #${
            this.count + 1
          } after ${retrySeconds} seconds):`,
          err
        );
        setTimeout(this.connectWithRetry, retrySeconds * 1000);
      });
  };
}
export default new MongooseService();
