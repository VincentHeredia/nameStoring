
var BasicTesting = {
	testNum: 0,
	testSuccess: 0,
	
	//Basic test function, output's test's results to the console
	//Parameters: the function result (any datatype), the expected result (any datatype),  Must match datatype
	//Returns: Test result string
	assert: function (functionResult, expectedResult) {
		var testMessage = "Test Numer: " + this.testNum;	
		var testFailed = false;
		if(functionResult === expectedResult){ testMessage += " Success, "; this.testSuccess++;}
		else { testMessage += " Failed,  "; testFailed = true; }
		testMessage += "\n   Expect: " + expectedResult + "\n Returned: " + functionResult;
		if(testFailed) { console.log(testMessage + "\n"); }
		this.testNum++;
		return testMessage;
	},
	
	//Outputs the total amount of tests along with the amount of successes and failures
	//Parameters: None
	//Returns: Nothing
	outputTestResults: function () {
		console.log("\nTest Number: " + this.testNum);
		console.log("Tests Successes: " + this.testSuccess);
		console.log("Tests Failures: " + (this.testNum - this.testSuccess) + "\n");
	}
}

module.exports.BasicTesting = BasicTesting;