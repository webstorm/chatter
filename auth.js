const request = require('request');
const jsonwebtoken = require('jsonwebtoken');
const db = require('./db');
const roles = new Map();
const auth = {
  authenticate: function(role, token) {
    const promise = new Promise((resolve,reject) => {
      const url = `http://${process.env.AUTH_SERVICE_URL}/${role}/detail`;
      request.get(url, {headers: {'Authorization': `Bearer${token}`}
      }, function (err, response, body) {
        if(err) reject(err);
        if (response.statusCode !== 200 ) reject(response);
        resolve(body);
      });
    });
    return promise;
  },
  decodeToken: function (token) {
      const decodedToken = jsonwebtoken.decode(token);
      return decodedToken;
  },
};
module.exports = auth;