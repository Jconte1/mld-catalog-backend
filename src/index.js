import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import productRoutes from './api/routes/products/index.js';
import searchRouter from './api/routes/search.js';
import closeoutRouter from './api/routes/closeout/create.js'
import inventoryRouter from './api/routes/closeout/inventory.js'
import closeoutInventoryRouter from './api/routes/closeoutInventory.js';

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
app.use('/api/closeout', inventoryRouter);
app.use('/closeout_inventory', closeoutInventoryRouter);


app.get('/', (req, res) => {
  res.send('API is running testing testing testing ');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
