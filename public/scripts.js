var request;


$(document).ready(function(){
	
	$("#subButCreate").click(function() {
		$("#createMessage").text("");
		var userInputName   = $("#inputName").val();
		var userInputGender = $("#inputGender").val();
		var userInputMood   = $("#inputMood").val();
		
		request = $.ajax({
			url: "submitName",
			method: "POST",
			data: { 
				  name: userInputName,
				gender: userInputGender,
				  mood: userInputMood
			},
			dataType: "html"
		});
		
		request.done ( function( msg ){
			var data = JSON.parse(msg);
			console.log(data);
			$("#createMessage").text(data.message);
		});
		
		request.fail(function ( jqXHR, textStatus ) {
			$("#createMessage").text("Failed to submit/recieve data. Error: " + textStatus);
		});
	});
	
	
	$("#subButSearch").click( search );
	search();//run search once once the page loads
});


function search() {
	$("#errorMessage").text("");
	var userInputName   = $("#searchInput").val().trim();
	var userInputGender = $("#searchGender").val().trim();
	var userInputMood   = $("#searchMood").val().trim();
	var userInputLength = $("#searchLength").val().trim();
	
	request = $.ajax({
		url: "searchName",
		method: "POST",
		data: { 
			  name: userInputName,
			gender: userInputGender,
			  mood: userInputMood,
			length: userInputLength
		},
		dataType: "html"
	});
	
	request.done ( function( msg ){
		var data = JSON.parse(msg);
		console.log(data);
		$("#searchMessage").text(data.message);
	});
	
	request.fail(function ( jqXHR, textStatus ) {
		$("#searchMessage").text("Failed to submit/recieve data. Error: " + textStatus);
	});		
}