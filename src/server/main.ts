import express from "express";
import ViteExpress from "vite-express";
import routes from './routes';

const app = express();

//  API Router
app.use('/api', routes.api);

//  Webserver
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
