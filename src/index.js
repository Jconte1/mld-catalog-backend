import express from 'express';
import cors from 'cors';
import productRoutes from './api/routes/product.js';
import searchRouter from './api/routes/search.js';
import closeoutRouter from './api/routes/closeout/create.js'

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
 
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://mld.com', 'https://www.mld.com'],
  credentials: true
}));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/search', searchRouter);
app.use('/api/closeout', closeoutRouter);

app.get('/', (req, res) => {
  res.send('API is running testing testing testing ');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
