import Koa from 'koa'
import cors from '@koa/cors'
import _ from 'koa-route'
import Socket from 'socket.io'
import { createServer } from 'http'

const app = new Koa();
app.use(cors());

const server = createServer(app.callback())

export const io = Socket(server);

export const messages = {}

const messagesAlert = {
    list: (ctx) => {
        ctx.body = { data: Object.keys(messages).map(e => messages[e]) }
    },
    show: (ctx, id) => {
        const alert = messages[id]
        if (!alert) return ctx.throw('Cannot find that alert', 404);
        io.emit('alert', alert)
        alert.shown = true
    }
};

io.on('connection', (socket) => {
    console.log(`User ${socket.id} logged`)
})

app.use(_.get('/alerts', messagesAlert.list));
app.use(_.get('/alerts/show/:id', messagesAlert.show));

export const listen = (port) => {
    server.listen(port);
    console.log(`Listening on port ${port}`)
}