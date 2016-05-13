//Other
var TestingFunctions = require('./testing');
runTests();




//Runs tests
//Parameters: None
//Returns: Nothing
function runTests(){
	
	//-----------------Test validate functions-----------------
	//validateSearch(userInput);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "", "", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "", "100"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "", "all", "100"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "unisex", "all", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "male", "all", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "female", "all", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "random", "all", ""])[0], false);
	
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "neutral", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "serious", "100"])[0], true) 
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "funny", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "random", ""])[0], false);
	
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "1"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "12"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "0"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "-1"])[0], false); 
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "-12"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "e"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "abcd"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "all", "all", "SELECT * FROM names"])[0], false);
	
	TestingFunctions.BasicTesting.assert(validateSearch(["", "unisex", "neutral", "100"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "male", "neutral", "12"])[0], true);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "female", "random", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "female", "neutral", "-1"])[0], false);
	TestingFunctions.BasicTesting.assert(validateSearch(["", "random", "random", "-1"])[0], false);
	
	//validateCreate(userInput);
	TestingFunctions.BasicTesting.assert(validateCreate(["", "", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "unisex", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "unisex", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "male", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "female", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "unisex", "funny"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "male", "serious"])[0], true);
	
	TestingFunctions.BasicTesting.assert(validateCreate(["", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["na", "male", "serious"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["n", "male", "serious"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "unisex", ""])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "random", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["name", "unisex", "random"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["", "", "random"])[0], false);
	
	TestingFunctions.BasicTesting.assert(validateCreate(["testing", "unisex", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["testing%", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["%testing%", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["testing123", "unisex", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["123testing", "unisex", "neutral"])[0], true);
	TestingFunctions.BasicTesting.assert(validateCreate(["<script>alert('hello')</script>", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(["!@#$$%^&", "unisex", "neutral"])[0], false);
	TestingFunctions.BasicTesting.assert(validateCreate(['""', "unisex", "neutral"])[0], false);
	
	//compareVarAgainstVarArray(compStr, compStrArray);
	TestingFunctions.BasicTesting.assert(compareVarAgainstVarArray("", ["","test1","test2"]), true);
	TestingFunctions.BasicTesting.assert(compareVarAgainstVarArray("test1", ["","test1","test2"]), true);
	TestingFunctions.BasicTesting.assert(compareVarAgainstVarArray("test2", ["","test1","test2"]), true);
	TestingFunctions.BasicTesting.assert(compareVarAgainstVarArray("", ["test1","test2"]), false);
	TestingFunctions.BasicTesting.assert(compareVarAgainstVarArray("test3", ["","test1","test2"]), false);
	
	TestingFunctions.BasicTesting.outputTestResults();
}
