/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var associationManager = require('./associationmanager');
var placeManager = require('./placemanager');
var responseHandler = require('./responsehandler');

var HTTP_PORT = 3004;


/**
 * Chickadee Class
 * Hyperlocal context associations store.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Chickadee(options) {
  var self = this;
  options = options || {};
  self.specifiedHttpPort = options.httpPort || HTTP_PORT;
  self.httpPort = process.env.PORT || self.specifiedHttpPort;

  self.associations = new associationManager();
  self.places = new placeManager();

  self.app = express();
  self.app.use(bodyParser.urlencoded({ extended: true }));
  self.app.use(bodyParser.json());

  self.app.use(function(req, res, next) {
    req.instance = self;
    next();
  });

  self.app.use('/id', require('./routes/id'));
  self.app.use('/at', require('./routes/at'));

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");

  self.app.listen(self.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
};


/**
 * Add a new device association.
 * @param {Object} identifier The unique identifier of the device.
 * @param {String} url The URL associated with the device.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.addDevice = function(identifier, url, rootUrl, queryPath,
                                         callback) {
  var self = this;

  self.associations.create(identifier, url, function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.CREATED;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Get an existing device association.
 * @param {String} id The id of the device association.
 * @param {Object} parameters The parameters to search on.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getDevice = function(id, parameters, rootUrl, queryPath,
                                         callback) {
  var self = this;

  self.associations.retrieve(id, parameters, function(err, id, device) {
    if(device && (!err)) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status); 
    }
  });
}


/**
 * Update an existing device association.
 * @param {String} id The id of the device association.
 * @param {Object} identifier The unique identifier of the device.
 * @param {String} url The URL associated with the device.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.setDevice = function(id, identifier, url, rootUrl,
                                         queryPath, callback) {
  var self = this;

  self.associations.replace(id, identifier, url, function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath); 
      callback(response, status);
    }
  });
}


/**
 * Remove an existing device association.
 * @param {String} id The id of the device association.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.removeDevice = function(id, rootUrl, queryPath, callback) {
  var self = this;

  self.associations.remove(id, function(err) {
    if(!err) {
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath)
      callback(response, status);
    }
  });
}


/**
 * Add a new place association.
 * @param {String} place The unique name of the place.
 * @param {Array} identifiers The unique identifiers associated with the place.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.addPlace = function(place, identifiers, rootUrl, queryPath,
                                        callback) {
  var self = this;

  self.places.create(place, identifiers, function(err, id, place) {
    if(!err) {
      var data = { places: { } };
      data.places[id] = place;
      var status = responseHandler.CREATED;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
  });
}


/**
 * Get the association for the given place.
 * @param {String} place The name of the place.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getPlace = function(name, rootUrl, queryPath, callback) {
  var self = this;

  self.places.retrieve(name, function(err, id, place) {
    if(place && (!err)) {
      var data = { places: { } };
      data.places[name] = place;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status); 
    }
  });
}


/**
 * Update an existing place association.
 * @param {String} place The unique name of the place.
 * @param {Array} identifiers The unique identifiers associated with the place.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.setPlace = function(place, identifiers, rootUrl, queryPath,
                                        callback) {
  var self = this;

  self.places.replace(place, identifiers, function(err, id, place) {
    if(!err) {
      var data = { places: { } };
      data.places[id] = place;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
  });
}


/**
 * Remove an existing place association.
 * @param {String} place The unique name of the place.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.removePlace = function(place, rootUrl, queryPath,
                                           callback) {
  var self = this;

  self.places.remove(place, function(err) {
    if(!err) {
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
  });
}


/**
 * Make all known device associations by adding the corresponding URLs.
 * @param {Object} identifiers The list of identifiers to associate.
 * @param {callback} callback Function to call on completion.
 */
// TODO: make this RESTful and make it update id when appropriate
Chickadee.prototype.addUrls = function(identifiers, callback) {
  identifiers = identifiers || {};
  var self = this;

  self.associations.addUrls(identifiers, callback);
}


module.exports = Chickadee;
