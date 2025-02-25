const client = require('./db/client.cjs');
client.connect();
const { authenticateUser, logInWithToken } = require('./db/users.cjs');

const express = require('express');
const app = express();

app.use(express.json());

app.use(express.static('dist'));

app.post('/api/auth/register', async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id);
    res.send({ token: token });
  } catch (err) {
    res.send({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const token = await authenticateUser(username, password);
    res.send({ token: token });
  } catch (err) {
    res.send({ message: 'No User Found' });
  }
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const user = await logInWithToken(req.headers.authorization);
    res.send({ user })
  } catch (err) {
    res.send({ message: err.message });
  }
});

app.get('/api/books', async (req, res, next) => {
  try {
      const items = await Item.find();
      res.send(items);
  } catch (err) {
      res.send({ message: 'Failed to fetch items' });
  }
});

app.get('/api/books/:bookId', async (req, res, next) => {
  try {
      const item = await Item.findById(req.params.itemId);
      if (!item) {
          return res.status(404).send({ message: 'Book not found' });
      }
      res.send(item);
  } catch (err) {
      res.send({ message: 'Failed to fetch books' });
  }
});

app.get('/api/books/:booksId/reviews', async (req, res, next) => {
  try {
      const item = await Item.findById(req.params.itemId).populate('reviews');
      if (!item) {
          return res.status(404).send({ message: 'Book not found' });
      }
      res.send(item.reviews);
  } catch (err) {
      res.send({ message: 'Failed to fetch reviews' });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});