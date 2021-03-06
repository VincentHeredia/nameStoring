/*****************Setup*******************/

//Server
var express = require('express')
var app = express();
var bodyParser = require('body-parser');

//Database
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_NAMES;
var client = new pg.Client(connectionString);
client.connect();

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static('public'));

var port = Number(process.env.PORT || 8000);//get the port from the environment or use 8000
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Express app listening at http://%s:%s', host, port)
});

/*****************End of Setup*******************/


/*****************post and gets*******************/

//Handles user's request for creating a new row in the database names
app.post('/submitName', urlencodedParser, function (req, res) {
	var userInput = [];
	userInput[0] = req.body.name.trim().toLowerCase() || "";
	userInput[1] = req.body.gender.trim().toLowerCase() || "";
	userInput[2] = req.body.mood.trim().toLowerCase() || "";
	userInput[3] = userInput[0].length;
	
	displayConsoleMessage(userInput,"(/submitName)");
	
	//validate user input
	var validationResults = validateCreate(userInput);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	//if validation failed
	if(!validationResults[0]){ 
		var errorMessages = validationResults[1];
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	//client.query("INSERT INTO names(name, gender, mood, length) VALUES ($1, $2, $3, $4);", userInput);
	var query = client.query("INSERT INTO names (name, gender, mood, length)"
			   + "SELECT CAST($1 AS VARCHAR), $2, $3, $4"
			   + "WHERE NOT EXISTS (SELECT * FROM names WHERE name = $1)"
			   , userInput);
	query.on('error', function(error) { 
		console.log(error); 
		return res.send({ message: error });
	});
	query.on('end', function(result) {
		return res.send({ message: "Submitted Name" });
    });
});

//Handles user's request for the names database search
app.post('/searchName', urlencodedParser, function (req, res) {
	var userInput = [];
	userInput[0] = req.body.name.trim().toLowerCase() || "";
	userInput[1] = req.body.gender.trim().toLowerCase() || "";
	userInput[2] = req.body.mood.trim().toLowerCase() || "";
	userInput[3] = req.body.length.trim() || "100";
	
	displayConsoleMessage(userInput,"(/searchName)");
	
	//validate user input
	validationResults = validateSearch(userInput);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	//if validation failed
	if(!validationResults[0]){ 
		var errorMessages = validationResults[1];
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	userInput[0] += "%";
	console.log(userInput[0]);
	if(userInput[1] == "all"){ userInput[1] = "%" }
	if(userInput[2] == "all"){ userInput[2] = "%" }
	
	//Query Database
	var query = client.query({
		text: "SELECT * FROM names WHERE name LIKE $1 AND gender LIKE $2 AND mood LIKE $3 AND length <= $4 ORDER BY name", 
		values: userInput
	});
	var queryResults = [];
	query.on('error', function(error) { console.log(error); });
	query.on('row', function(row) { queryResults.push(row); });
	query.on('end', function(result) {
		//Change the first letter of each name to uppercase
		for(i=0; i < queryResults.length; i++){
			queryResults[i].name = queryResults[i].name.substring(0,1).toUpperCase() + queryResults[i].name.substring(1,queryResults[i].name.length);
		}
		queryResults = scrubNamesDBOutput(queryResults);//removes invalid characters from the query
		return res.send({ 
			message: "Successful Query",
			result: queryResults
		});
    });
});

/*****************end of post and gets*******************/



/*****************validation functions*******************/

//Validates create input from the user
//Parameters: user input's for the different fields (string array) (name, gender, mood, length)
//Returns: true if the validation passes, false if the validation fails
function validateCreate(userInput) {
	var errorFlag = true;
	var errorMessages = "Error: ";
	
	var validGenders = ["unisex","male","female"];
	var validMoods = ["neutral","serious","funny"];
	
	//Only allow the following characters a-z, 0-9, %
	for (i=0; i < userInput.length; i++){
		if(/[^a-z0-9]/.test(userInput[i])){
			errorFlag = false; errorMessages += "Name contains invalid characters, "; 
		}
	}
	
	//Check if name is blank
	if(userInput[0] == ""){ 
		errorFlag = false; errorMessages += "Name is blank, "; 
	}
	
	//Check if the name is a duplicate
	
	
	//Check if the name is longer then 2 letters
	if(userInput[0].length < 3) {
		errorFlag = false; errorMessages += "Name is too short, "; 
	}
	
	//Check gender and moods against array's of valid values
	if(!compareVarAgainstVarArray(userInput[1], validGenders)){ 
		errorFlag = false; errorMessages += "Invalid gender, "; 
	}
	if(!compareVarAgainstVarArray(userInput[2], validMoods)){ 
		errorFlag = false; errorMessages += "Invalid mood, "; 
	}
	
	return [errorFlag, errorMessages];
}

//Validates search input from the user
//Parameters: user input's for the different fields (string array) (name, gender, mood, length)
//Returns: true if the validation passes, false if the validation fails
function validateSearch(userInput){
	var errorFlag = true;
	var errorMessages = "Error: ";
	
	var validGenders = ["unisex","male","female","all"];
	var validMoods = ["neutral","serious","funny","all"];
	
	//validate name
	if(/[^a-z0-9]/.test(userInput[0])){
		errorFlag = false; errorMessages += "Invalid characters, ";
	}
	
	//validate gender
	if(!compareVarAgainstVarArray(userInput[1], validGenders)){ 
		errorFlag = false; errorMessages += "Invalid gender, "; 
	}
	
	//validate mood
	if(!compareVarAgainstVarArray(userInput[2], validMoods)){ 
		errorFlag = false; errorMessages += "Invalid mood, "; 
	}
	
	//validate length
	if( /[^0-9]/.test(userInput[3]) || (userInput[3] < 1) ) { 
		errorFlag = false; errorMessages += "Length must be greater than 0, "; 
	}
	
	return [errorFlag, errorMessages];
}

//Replaces some special characters
//Parameters: output from a database query (name, gender, mood, length)
//Returns: 
function scrubNamesDBOutput(queryResults){
	for (i=0; i < queryResults.length; i++){
		queryResults[i].name = encodeHTML(queryResults[i].name);
		queryResults[i].gender = encodeHTML(queryResults[i].gender);
		queryResults[i].mood = encodeHTML(queryResults[i].mood);
		queryResults[i].length = encodeHTML(String(queryResults[i].length));
	}
	return queryResults;
}

function encodeHTML(str) {	
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/;/g, '').replace(/'/g, '');
}

//Compares a variable against each variable in an array
//Parameters: the string to compare (any datatype), the string array (any datatype), Must match datatype
//Returns: true if there was a match, false if there isnt a match
function compareVarAgainstVarArray(compVar, compVarArray){
	for(i=0; i < compVarArray.length; i++){
		if(compVar === compVarArray[i]){ return true; }
	}
	return false;
}

/*****************end of validation functions*******************/


/*****************miscellaneous functions*******************/

//Displays data from the user's request
//Parameters: request's data (array), url(string)
//Returns: Nothing
function displayConsoleMessage(data, url) {
	console.log("\n-------------------REQUEST-------------------");
	console.log("Got Post From Client " + url);
	for(i=0; i < data.length; i++){ console.log(i + ": " + data[i]); }
	console.log("---------------------------------------------");
}

/*****************end of miscellaneous functions*******************/