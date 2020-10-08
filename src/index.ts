import dotenv from 'dotenv';
import express from 'express';
import DiscordBot from 'DiscordBot';

dotenv.config();

const app = express();
const PORT_DEFAULT = 5000;
const PORT = Number(process.env.PORT) || PORT_DEFAULT;

app.listen(PORT, () => {
  new DiscordBot();
});
