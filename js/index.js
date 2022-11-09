/*globals pako */
/*eslint-env browser, jquery, sjcl, node*/
var helpClicked = false;
var optionsClicked = false;
var matrixOpen = false;

$(document).ready(function() {
  var x = document.getElementById("matrixButton");
  x.style.display = "none";
});

$("#hilfeButton").on("click", function(){
  if(!helpClicked) {
  	if(optionsClicked){
      $("#optionenMenu").css( "display", "none" );
  	  $("#optionenButton").text("Optionen anzeigen");
  	  optionsClicked = false;
  	}
  	$("#navigationText").html("Hallo, diese Website ist ein automatischer Wichtelzuteilungsalgorithmus.<br>Nachdem die Anzahl der Teilnemenden Wichtler hinzugefügt wurde kann die Anzahl der Schenkungen und Verschenkungen variiert werden. <br> Die 'Test Zuteilung' erstellt eine mögliche Zuteilung zur veranschaulichung. <br> Die echte Zuteilung erstellt Links, die dann an die Wichtler geschickt werden müssen.<br> WICHTIG! Diese Links nicht selber öffnen und nur der angegebenen Person zusenden!<br> WICHTIG! Nur Links von der gleichen Auswertung versenden (nicht durcheinander mischen!) <br>Folgende Optionen sind verfügbar: <ul><li>Es ist möglich, mehrere Geschenke an den gleichen zu verschenken</li><li>Es ist möglich sich selbst Geschenke zu machen.</li></ul><br>Es ist empfohlen, beide Optionen nicht zu aktivieren.");
  	$("#hilfeButton").text("Hilfe ausblenden");
  	helpClicked = true;
  }
  else {
  	$("#navigationText").html("");
  	$("#hilfeButton").text("Hilfe anzeigen");
  	helpClicked = false;
  }
});

$("#optionenButton").on("click", function(){
  if(!optionsClicked) {
  	if(helpClicked) {
  	  $("#navigationText").html("");
  	  $("#hilfeButton").text("Hilfe ausblenden");
  	  helpClicked = false;
  	}
  	$("#optionenMenu").css( "display", "block" );
  	$("#optionenButton").text("Optionen ausblenden");
  	optionsClicked = true;
  }
  else {
  	$("#optionenMenu").css( "display", "none" );
  	$("#optionenButton").text("Optionen anzeigen");
  	optionsClicked = false;
  }
});

$("#namenButtonHinzu").on("click", function(){
  addNameElement(); 	
});

$("#namenButtonEntf").on("click", function(){
  removeLatestNameElement();
});

var nameElements = 0;

function addNameElement() {	
  if(nameElements === 0) {
  	$("#namenAnzeige").append('<div class="row nameDisplayer"><p class="col-xs-2">Name: </p><p class="col-xs-2">Anzahl verschenkter Geschenke: </p> <p class="col-xs-2">Anzahl erhaltener Geschenke: </p> </div>');
    //display Matrix Button on Click:
  var x = document.getElementById("matrixButton");
  x.style.display = "block";
  }
  $("#namenAnzeige").append('<div class="row nameInput" ><input id="inputName'+nameElements+'" class="col-xs-2" placeholder="Name"></input><input type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" id="inputVerschenkung'+nameElements+'" class="col-xs-2" placeholder="Anzahl Verschenkungen" value="2"></input><input type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" id="inputSchenkung'+nameElements+'" class="col-xs-2" placeholder="Anzahl Schenkungen" value="2"></input></div>');
  //console.log(nameElements);
  nameElements++;
  //$("#namenAnzeige").append('test');
}

function removeLatestNameElement() {
  if(nameElements>0) {
  	nameElements--;
  	$("#inputName"+nameElements).remove();
  	$("#inputEmail"+nameElements).remove();
  	$("#inputVerschenkung"+nameElements).remove();
  	$("#inputSchenkung"+nameElements).remove();
    //console.log(nameElements);
    
    if(nameElements === 0) {
      $(".nameDisplayer").remove();
      var x = document.getElementById("matrixButton");
      x.style.display = "none";
    }
  }
}

$("#matrixButton").on("click", function(){
  matrixOpen = true;
  
  $("#matrixAnzeige").empty();
  $("#matrixAnzeige").append("<div><h4>Beschränkungsmatrix</h4></div><div>Hier kann ausgewählt werden, wer wen beschenken kann und wer nicht.</br>Pro Zeile und Namen bedeutet ein Haken, dass an die entsprechende Person verschenkt werden kann");
  var displayString = "<div class='container'><table class='table table-hover'><thead><tr><td class='col-sm-1'></td>";
  for(var i=0; i<nameElements; i++) {
    displayString += "<td class='col-sm-1'>"+$("#inputName"+i).val()+"</td>";
  }
  displayString += "</tr></thead><tbody><tr>";
  for(var i=0; i<nameElements; i++) {
    displayString += "<td>"+$("#inputName"+i).val()+"</td>";
    for(var j=0; j<nameElements; j++) {
      displayString += "<td><input id='matrixCheckbox"+i+j+"' type='checkbox'";
      if(i != j) displayString += "checked";
      displayString += "></td>";
    }
    displayString += "</tr>"
  }
  
  displayString += "</tbody></table></div>";  
  $("#matrixAnzeige").append(displayString);
  
  for(var i=0; i<nameElements; i++) {
    for(var j=0; j<nameElements; j++) { 
      var buffer = "not checked";
      if($('#matrixCheckbox'+i+j).prop("checked")) buffer = "checked";
      console.log("matrixCheckbox: "+i+" "+j+" "+ buffer );
    }
  } 
});

//ALGORITHM
$("#auswertungButton").on("click", function(){
  assignmentWichtler(true);
});

$("#auswertungRichtigButton").on("click", function(){
    assignmentWichtler(false);
});

function assignmentWichtler(test) {
  var nameArray = [];
  var error = false;
  var summeSchenkungAssigned = 0;
  var optionSelbstgeschenk = $('#optionenSelbstgeschenk').prop("checked");
  var optionDoppelwichtel = $('#optionenMehrfachschenkung').prop("checked");
  var optionenAnzeigeMitschenker = $('#optionenAnzeigeMitschenker').prop("checked");
  var optionTestlauf = test;
  
  $("#auswertungText").html("");
  
  //write elements in array
  for(var i = 0; i < nameElements; i++) {
  	var bufferVerschenkungen = $("#inputVerschenkung"+i).val();
  	var bufferSchenkungen = $("#inputSchenkung"+i).val();
  	bufferVerschenkungen = parseFloat(bufferVerschenkungen);
  	bufferSchenkungen = parseFloat(bufferSchenkungen);
  	
  	nameArray[i] = [$("#inputName"+i).val(), $("#inputEmail"+i).val(), bufferVerschenkungen, bufferSchenkungen,[],[]];
  }
  
  //check if array is valid
  for(var j = 0; j < nameElements; j++) {
  	if(nameArray[j][0] === "") {
  	  $("#auswertungText").html("Kein Name in Zeile: "+(j+1)); 
  	  error = true;
    } 
  }
  
  //check for at least 3 Name Element
  if(nameElements < 3){
  	$("#auswertungText").html("Mindestens 3 Wichtler sind nötig!");
  	error = true;
  }
  
  //check if sums are size
  var summeSchenkung = 0;
  var summeVerschenkung = 0;
  
  for(i = 0; i < nameElements; i++) {
  	summeVerschenkung += nameArray[i][2];
  	summeSchenkung += nameArray[i][3];
  }
  if(summeVerschenkung !== summeSchenkung) {
  	$("#auswertungText").html("Anzahl der Geschenke und Verschenkungen passen nicht überein!");
    error = true;
  }
  
  //check if more presents, than possible
 for(i = 0; i < nameElements; i++) {
  	if(nameArray[i][2] >= nameElements && !optionDoppelwichtel) {
  	  $("#auswertungText").html("Unmögliche Anzahl an Geschenken in Verschenkungen Element: "+(i+1));
  	  error = true;
  	}
  	if(nameArray[i][3] >= nameElements && !optionDoppelwichtel) {
  	  $("#auswertungText").html("Unmögliche Anzahl an Geschenken in Schenkung Element"+(i+1));
  	  error = true;
  	}
  }  
  
  var assignmentNeeded = true;
  var KNUTZvar = 0;
  var KNUTZvar2 = 0;
  
  if(!error) {
      
  	while(assignmentNeeded) {
  	  
      if(summeSchenkung !== summeSchenkungAssigned) {
  	    var randomNumber1 = generateRandomNumber(nameElements);
  	    var randomNumber2 = generateRandomNumber(nameElements);
  	    
  	    if(randomNumber1 !== randomNumber2 || optionSelbstgeschenk) {
          
          //check ob die Verschenkung durch Matrix ausgeschlossen ist
          if($('#matrixCheckbox'+randomNumber1+randomNumber2).prop("checked") || (matrixOpen == false)) {
            console.log(nameArray[randomNumber1][0]+" darf "+nameArray[randomNumber2][0]+" etwas schenken");
			      //check ob noch verschenkungen / schenkungen möglich sind
			      if(nameArray[randomNumber1][4].length < nameArray[randomNumber1][2]
			      && nameArray[randomNumber2][5].length < nameArray[randomNumber2][3]) {
			  
			        //check ob derjenige schon beschenkt wurde
			        if(nameArray[randomNumber1][4].indexOf(randomNumber2) === -1 || optionDoppelwichtel) {
			  	      nameArray[randomNumber1][4].push(randomNumber2);
			       	  nameArray[randomNumber2][5].push(randomNumber1);
			  	      summeSchenkungAssigned++;
			  	      KNUTZvar = 0;
			        }
			        else KNUTZvar++;
			      }
			      else KNUTZvar++;
           }
           else KNUTZvar++;
		     }
         nameArray = nameArray.slice();        
      }
      else {
      	assignmentNeeded = false;
                
  	if(optionTestlauf) {
            displayTestlauf(nameArray);
        }
        else {
          console.log("REAL MAN!");	
                
		  //namen in array schreiben
		  for(i = 0; i<nameArray.length; i++) {
                      
                      console.log("Schenker: ", nameArray[i][0]);
                      console.log("Array4: ", nameArray[i][4]);
                      console.log("Array5: ", nameArray[i][5]);
                      
                      var KNUTZTestArray = [];
                      
		  	for(j = 0; j< nameArray[i][4].length; j++) {
                            //Name des Beschenkten
                            
                            console.log("---------");
                            console.log("Beschenkter: ", nameArray[nameArray[i][4][j]][0]);                          
                            //Name des Mitschenkers

                            if(optionenAnzeigeMitschenker) KNUTZTestArray[j] = nameArray[nameArray[i][4][j]][5];
                            //console.log("TestArray: ", KNUTZTestArray);
		  	}  
                        
                        if(optionenAnzeigeMitschenker) nameArray[i][9] = KNUTZTestArray;                    
                        
                        console.log("Array9: ", nameArray[i][9]);
                                                                             
                        console.log("---------");
                        
		  	  //name, datum und uhrzeit hinzufügen
			  nameArray[i][6] = $("#inputGruppenname").val();
			  
			  var newDate = new Date();
			  //var dateString = newDate.getDate()+"."+newDate.getUTCMonth()+"."+newDate.getUTCFullYear();
        var dateString = newDate.getDate();
			  var timeString = newDate.getHours()+":"+("0" + newDate.getUTCMinutes()).slice(-2);
		
			  nameArray[i][7] = dateString;
			  nameArray[i][8] = timeString;
        console.log("datum11: ", nameArray[i][7]);
        console.log("zeit: ", nameArray[i][8]);
		  }
                                    
	
 		  for(i = 0; i<nameArray.length; i++) {
		  	for(j = 0; j< nameArray[i][4].length; j++) {
                            nameArray[i][4][j] = nameArray[nameArray[i][4][j]][0];
                        } 
                        if(optionenAnzeigeMitschenker) {
                            for(k = 0; k< nameArray[i][9].length; k++) {
                                for(l = 0; l<nameArray[i][9][k].length; l++) {
                                
                                    //console.log("Schenkender des Beschenkten: ", nameArray[i][9][k][l]);
                                    if(Number.isInteger(nameArray[i][9][k][l]))
                                    {
                                        nameArray[i][9][k][l] = nameArray[nameArray[i][9][k][l]][0];
                                    }
                                }
                            }
                        }
                        
                        console.log("Array9: ", nameArray[i][9]);

                        /*
                        for(k = 0; k< nameArray[i][9].length; k++) {
                            for(l = 0; l<nameArray[i][9][k].length; l++) {
                                var KNUTZBuffer = nameArray[i][9][k][l];
                                console.log("Buffer: ", KNUTZBuffer);
                                BUFFERnameArray[i][9][k][l] = nameArray[KNUTZBuffer][0];
                            }
                        }*/
                  }
                  
		  //console.log(dateString+" "+timeString);
	
		  //erstelle links
		  $("#auswertungText").html("<h3>Leite folgende Links an die entsprechenden Wichtler weiter: (nicht selber öffnen!)</h3>");
		  
		  for(i=0; i< nameArray.length; i++) {
		  	var zuteilungString = "";
		  	zuteilungString += '<div class="row"><p align="right" class="col-xs-2">'+nameArray[i][0]+':</p><textarea readonly id="zuteilungsTextarea'+i+'"rows="3" class="col-xs-8 mytextarea"></textarea></div>';
		  	
		  	$("#auswertungText").append(zuteilungString);
		  
		    //parse Übergabeparameter
		    var binaryString = pako.deflate(JSON.stringify(nameArray[i]), { to: 'string' });
		    var encodeduri = encodeURIComponent(binaryString);
		 
		    var url="https://powlwurf.github.io/weihnachtswichteln/zuteilung.html?"; 

		    
		    url +=encodeduri;
		    
        var login = "powlwurf";
        var api_key = "R_29534e0f778b403b9986dd6ffc84f007";
        var long_url = url;

		    $("#zuteilungsTextarea"+i).val(url);
		  }
/*

			console.log(nameArray);
			var binaryString = pako.deflate(JSON.stringify(nameArray[0]), { to: 'string' });
			console.log(binaryString);

			var encodeduri = encodeURIComponent(binaryString);
			
			var restored = JSON.parse(pako.inflate(binaryString, { to: 'string' }));
			console.log(restored);

			var url="https://orionhub.org/file/powlwurf-OrionContent/weihnachten/zuteilung.html?";
			url += encodeduri;
			
			console.log(url);
			
			$("#auswertungText").html('<a link href='+url+'>hallopallo</a>');
*/
			//var binaryString = pako.deflate(JSON.stringify(nameArray), { to: 'string' });
			//console.log(binaryString);
			//console.log(JSON.stringify(pako.inflate(binaryString), { to: 'string' }));
		    //console.log(JSON.stringify(nameArray));
            /*var encrypted = sjcl.encrypt('a',JSON.stringify(nameArray[i]));
            console.log(encrypted);
            var decrypted = sjcl.decrypt("a", encrypted);
            console.log(decrypted);*/
          //
        }
      }
      if(KNUTZvar === 1000) {
      	nameArray = clearArray(nameArray);
        console.log("EMERGENCY KNUTZ EXIT");
        summeSchenkungAssigned = 0;
      }
      KNUTZvar2++;
      if(KNUTZvar2 === 100000) {
      	assignmentNeeded = false;
        console.log("EMERGENCY KNUTZ2 EXIT");
      }
    }
    console.log(JSON.stringify(nameArray));
  }
}


function generateRandomNumber(limiter) {
  var randomNumber = 0;
  randomNumber = Math.random();
  randomNumber *= limiter;
  randomNumber = Math.floor(randomNumber);
  return randomNumber;
}

function displayTestlauf(nameArray) {
  //display auswertung
  var displayString = "";
  displayString = '<div class="row"><p class="col-xs-2">Name: </p><p class="col-xs-3">Schenkt:</p><p class="col-xs-3">Wird beschenkt durch:</p></div>';
  displayString += '<hr>';
  for(i = 0; i < nameElements; i++) {
    displayString += '<div class="row"><p class="col-xs-2">'+nameArray[i][0]+' </p>';
  	      
    //disply verschenkungen
    for(var j = 0; j < Math.max(nameArray[i][2], nameArray[i][3]); j++) {
  	  if(j !== 0) displayString += '</div><div class="row"><p class="col-xs-2"></p>';
  	      	
   	  if(j < nameArray[i][2]) {
        displayString += '<p class="col-xs-3">'+nameArray[nameArray[i][4][j]][0]+'</p>';
  	  }
  	  else {
  	    displayString += '<p class="col-xs-3"></p>';
  	  }
  	  if(j < nameArray[i][3]) {
        displayString += '<p class="col-xs-3">'+nameArray[nameArray[i][5][j]][0]+'</p>';
  	  }
  	  else {
  	    displayString += '<p class="col-xs-3"></p>';
   	  }
  	}
  	displayString += '</div>';
  	displayString += "<hr>";
  }
  	    
  $("#auswertungText").html(displayString);
  console.log("normale Auswertung");	
}

function clearArray(nameArray) {
	for(var j=0; j<nameArray.length; j++)
	{
	  nameArray[j][4] = [];
	  nameArray[j][5] = [];
	}
	return nameArray;
}

  /* Pseudocode:
   * Array wird erstellt. Größe Anzahl Person
   * [id][Name, Verschenkungen, Schenkungen,[]]
   * Check if Verschenkungen.summe == Schenkungen.summ --> else Fehler
   *   Check if noch Verschenkungen zu machen sind
   *     Zufallszahl wird erstellt Größe = Anzahl Personen 
   *     Zweite Zufallszahl wird erstellt != 1. Zufallszahl (außer Option)
   *     Wenn Array[1.Zufallszahl][1] >= 0 && Array[.Zufallszahl][2] >= 0 
   *     ==> also checken ob noch Geschenke/Verschenke möglich sind
   *     Check if Person bereits von der Person beschenkt wird (außer Option)
   *       ==> Wenn ja --> In Array eintragen und Geschenke/Verschenkungen reduzieren
*  * ==>Wenn Summen Gleich: Auswertung anzeigen    
*
*/

