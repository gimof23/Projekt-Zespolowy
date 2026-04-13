const express = require('express');
require('dotenv').config();
require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Express dziala' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
