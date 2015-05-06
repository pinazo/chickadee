/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var MESSAGE_OK = "ok";
var MESSAGE_CREATED = "created";
var MESSAGE_NOTFOUND = "notFound";
var MESSAGE_BADREQUEST = "badRequest";
var MESSAGE_NOTIMPLEMENTED = "notImplemented";
var MESSAGE_SERVICEUNAVAILABLE = "serviceUnavailable";
var CODE_OK = 200;
var CODE_CREATED = 201;
var CODE_NOTFOUND = 404;
var CODE_BADREQUEST = 400;
var CODE_NOTIMPLEMENTED = 501;
var CODE_SERVICEUNAVAILABLE = 503;


/**
 * Prepares the JSON for an API query response which is successful
 * @param {Number} status Integer status code
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {Object} data The data to include in the response
 */
function prepareResponse(status, rootUrl, queryPath, data) {
  var response = {};
  prepareMeta(response, status);
  if(rootUrl && queryPath) {
    prepareLinks(response, rootUrl, queryPath);
  }
  if(data) {
    prepareData(response, rootUrl, data);
  }
  return response;
};


/**
 * Prepares and adds the _meta to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {Number} status Integer status code
 */
function prepareMeta(response, status) {
  switch(status) {
    case CODE_OK:
      response._meta = { "message": MESSAGE_OK,
                         "statusCode": CODE_OK };
      break;
    case CODE_CREATED:
      response._meta = { "message": MESSAGE_CREATED,
                         "statusCode": CODE_CREATED };
      break;
    case CODE_NOTFOUND:
      response._meta = { "message": MESSAGE_NOTFOUND,
                         "statusCode": CODE_NOTFOUND };
      break; 
    case CODE_NOTIMPLEMENTED:
      response._meta = { "message": MESSAGE_NOTIMPLEMENTED,
                         "statusCode": CODE_NOTIMPLEMENTED };
      break;
    case CODE_SERVICEUNAVAILABLE:
      response._meta = { "message": MESSAGE_SERVICEUNAVAILABLE,
                         "statusCode": CODE_SERVICEUNAVAILABLE };
      break;
    default:
      response._meta = { "message": MESSAGE_BADREQUEST,
                         "statusCode": CODE_BADREQUEST }; 
  }
};


/**
 * Prepares and adds the _links to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 */
function prepareLinks(response, rootUrl, queryPath) {
  var selfLink = { "href": rootUrl + queryPath };
  response._links = {};
  response._links["self"] = selfLink;
}


/**
 * Prepares and adds the devices to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {String} rootUrl The root URL of the original query.
 * @param {Object} data The data to include in the response
 */
function prepareData(response, rootUrl, data) {
  if(data.places) {
    var places = data.places;
    for(place in places) {
      places[place].href = rootUrl + "/places/" + place;
    }
    response.places = places;
  }
  if(data.devices) {
    var devices = data.devices;
    for(device in devices) {
      devices[device].href = rootUrl + "/devices/" + device;
    }
    response.devices = devices;
  }
}


module.exports.OK = CODE_OK;
module.exports.CREATED = CODE_CREATED;
module.exports.NOTFOUND = CODE_NOTFOUND;
module.exports.BADREQUEST = CODE_BADREQUEST;
module.exports.NOTIMPLEMENTED = CODE_NOTIMPLEMENTED;
module.exports.SERVICEUNAVAILABLE = CODE_SERVICEUNAVAILABLE;
module.exports.prepareResponse = prepareResponse;
