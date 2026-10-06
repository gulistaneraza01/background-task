import express from 'express';
import helmet from 'helmet';
import { userRouter } from './src/routes/user.routes';
import { accountRouter } from "./src/routes/account.routes";
import { imageRouter } from "./src/routes/image.routes";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRouter);
app.use(accountRouter);
app.use(imageRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`listening on :${port}`));
