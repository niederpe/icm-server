import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  messageId: String,
  from: [{
    address: String,
    name: String
  }],
  to: [{
    address: String,
    name: String
  }],
  subject: String,
  html: String,
  text: String,
  date: Date,
  tasks: [{
    id: {
      type: String
    },
    date: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

EmailSchema.method({
  toClient: () => {
    let obj = this.toObject();
    obj.id = obj._id;
    obj.date = obj.date.toISOString();
    delete obj._id;
    return obj;
  }
});

export default mongoose.model('Email', EmailSchema);
