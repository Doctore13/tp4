// imports
import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';

const app = express();

/* conexao com mongo */
(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://doctore:5803@bootcamp.msaxk.mongodb.net/Accounts?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Conectado no MongoDB');
  } catch (error) {
    console.log('Erro ao conectar no MongoDB');
  }
})();

app.use(express.json());
app.use(accountRouter);

app.listen(3000, () => console.log('API Iniciada!'));
