/*eslint-env browser, jquery*/

function getURLParameter(nameVar) {
  return decodeURIComponent((new RegExp('[?|&]' + nameVar + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;


}

var nameArray;

$(document).ready(function() {
	
	console.log("Hallo Pallo");
	var decodeduri = decodeURIComponent(window.location.search.substring(1));
	console.log(decodeduri);
	
	try {
	var result = nameArray = JSON.parse(pako.inflate(decodeduri, { to: 'string' }));
	} catch (err) {
	  console.log(err);
	}
	//console.log(nameArray);
	if(nameArray === "") {
		
	}
	
	var displayString ="<p>";
	displayString += "Hallo "+nameArray[0]+", du bist jetzt in der Wichtelgruppe "+nameArray[6]+".<br>Klicke auf den Button um zu sehen wer deine Geschenke bekommt.";
	displayString += "<br>Die Auswertung wurde am: "+nameArray[7]+" um "+nameArray[8]+" Uhr ausgeführt";
	displayString += "</p>";
	
	$("#textAnzeige1").html(displayString);
});

$("#anzeigeButton").on("click", function() {
	console.log(nameArray[4].length);
	var displayString = "<p>";
        var displayString2 = "<p>";
	displayString += "Du darfst: ";
	if(nameArray[4].length !== 0)
		{
		for(var i = 0; i < nameArray[4].length; i++)
		{
			if(nameArray[4].length === i+1 && i !== 0) displayString += " und ";
                        if(nameArray[4].length !== i+1 && i !== 0) displayString += ", ";
			displayString += nameArray[4][i];
			
		}
	}
	else displayString += "niemanden ";
	displayString += " beschenken.";
	
	$("#textAnzeige2").html(displayString);
        
        console.log("KNUTZ null");
        
 	if(nameArray[9].length !== 0)
        {
            displayString2 = "Deine Geschenkpartner sind: <br>"; 
		for(var i = 0; i < nameArray[9].length; i++)
		{
                   displayString2 += "Für ";
                   displayString2 += nameArray[4][i];
                   displayString2 += ": ";
                    for(var j = 0; j < nameArray[9][i].length; j++)
                    {
                        var k = 0;
                        if(nameArray[9][i][j] !== nameArray[0]) {                                                   
                            //console.log("KNUTZ drei", nameArray[9][i][j]);
                            if(k !== 0) displayString2 += ", ";
                            k++;
                            displayString2 += nameArray[9][i][j];
                            displayString2 += " ";
                        }
                    }
                    displayString2 += "<br>";

		}
	}       
        $("#textAnzeige3").html(displayString2);
        
});