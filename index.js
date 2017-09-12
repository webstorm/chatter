require('dotenv').config();
const WebSocket = require('ws');
const url = require('url');
const Rx = require('rxjs/Rx');
const auth = require('./auth');
const messagesRepository = require('./messagesRepository');

const connectedUsers = new Map();

const messages = Rx.Observable.create(function(observer) {
  messagesRepository.on('message', (data) => {
    observer.next(data);
  });
});

messages.filter((message, index) => {
  console.log(message);
  return connectedUsers.has(message.to);
}).subscribe(message => {
  connectedUsers.get(message.to).send(JSON.stringify({
    event: 'message',
    data: message.data
  }));
});

const validEvents = new Set();
validEvents.add('message');
validEvents.add('file');

const invalidEventError = (event) => {
  return JSON.stringify({
    'event': 'error',
    'data': `Unsupported event ${event}`
  });
};

const wss = new WebSocket.Server({
  port: process.env.PORT,
  verifyClient: function(info, callback) {
    const location = url.parse(info.req.url, true);
    const decodeToken = auth.decodeToken(location.query.token);
      auth
      .authenticate(decodeToken.type, location.query.token)
      .then(response => {
        const {status, data} = JSON.parse(response);
        info.req.user = Object.assign(decodeToken, data);
        callback(true);
      })
      .catch(error => {
        if('statusCode' in error) {
          callback(false, error.statusCode);
        }
        callback(false);
      });
  }
});

function addMessageToUserQueue(message){
  return messagesRepository.add(message);
}

wss.on('connection', (ws, request) => {
  const user = request.user;
  const key = `${user.type}:${user.sub}`;
  connectedUsers.set(key, ws);
  ws.send(JSON.stringify({
    event: 'message',
    data: `Welcome ${user.username}`
  }));
  ws.on('message', (message) => {
      const { event,  data } = JSON.parse(message);
      if (!validEvents.has(event)) {
        ws.send(invalidEventError(event));
      }
      switch (event) {
        case 'message':
          addMessageToUserQueue(data);
          break;
        case 'file':
          break;
        default:
      }
  });
});