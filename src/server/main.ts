import express from "express"
import http from 'http'
import ViteExpress from "vite-express"
import routes from './routes'
import'websocket-polyfill'

const app = express()

//  API Router
app.use('/api', routes.api)

app.use('/test', routes.test)

const httpServer = http.createServer(app).listen(3000, () => {
    console.log("HTTP Server is listening on port 3000...")
})

ViteExpress.bind(app, httpServer)

 //  Webserver
/* ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
); */
