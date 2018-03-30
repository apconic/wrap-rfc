"use strict";
const util = require("util");
const { isEmpty } = require("lodash");

let plattformPath = null;

if (process.platform === "linux" && process.arch === "x64") {
  plattformPath = "./build/linux_x64/rfc";
} else if (process.platform === "win32" && process.arch === "x64") {
  plattformPath = "./build/win32_x64/rfc";
} else {
  console.log("Platform not supported", process.platform, process.arch);
}

const rfc = require(plattformPath);
const promisifiedConnect = util.promisify(rfc.Client.connect);
const promisifiedInvoke = util.promisify(rfc.Client.invoke);

const RFCClient = {
  client: null,

  async _getClient(connectionParams) {
    if (!this.client || !this.client.isAlive()) {
      try {
        this.client = new rfc.Client(connectionParams);
        if (isEmpty(this.client)) {
          throw new Error("Unable to create client");
        }
        await promisifiedConnect();
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
        console.log(`invoking ${functionModuleName}`);
        var res = await promisifiedInvoke(
          client.invoke,
          functionModuleName,
          exportParam
        );
        return res;
      } catch (invokeError) {
        console.log(
          `Error invoking function module ${functionModuleName}: ${
            invokeError.message
          } `
        );
        console.log(JSON.stringify(invokeError));
        throw new Error(invokeError.message);
      }
    } catch (connError) {
      console.log(`Error connecting to sap: ${connError.message} `);
      console.log(JSON.stringify(connError));
      throw new Error(connError.message);
    }
  }
};

module.exports = RFCClient;
