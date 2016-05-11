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
//var calc = require('./calc');

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

app.post('/submitName', urlencodedParser, function (req, res) {

	userInputName = req.body.name.trim() || "";
	userInputGender = req.body.gender.trim() || "";
	userInputMood = req.body.mood.trim() || "";
	userInputLength = userInputName.length;
	
	displayConsoleMessage(userInputName, userInputGender, userInputMood, userInputLength, "(/submitName)");
	
	var validationResults = validateCreate(userInputName, userInputGender, userInputMood);
	console.log("Validation Results: " + validationResults);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	if(validationResults[0]){ 
		var errorMessages = validationResults[1]
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	client.query("INSERT INTO names(name, gender, mood, length) VALUES ($1, $2, $3, $4);", [userInputName, userInputGender, userInputMood, userInputLength]);
	
	return res.send({ message: "Submitted Name" });
});


app.post('/searchName', urlencodedParser, function (req, res) {

	userInputName = req.body.name.trim() || "";
	userInputGender = req.body.gender.trim() || "";
	userInputMood = req.body.mood.trim() || "";
	userInputLength = req.body.length.trim() || "";
	
	displayConsoleMessage(userInputName, userInputGender, userInputMood, userInputLength, "(/searchName)");
	
	validationResults = validateSearch(userInputName, userInputGender, userInputMood, userInputLength);
	console.log("Validation Results: " + validationResults);
	
	res.status(200); //Not needed, automaticly set by express
	res.set('Content-Type', 'text/plain');
	
	if(validationResults[0]){ 
		var errorMessages = validationResults[1]
		errorMessages = errorMessages.substring(0, errorMessages.length - 2);
		return res.send({ message: errorMessages });
	}
	
	return res.send({ message: "Successful Query" });
});

/*****************end of post and gets*******************/

/*****************validation functions*******************/

function validateCreate(userInputName, userInputGender, userInputMood) {
	var errorFlag = false;
	var errorMessages = "Error: ";
	
	if(userInputName == ""){ errorFlag = true; errorMessages += "Name is blank, "; }
	if(userInputGender == ""){ errorFlag = true; errorMessages += "Gender is blank, "; }
	if(userInputMood == ""){ errorFlag = true; errorMessages += "Mood is blank, "; }
	
	return [errorFlag, errorMessages];
}

function validateSearch(userInputName, userInputGender, userInputMood, userInputLength){
	var errorFlag = false;
	var errorMessages = "Error: ";
	
	if(userInputGender == ""){ errorFlag = true; errorMessages += "Gender is blank, "; }
	if(userInputMood == ""){ errorFlag = true; errorMessages += "Mood is blank, "; }
	var validateCheck = new RegExp("[^0-9]");
	if(validateCheck.test(userInputLength) || (userInputLength < 1) && (userInputLength != "")) { errorFlag = true; errorMessages += "Length must be greater than 0, "; }
	
	return [errorFlag, errorMessages];
}

/*****************end of validation functions*******************/


/*****************miscellaneous functions*******************/

function displayConsoleMessage(userInputName, userInputGender, userInputMood, userInputLength, type) {
	console.log("-------------------REQUEST-------------------");
	console.log("Got Post From Client " + type);
	console.log("  NAME: " + userInputName);
	console.log("GENDER: " + userInputGender);
	console.log("  MOOD: " + userInputMood);
	console.log("LENGTH: " + userInputLength);
	console.log("---------------------------------------------");
}

/*****************end of miscellaneous functions*******************/


/*
var query = client.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
query.on("row", function (row, result) {
    result.addRow(row);
});
*/









