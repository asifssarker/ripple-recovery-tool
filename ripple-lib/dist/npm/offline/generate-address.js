'use strict'; // eslint-disable-line strict

var keypairs = require('ripple-keypairs');
var common = require('../common');
var errors = common.errors,
    validate = common.validate;


function generateAddress(options) {
  var secret = keypairs.generateSeed(options);
  var keypair = keypairs.deriveKeypair(secret);
  var address = keypairs.deriveAddress(keypair.publicKey);
  return { secret: secret, address: address };
}

function generateAddressAPI(options) {
  validate.generateAddress({ options: options });
  try {
    return generateAddress(options);
  } catch (error) {
    throw new errors.UnexpectedError(error.message);
  }
}

module.exports = {
  generateAddressAPI: generateAddressAPI
};