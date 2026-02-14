import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express, { type Application } from 'express';
import cors from 'cors';

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, (): void => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
