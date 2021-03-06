'use strict'; // eslint-disable-line strict

var utils = require('./utils');
var flags = require('./flags').orderFlags;
var parseAmount = require('./amount');
var BigNumber = require('bignumber.js');

// TODO: remove this function once rippled provides quality directly
function computeQuality(takerGets, takerPays) {
  var quotient = new BigNumber(takerPays.value).dividedBy(takerGets.value);
  return quotient.toDigits(16, BigNumber.ROUND_HALF_UP).toString();
}

// rippled 'account_offers' returns a different format for orders than 'tx'
// the flags are also different
function parseAccountOrder(address, order) {
  var direction = (order.flags & flags.Sell) === 0 ? 'buy' : 'sell';
  var takerGetsAmount = parseAmount(order.taker_gets);
  var takerPaysAmount = parseAmount(order.taker_pays);
  var quantity = direction === 'buy' ? takerPaysAmount : takerGetsAmount;
  var totalPrice = direction === 'buy' ? takerGetsAmount : takerPaysAmount;

  // note: immediateOrCancel and fillOrKill orders cannot enter the order book
  // so we can omit those flags here
  var specification = utils.removeUndefined({
    direction: direction,
    quantity: quantity,
    totalPrice: totalPrice,
    passive: (order.flags & flags.Passive) !== 0 || undefined,
    // rippled currently does not provide "expiration" in account_offers
    expirationTime: utils.parseTimestamp(order.expiration)
  });

  var makerExchangeRate = order.quality ? utils.adjustQualityForXRP(order.quality.toString(), takerGetsAmount.currency, takerPaysAmount.currency) : computeQuality(takerGetsAmount, takerPaysAmount);
  var properties = {
    maker: address,
    sequence: order.seq,
    makerExchangeRate: makerExchangeRate
  };

  return { specification: specification, properties: properties };
}

module.exports = parseAccountOrder;