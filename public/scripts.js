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
			
			if(!(data.message.substring(0,5) == "Error:")){
				$("#searchInput").val(userInputName);
				$("#searchGender").val("all");
				$("#searchMood").val("all");
				$("#searchLength").val("");
			}
			search();
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
		displayQuery(data.result);
	});
	
	request.fail(function ( jqXHR, textStatus ) {
		$("#searchMessage").text("Failed to submit/recieve data. Error: " + textStatus);
	});		
}



function displayQuery(result) {
	$("#searchResult tr").remove();
	
	var htmlDisplay = "<tr><th>Name</th><th>Gender</th><th>Mood</th><th>Length</th></tr>";
	
	for(i=0; i < result.length; i++){
		htmlDisplay += "<tr>"
		+ "<td>" + encodeHTML(result[i].name) + "</td>"
		+ "<td>" + encodeHTML(result[i].gender) + "</td>"
		+ "<td>" + encodeHTML(result[i].mood) + "</td>"
		+ "<td>" + encodeHTML(String(result[i].length)) + "</td>"
		+ "</tr>";
	}
	
	$("#searchResult table").append(htmlDisplay);
}

function encodeHTML(str) {	
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/;/g, '').replace(/'/g, '');
}