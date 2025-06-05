import express from 'express';
import cors from 'cors';
import productRoutes from './api/routes/product.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://mld.com'],
  credentials: true
}));
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
