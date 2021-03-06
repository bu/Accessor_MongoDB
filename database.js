// modules
var mongodb = require("mongodb"),
	path = require("path");

// global variable or settings
var config = null;

// local variable
var mongo_instance = null;

function connectDB(callback) {
	if(config === null) {
		config = require( path.join(__dirname, "..", "..", "config", "databaseConfig") );
	}

	if(!config.port) {
		config.port = mongodb.Connection.DEFAULT_PORT;
	}

	var server = new mongodb.Server(config.host, config.port, config.server_options),
		db_connector = new mongodb.Db(config.name, server, config.db_options);

	db_connector.open(function(err, database_instance) {
		mongo_instance = database_instance;

		if(mongo_instance === null) {
			return callback();
		}

		database_instance.on("close", function(err) {
			mongo_instance = null;
		});

		if(!config.username || !config.password) {
			return callback();
		}

		database_instance.authenticate(config.username, config.password, function(err, status) {
			if(err) {
				return callback(err);
			}

			if(!status) {
				return 	callback("Authentication error");
			}

			return callback();
		});
	});
}

exports.setConfig = function(config_object) {
	config = config_object;

	return true;
};

exports.getInstance = function(callback) {
	function returnInstance(err) {
		if(err) {
			return callback(err);
		}

		if(mongo_instance === null) {
			return callback(new Error("No database connection."));
		}

		return callback(null, mongo_instance);
	}

	if(typeof mongo_instance === "undefined" || mongo_instance === null) {
		connectDB(returnInstance);
		return;
	}
	
	return returnInstance();
};
