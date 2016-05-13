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
var testSuccess = 0;
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
	
	client.query("INSERT INTO names(name, gender, mood, length) VALUES ($1, $2, $3, $4);", userInput);
	
	return res.send({ message: "Submitted Name" });
});

//Handles user's request for the names database search
app.post('/searchName', urlencodedParser, function (req, res) {
	var userInput = [];
	userInput[0] = (req.body.name.trim().toLowerCase() + "%") || "%";
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
	
	//validate gender
	if(!compareVarAgainstVarArray(userInput[1], validGenders)){ 
		errorFlag = false; errorMessages += "Invalid gender, "; 
	}
	
	//validate mood
	if(!compareVarAgainstVarArray(userInput[2], validMoods)){ 
		errorFlag = false; errorMessages += "Invalid mood, "; 
	}
	
	//validate length
	var validateCheck = new RegExp("[^0-9]");
	if( validateCheck.test(userInput[3]) || (userInput[3] < 1) ) { 
		errorFlag = false; errorMessages += "Length must be greater than 0, "; 
	}
	
	return [errorFlag, errorMessages];
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




//Runs tests
//Parameters: None
//Returns: Nothing
function runTests(){
	
	//-----------------Test validate functions-----------------
	//validateSearch(userInput);
	assert(validateSearch(["", "", "", ""])[0], false);
	assert(validateSearch(["", "all", "", "100"])[0], false);
	assert(validateSearch(["", "", "all", "100"])[0], false);
	assert(validateSearch(["", "all", "all", ""])[0], false);
	assert(validateSearch(["", "all", "all", "100"])[0], true);
	assert(validateSearch(["", "unisex", "all", "100"])[0], true);
	assert(validateSearch(["", "male", "all", "100"])[0], true);
	assert(validateSearch(["", "female", "all", "100"])[0], true);
	assert(validateSearch(["", "random", "all", ""])[0], false);
	
	assert(validateSearch(["", "all", "neutral", "100"])[0], true);
	assert(validateSearch(["", "all", "serious", "100"])[0], true) 
	assert(validateSearch(["", "all", "funny", "100"])[0], true);
	assert(validateSearch(["", "all", "random", ""])[0], false);
	
	assert(validateSearch(["", "all", "all", "1"])[0], true);
	assert(validateSearch(["", "all", "all", "12"])[0], true);
	assert(validateSearch(["", "all", "all", "0"])[0], false);
	assert(validateSearch(["", "all", "all", "-1"])[0], false); 
	assert(validateSearch(["", "all", "all", "-12"])[0], false);
	assert(validateSearch(["", "all", "all", "e"])[0], false);
	assert(validateSearch(["", "all", "all", "abcd"])[0], false);
	assert(validateSearch(["", "all", "all", "SELECT * FROM names"])[0], false);
	
	assert(validateSearch(["", "unisex", "neutral", "100"])[0], true);
	assert(validateSearch(["", "male", "neutral", "12"])[0], true);
	assert(validateSearch(["", "female", "random", ""])[0], false);
	assert(validateSearch(["", "female", "neutral", "-1"])[0], false);
	assert(validateSearch(["", "random", "random", "-1"])[0], false);
	
	//validateCreate(userInput);
	assert(validateCreate(["", "", ""])[0], false);
	assert(validateCreate(["Name", "", "neutral"])[0], false);
	assert(validateCreate(["Name", "unisex", ""])[0], false);
	assert(validateCreate(["", "unisex", "neutral"])[0], false);
	assert(validateCreate(["Name", "unisex", "neutral"])[0], true);
	assert(validateCreate(["Name", "male", "neutral"])[0], true);
	assert(validateCreate(["Name", "female", "neutral"])[0], true);
	assert(validateCreate(["Name", "unisex", "funny"])[0], true);
	assert(validateCreate(["Name", "male", "serious"])[0], true);
	
	assert(validateCreate(["", "unisex", "neutral"])[0], false);
	assert(validateCreate(["Na", "male", "serious"])[0], false);
	assert(validateCreate(["n", "male", "serious"])[0], false);
	assert(validateCreate(["Name", "", "neutral"])[0], false);
	assert(validateCreate(["Name", "unisex", ""])[0], false);
	assert(validateCreate(["Name", "random", "neutral"])[0], false);
	assert(validateCreate(["Name", "unisex", "random"])[0], false);
	assert(validateCreate(["", "", "random"])[0], false);
	
	//compareVarAgainstVarArray(compStr, compStrArray);
	assert(compareVarAgainstVarArray("", ["","test1","test2"]), true);
	assert(compareVarAgainstVarArray("test1", ["","test1","test2"]), true);
	assert(compareVarAgainstVarArray("test2", ["","test1","test2"]), true);
	assert(compareVarAgainstVarArray("", ["test1","test2"]), false);
	assert(compareVarAgainstVarArray("test3", ["","test1","test2"]), false);
	
	
	outputTestResults();
}

//Basic test function, output's test's results to the console
//Parameters: the function result (any datatype), the expected result (any datatype),  Must match datatype
//Returns: Test result string
function assert(functionResult, expectedResult){
	var testMessage = "Test Numer: " + testNum;	
	var testFailed = false;
	if(functionResult === expectedResult){ testMessage += " Success, "; testSuccess++;}
	else { testMessage += " Failed,  "; testFailed = true; }
	testMessage += "\n   Expect: " + expectedResult + "\n Returned: " + functionResult;
	if(testFailed) { console.log(testMessage + "\n"); }
	testNum++;
	return testMessage;
}

//Outputs the total amount of tests along with the amount of successes and failures
//Parameters: None
//Returns: Nothing
function outputTestResults(){
	console.log("\nTest Number: " + testNum);
	console.log("Tests Successes: " + testSuccess);
	console.log("Tests Failures: " + (testNum - testSuccess) + "\n");
}


