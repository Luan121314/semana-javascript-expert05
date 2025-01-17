import https  from 'https'
import fs from 'fs'
import {logger} from './logger.js'
import {Server} from 'socket.io'
import Routes from './routes.js'

const PORT = process.env.PORT || 3000

const localhostSSL = {
    key: fs.readFileSync('./certificates/key.pem'),
    cert: fs.readFileSync('./certificates/cert.pem')
    
}

const routes = new Routes()

const server = https.createServer(
    localhostSSL,
    routes.handler.bind(routes)
    )
    
    const io = new Server(server, {
        cors: {
            origin: "*",
            credentials: false
        }
    })

    routes.setSocketInstance(io)
    
    io.on('connection', socket=> logger.info(`comeone connected ${socket.id}`))
    
    const startServer = ()=>{
        const {address, port} = server.address()
        logger.info(`app running at https://${address}:${port}`)
    }
    
    server.listen(PORT, startServer)