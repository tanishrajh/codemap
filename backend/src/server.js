require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRoutes = require('./routes/analyze');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', analyzeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
