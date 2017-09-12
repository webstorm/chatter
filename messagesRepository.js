const db = require('./db');
const EventEmitter = require('events');

class MessageRepository extends EventEmitter {
   async add (message){
     try {
       const result = await db.execute("INSERT INTO tbl_chat_messages(`to`,`from`,`message`, `created_at`) VALUES(?,?,?, NOW());", [message.to, message.from, message.data]);
       this.emit('message', message);
       return result;
     } catch(e) {
       throw e;
     }
    }

  async all()  {
    try {
      const result = await db.execute("SELECT * FROM tbl_chat_messages;");
      return result;
    } catch(e) {
      throw e;
    }
  }

}

const messages = new MessageRepository();
module.exports = messages;