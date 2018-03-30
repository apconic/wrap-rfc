'use strict';

var plattformPath = null;
var util = require('util');
var { isEmpty } = require('lodash');

if (process.platform === "linux" && process.arch === "x64") {
  plattformPath = './build/linux_x64/rfc';
} else if (process.platform === "win32" && process.arch === "x64") {
  plattformPath = './build/win32_x64/rfc';
} else {
  console.log('Platform not supported', process.platform, process.arch);
}

var rfc = require(plattformPath);

var RFCClient = {
  client: null,

  async _getClient(connectionParams) {
    if (!this.client || !this.client.isAlive()) {
      try {
        this.client = new rfc.Client(connectionParams);
        if (isEmpty(this.client)) {
          throw new Error('Unable to create client');
        }
        var connectionPromise = util.promisify(this.client.connect);
        await connectionPromise();
        return this.client;
      } catch (connectionError) {
        console.log(`Error connecting to sap: ${connectionError.message}`);
        console.log(JSON.stringify(connectionError));
        throw new Error(connectionError.message);
      }
    }
    return this.client;
  },

  async invokeModule(connectionParams, functionModuleName, exportParam) {
    try {
      var client = await this._getClient(connectionParams);
      try {
        var invokePromise = util.promisify(client.invoke);
        console.log(`invoking ${functionModuleName}`);
        var res = await invokePromise(client.invoke, functionModuleName, exportParam);
        return res;
      } catch (invokeError) {
        console.log(`Error invoking function module ${functionModuleName}: ${invokeError.message} `);
        console.log(JSON.stringify(invokeError));
        throw new Error(invokeError.message);
      }
    } catch (connError) {
      console.log(`Error connecting to sap: ${connError.message} `);
      console.log(JSON.stringify(connError));
      throw new Error(connError.message);
    }
  },
};

module.exports = RFCClient;
