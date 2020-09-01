import mongoose from 'mongoose';

const accountSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    min: 0,
  },
});

const accountModel = mongoose.model('Accounts', accountSchema, 'Accounts');

export { accountModel };
