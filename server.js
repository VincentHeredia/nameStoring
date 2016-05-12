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

//Other
var testNum = 0;
runTests();

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

//
//Parameters: 
//Returns: 
app.post('/submitName', urlencodedParser, function (req, res) {
	var userInput = [];
	userInput[0] = req.body.name.trim() || "";
	userInput[1] = req.body.gender.trim() || "";
	userInput[2] = req.body.mood.trim() || "";
	userInput[3] = userInputName.length;
	
	displayConsoleMessage(req.body,"(/submitName)");
	
	var validationResults = validateCreate(userInput);
	console.log("Validation Results: " + validationResults);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	if(!validationResults[0]){ 
		var errorMessages = validationResults[1]
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	client.query("INSERT INTO names(name, gender, mood, length) VALUES ($1, $2, $3, $4);", [userInput[0], userInput[1], userInput[2], userInput[3]]);
	
	return res.send({ message: "Submitted Name" });
});

//
//Parameters: 
//Returns: 
app.post('/searchName', urlencodedParser, function (req, res) {
	var userInput = [];
	userInput[0] = req.body.name.trim() || "";
	userInput[1] = req.body.gender.trim() || "";
	userInput[2] = req.body.mood.trim() || "";
	userInput[3] = req.body.length.trim() || "";
	
	displayConsoleMessage(userInput,"(/searchName)");
	
	validationResults = validateSearch(userInput);
	console.log("Validation Results: " + validationResults);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	if(!validationResults[0]){ 
		var errorMessages = validationResults[1];
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	//Query Database
	var query = client.query(searchForNames(userInput));
	var queryResults = [];
	query.on('error', function(error) { console.log(error); });
	query.on('row', function(row) { queryResults.push(row); });
	query.on('end', function(result) {
		return res.send({ 
			message: "Successful Query",
			result: queryResults
		});
    });
});

/*****************end of post and gets*******************/


/*****************query functions*******************/

//
//Parameters: 
//Returns: 
function searchForNames (userInput) {
	var queryString = "SELECT * FROM names";
	
	
	
	queryString += " ORDER BY name"
	console.log(queryString);
	return queryString;
}

/*****************end of query functions*******************/


/*****************validation functions*******************/

//Validates create input from the user
//Parameters: user input's for the different fields (as an array) (name, gender, mood, length)
//Returns: true if the validation passes, false if the validation fails
function validateCreate(userInput) {
	var errorFlag = true;
	var errorMessages = "Error: ";
	
	if(userInput[0] == ""){ errorFlag = false; errorMessages += "Name is blank, "; }
	if(userInput[1] == ""){ errorFlag = false; errorMessages += "Gender is blank, "; }
	if(userInput[2] == ""){ errorFlag = false; errorMessages += "Mood is blank, "; }
	
	return [errorFlag, errorMessages];
}

//Validates search input from the user
//Parameters: user input's for the different fields (as an array) (name, gender, mood, length)
//Returns: true if the validation passes, false if the validation fails
function validateSearch(userInput){
	var errorFlag = true;
	var errorMessages = "Error: ";
	
	var validGenders = ["","unisex","male","female"];
	var validMoods = ["","neutral","serious","funny"];
	
	//validate gender
	if(compareStringVsStringArray(userInput[1], validGenders)){ 
		errorFlag = false; errorMessages += "Invalid gender, "; 
	}
	
	//validate mood
	if(compareStringVsStringArray(userInput[2], validMoods)){ 
		errorFlag = false; errorMessages += "Invalid mood, "; 
	}
	
	//validate length
	var validateCheck = new RegExp("[^0-9]");
	if((validateCheck.test(userInput[3]) || (userInput[3] < 1)) && (userInput[3] != "")) { 
		errorFlag = false; errorMessages += "Length must be greater than 0, "; 
	}
	
	return [errorFlag, errorMessages];
}

//Compares a string against each string in an array
//Parameters: the string to compare, the string array
//Returns: true if there was a match, false if there isnt a match
function compareStringVsStringArray(compStr, compStrArray){
	for(i=0; i < compStrArray.length; i++){
		if(compStr == compStrArray[i]){
			return true;
		}
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




//
//Parameters: 
//Returns: 
function runTests(){
	
	//-----------------Test validate functions-----------------
	//validateSearch(userInputName, userInputGender, userInputMood, userInputLength);
	assert(validateSearch(["", "", "", ""])[0], true);
	assert(validateSearch(["", "unisex", "", ""])[0], true);
	assert(validateSearch(["", "male", "", ""])[0], true);
	assert(validateSearch(["", "female", "", ""])[0], true);
	assert(validateSearch(["", "random", "", ""])[0], false);
	
	assert(validateSearch(["", "", "neutral", ""])[0], true);
	assert(validateSearch(["", "", "serious", ""])[0], true);
	assert(validateSearch(["", "", "funny", ""])[0], true);
	assert(validateSearch(["", "", "random", ""])[0], false);
	
	assert(validateSearch(["", "", "", "1"])[0], true);
	assert(validateSearch(["", "", "", "12"])[0], true);
	assert(validateSearch(["", "", "", "0"])[0], false);
	assert(validateSearch(["", "", "", "-1"])[0], false);
	assert(validateSearch(["", "", "", "-12"])[0], false);
	
	assert(validateSearch(["", "unisex", "neutral", ""])[0], true);
	assert(validateSearch(["", "male", "neutral", "12"])[0], true);
	assert(validateSearch(["", "female", "random", ""])[0], false);
	assert(validateSearch(["", "female", "neutral", "-1"])[0], false);
	assert(validateSearch(["", "random", "random", "-1"])[0], false);
	
	//validateCreate(userInputName, userInputGender, userInputMood);
	
	
	//compareStringVsStringArray(compStr, compStrArray);
	
	
	//-----------------Test query functions`-----------------
	//searchForNames (userInputName, userInputGender, userInputMood, userInputLength);
	
}

function assert(functionResult, expectedResult){
	var testMessage = "Test Numer: " + testNum;	
	if(functionResult == expectedResult){
		testMessage += " Success, ";
	}
	else {
		testMessage += " Failed,  ";
	}
	testMessage += " Expect: " + expectedResult + " Returned: " + functionResult;
	console.log(testMessage);
	testNum++;
}


