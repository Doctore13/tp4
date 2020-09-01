import express from 'express';
import { accountModel } from '../models/Account.js';

const app = express();

app.post('/deposit', async (req, res) => {
  const { agencia, conta, balance } = req.body;

  if (!agencia || !conta || !balance) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccount = await accountModel.findOne({ agencia, conta });

  if (!findAccount) {
    return res.status(400).json({ error: 'Agencia ou conta não encontrada' });
  }

  findAccount.balance = findAccount.balance + balance;

  await findAccount.save();

  return res.status(200).json(findAccount);
});

app.post('/sacar', async (req, res) => {
  const { agencia, conta, balance } = req.body;

  if (!agencia || !conta || !balance) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccount = await accountModel.findOne({ agencia, conta });

  if (!findAccount) {
    return res.status(400).json({ error: 'Agencia ou conta não encontrada' });
  }

  let newBalance = findAccount.balance - balance - 1;

  if (newBalance < 0) {
    return res.status(400).json({ error: 'Saldo insuficiente' });
  }

  findAccount.balance = newBalance;

  await findAccount.save();

  return res.status(200).json(findAccount);
});

app.get('/saldo', async (req, res) => {
  const { agencia, conta } = req.query;

  if (!agencia || !conta) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccount = await accountModel.findOne({ agencia, conta });

  if (!findAccount) {
    return res.status(400).json({ error: 'Agencia ou conta não encontrada' });
  }

  return res.status(200).json(findAccount);
});

app.delete('/deletar', async (req, res) => {
  const { agencia, conta } = req.body;

  if (!agencia || !conta) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  await accountModel.findOneAndDelete({ agencia, conta });

  const activeAccounts = await accountModel.find({ agencia });

  return res.status(200).json(activeAccounts);
});

app.post('/transferir', async (req, res) => {
  const { contaOrigem, contaDestino, valor } = req.body;

  if (!contaOrigem || !contaDestino || !valor) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }
  const findContaOrigem = await accountModel.findOne({ conta: contaOrigem });
  const findContaDestino = await accountModel.findOne({ conta: contaDestino });

  if (findContaOrigem.agencia !== findContaDestino.agencia) {
    findContaOrigem.balance -= 8;
  }

  findContaOrigem.balance -= valor;
  findContaDestino.balance += valor;

  await findContaOrigem.save();
  await findContaDestino.save();

  return res.status(200).json(findContaOrigem);
});

app.get('/media', async (req, res) => {
  const { agencia } = req.query;

  if (!agencia) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccounts = await accountModel.aggregate([
    { $match: { agencia: Number(agencia) } },
    { $group: { _id: '$agencia', avgBalance: { $avg: '$balance' } } },
  ]);

  if (findAccounts.length === 0) {
    return res
      .status(200)
      .json({ msg: 'Nenhuma conta encontrada para esta agência' });
  }

  return res.status(200).json(findAccounts);
});

app.get('/pobres', async (req, res) => {
  const { limit } = req.query;

  if (!limit) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccounts = await accountModel
    .aggregate([{ $sort: { balance: 1 } }])
    .limit(Number(limit));

  return res.status(200).json(findAccounts);
});

app.get('/ricos', async (req, res) => {
  const { limit } = req.query;

  if (!limit) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const findAccounts = await accountModel
    .aggregate([{ $sort: { balance: -1 } }])
    .limit(Number(limit));

  return res.status(200).json(findAccounts);
});

app.get('/hack', async (req, res) => {
  const findAgencies = await accountModel.distinct('agencia');

  for (const agency of findAgencies) {
    const findTopAccount = await accountModel
      .find({ agencia: agency })
      .sort({ balance: -1 })
      .limit(1);

    const { name, balance, conta } = findTopAccount[0];

    await accountModel.create({
      agencia: 99,
      name,
      balance,
      conta,
    });
  }

  const findPrivateAgency = await accountModel.find({ agencia: 99 });

  return res.status(200).json(findPrivateAgency);
});

//CREATE
app.post('/accounts', async (req, res) => {
  try {
    const account = new accountModel(req.body);
    await account.save();
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

//RETRIEVE
app.get('/accounts', async (req, res) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

//UPDATE
app.patch('/account/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const account = await accountModel.findByIdAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

//DELETE
app.delete('/account/:id', async (req, res) => {
  try {
    const account = await accountModel.findByIdAndDelete({
      _id: req.params.id,
    });
    if (!account) {
      res.status(404).send('Documento não encontrado na colecão');
    } else {
      res.status(200).send();
    }
    //console.log('Documento deletado!');
  } catch (error) {
    res.status(500).send(error);
  }
});

export { app as accountRouter };
