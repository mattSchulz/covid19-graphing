var globalJson = {}
var checkboxInfo = {}
var latestCasesArray = [];
var latestDeathsArray = [];
var latestArray = [];
var chronological = true;
var minimumThreshold = 0;
var logString = ""
function sortObject(obj,sortValue) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop][sortValue]
            });
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}
randomTag = Math.random()
jsonURL = "covid-19-data.json?="+randomTag
$.getJSON( jsonURL )
  .done(function( json ) {
  	processJson(json)
  })
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});
function drawGraphLines(){
	var graphData = [];
		//  graphData should look like an array of variables each looking like:
		//     var trace1 = {
	  	//	      x: [1, 2, 3, 4],
	  	//	      y: [10, 15, 13, 17],
	  	//	      type: 'scatter',
	    //		  name: 'plotName'
		//     };
	var layout = {};
	function drawLineChronological(lineType){
		var trace1 = {
					  x: [],
					  y: [],
					  type: 'scatter',
					  name: thisName
					};
		yTitle = "Deaths as % of confirmed cases"
		layout = {
		  title: 'Covid-19 Fatality rate',
		  xaxis: {
		    title: 'Date',
		    showgrid: false,
		    zeroline: false
		  },
		  yaxis: {
		    title: yTitle,
		    showline: false,
		    type: logString,
		    autorange: true
		  },
		};			
		for(j=0; j<globalJson.dates.length; j++){
			//save the current date into x: []
			thisDateKey = Object.keys(globalJson.dates[j])[0];
			trace1.x[j] = thisDateKey;
			//save the value for this country into y: []
			if(typeof Object.keys(globalJson.dates[j][thisDateKey]) == 'undefined'){
				trace1.y[j] = 0;
			}
			if(Object.keys(globalJson.dates[j][thisDateKey]).length>1){
				trace1.y[j] = (globalJson.dates[j][thisDateKey]["deaths"][thisName] / globalJson.dates[j][thisDateKey]["cases"][thisName]) * 100 ;
			}else{
				trace1.y[j] = 0;
			}
			
		}
		graphData[graphData.length] = trace1;
	}

	function drawLineFirstReport(lineType){
		suffix = "";
		yTitle = "Deaths as % of confirmed cases"
		layout = {
		  title: 'Covid-19 Fatality rate',
		  xaxis: {
		    title: 'Days since reaching threshold of '+ minimumThreshold,
		    showgrid: false,
		    zeroline: false
		  },
		  yaxis: {
		    title: yTitle,
		    showline: false,
		    type: logString,
		    autorange: true
		  },
		};

		var trace1 = {
					  x: [],
					  y: [],
					  type: 'scatter',
					  name: thisName
					};
		var numberReported = 0
		for(j=0; j<globalJson.dates.length; j++){
			valueForY = ""
			//save the value for this country into y: []
			thisDateKey = Object.keys(globalJson.dates[j])[0];
			if(typeof Object.keys(globalJson.dates[j][thisDateKey]) == 'undefined'){
				valueForY = 0;
			}
			//this should possibly be length>0 ?
			if(Object.keys(globalJson.dates[j][thisDateKey]).length>1){
				valueForY = (globalJson.dates[j][thisDateKey]["deaths"][thisName] / globalJson.dates[j][thisDateKey]["cases"][thisName]) * 100 ;
			}else{
				valueForY = 0;
			}
			if(valueForY+1 > minimumThreshold){
				trace1.y[j] = valueForY;
				//save the current date into x: []
				trace1.x[j] = numberReported
				numberReported = numberReported + 1
			}
		}
		graphData[graphData.length] = trace1;
	}

	for(i=0; i<Object.keys(checkboxInfo).length; i++){
		thisName = Object.keys(checkboxInfo)[i]
		if(checkboxInfo[thisName]["visible"]){
			if(chronological){
				drawLineChronological("cases");
			}else{
				drawLineFirstReport("cases");
			}
		}
	}
	Plotly.newPlot('graphContainer', graphData, layout);
}

function processJson(json_obj){
	globalJson = json_obj;
	optionsHtml = "<div class='listInfo'>Order country checkboxes by:\
		<select class='fontMedium' id='checkBoxOrder'>\
		  <option value='region'>cases in each region</option>\
		  <option value='cases'>cases in decending order</option>\
		  <option value='deaths'>deaths in decending order</option>\
		</select>\
	</div>\
	<div>Countries are listed with numbers of: (cases, deaths)</div>";

	// create region groups for checkboxes
	regionCheckboxes = "<div id='byRegionCheckboxPane' class='showCheckboxes'>\
							<div class='regionsCheckAll'>\
							<input id='regionsCheckAll' type='checkbox' name='regionsCheckAll'>\
		 					<label class='clickable' for='regionsCheckAll'>uncheck/check all</label>\
		 					</div>";
	for(r=0; r<globalJson.regions.length;r++){
		thisRegionKey = globalJson.regions[r].regionName
		thisRegionClass = globalJson.regions[r].class
		//if thisRegionKey does not end in " Territories"
		if(!(/.+\sTerritories$/.test(thisRegionKey))){
			if((thisRegionClass == "Global")||(thisRegionClass == "fooBar")){
				checkDefault = "checked"
			}else{
				checkDefault = ""
			}
			regionCheckboxes += "<div class='regionCheck topTen "+thisRegionClass+"'>\
									<div class='sectionTitle'>"+thisRegionKey+"</div>\
									<div class='checkAll'>\
										<input type='checkbox' class='regionCheckInput code-"+thisRegionClass+"' name='code-"+thisRegionClass+"' "+checkDefault+">\
		 					 			<label class='regionCheckLabel' for='code-"+thisRegionClass+"' data-labelTitle='"+thisRegionKey+"'>uncheck/check all</label>\
	 					 			</div>"
	 		listLength = globalJson.regions[r].countries.length
 			for(rc=0; rc<listLength;rc++){
 				thisCountryClass = globalJson.regions[r].countries[rc].class
 				thisCountryName = globalJson.regions[r].countries[rc].country
				cases = globalJson["dates"][globalJson["dates"].length-1][Object.keys(globalJson["dates"][globalJson["dates"].length-1])[0]]["cases"][thisCountryName]
				deaths = globalJson["dates"][globalJson["dates"].length-1][Object.keys(globalJson["dates"][globalJson["dates"].length-1])[0]]["deaths"][thisCountryName]
				population = globalJson["regions"][r]["countries"][rc].population
				if(typeof deaths == 'undefined'){
					deaths = 0;
				}
				regionCheckboxes += "<div class='countryCheckGroup'>\
										<input type='checkbox' class='countryCheck' "+checkDefault+">\
							 			<label class='countryCheckLabel' for='code-"+thisCountryClass+"' data-labelTitle='"+thisCountryName+"'>"+thisCountryName+" ("+cases+", "+deaths+")</label>\
							 		</div>";
				if(thisCountryName ==  "Global"){
					checkboxInfo["Global"] = {"visible":true, "latestCases":cases, "latestDeaths":deaths, "population":population }
				}else if(thisCountryName ==  "International conveyance"){
					checkboxInfo["International conveyance"] = {"visible":false, "latestCases":cases, "latestDeaths":deaths, "population":population }
				}else{
					checkboxInfo[thisCountryName] = {"visible":false, "latestCases":cases, "latestDeaths":deaths, "population":population }
				}
	 		}
	 		if(globalJson.regions[r].countries.length>10){
	 			regionCheckboxes += "<div class='seeAll' listLth="+listLength+"><span>[see all "+listLength+" countries]</span></div>";
			}			 		
	 		regionCheckboxes += "</div>";
		}
	}
	regionCheckboxes += "</div>";
	optionsHtml += regionCheckboxes;

	latestCasesArray = sortObject(checkboxInfo,"latestCases")
	latestDeathsArray = sortObject(checkboxInfo,"latestDeaths")
	latestCasesHtml = "<div class='toggleAll'>\
							<input id='byCasesToggle' type='checkbox'>\
							<label class='clickable' for='byCasesToggle'>uncheck/check all</label>\
					   </div>"
	latestDeathsHtml = "<div class='toggleAll'>\
							<input id='byDeathsToggle' type='checkbox'>\
							<label class='clickable' for='byDeathsToggle'>uncheck/check all</label>\
					   </div>"
	for(lateNo=0;lateNo<latestCasesArray.length;lateNo++){
			  latestCasesHtml += "<div>\
								<input type='checkbox' class='countryCheck'>\
			 					<label class='countryCheckLabel' data-labelTitle='"+latestCasesArray[lateNo].key+"'>"+latestCasesArray[lateNo].key+" ("+latestCasesArray[lateNo].value+", "+latestDeathsArray[lateNo].value+")</label>\
			 			    </div>";
		latestDeathsHtml += "<div>\
								<input type='checkbox' class='countryCheck'>\
			 					<label class='countryCheckLabel' data-labelTitle='"+latestDeathsArray[lateNo].key+"'>"+latestDeathsArray[lateNo].key+" ("+latestCasesArray[lateNo].value+", "+latestDeathsArray[lateNo].value+")</label>\
			 		  		</div>";
	}
	optionsHtml += "<div id='byCasesCheckboxPane' class='latestCasesOptions hideCheckboxes'>Countries sorted by total cases"+latestCasesHtml+"</div>\
					<div id='byDeathsCheckboxPane' class='latestDeathsOptions hideCheckboxes'>Countries sorted by total deaths"+latestDeathsHtml+"</div></div>"

	footer = "<div id='citationsNeeded'>\
				sources:<ul><li>Covid-19 data - <a href='https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports'>WHO situation reports "+globalJson.reportText+"</a></li>\
				<li>population figures - <a href='https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population'>wikipedia</a> (and individual pages)</li></ul><br />\
				Development and data-harvest <a href='https://twitter.com/monototo'>@monototo</a>. Contributing design and data maintenance <a href='https://twitter.com/eeejaytee'>@eeejaytee</a>.<br />\
				<a href='covid-19-data.json'>JSON data</a> / <a href='https://github.com/mattSchulz/covid19-graphing'>github</a> / <a href='licence.html'>MIT licence</a><br/><br/>\
			</div>";

	$("div#options").html(optionsHtml + footer)
	drawGraphLines();
	//once HTML is written, add click events
	$(document).on('click', "label.regionCheckLabel", function(){
		$(this).siblings("input").click();
	})
	.on('click', "label.countryCheckLabel", function(){
		$(this).siblings("input").click();
	})
	.on('click', "#regionsCheckAll", function(){
		if($(this).is(":checked")){
			// set the checkboxInfo for each of these boxes
			$(this).parent().siblings("div.regionCheck").children("div.countryCheckGroup").children("label")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = true;
				});
			// set the checkboxInfo for each of these boxes
			$(this).parent().siblings("div.regionCheck").children("div.countryCheckGroup").children("input")
				.each(function(){ 
					this.checked = true;
				})
			//also select all of the select all checkboxes
			$(this).parent().siblings("div.regionCheck").children("div.checkAll").children("input")
				.each(function(){ 
					this.checked = true;
				})
		}else{
			$(this).parent().siblings("div.regionCheck").children("div.countryCheckGroup").children("label")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = false;
				});
			$(this).parent().siblings("div.regionCheck").children("div.countryCheckGroup").children("input")
				.each(function(){ 
					this.checked = false; 
				})
			//also unselect all of the select all checkboxes
			$(this).parent().siblings("div.regionCheck").children("div.checkAll").children("input")
				.each(function(){ 
					this.checked = false;
				})
		}
		drawGraphLines();
	})
	.on('click', "input.regionCheckInput", function(){
		if($(this).is(":checked")){
			// set the checkboxInfo for each of these boxes
			$(this).parent().siblings("div.countryCheckGroup").children("label")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = true;
				});
			// set the checkboxInfo for each of these boxes
			$(this).parent().siblings("div.countryCheckGroup").children("input")
				.each(function(){ 
					this.checked = true;
				})
		}else{
			$(this).parent().siblings("div.countryCheckGroup").children("label")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = false;
				});
			$(this).parent().siblings("div.countryCheckGroup").children("input")
				.each(function(){ 
					this.checked = false; 
				})
		}
		drawGraphLines();
	})
	.on('click', "#byCasesToggle", function(){
		if($(this).is(":checked")){
			$("div#byCasesCheckboxPane > div > label.countryCheckLabel")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = true;
				});
			$("div#byCasesCheckboxPane > div > input.countryCheck")
				.each(function(){
					this.checked = true;
				});
		}else{
			$("div#byCasesCheckboxPane > div > label.countryCheckLabel")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = false;
				});
			$("div#byCasesCheckboxPane > div > input.countryCheck")
				.each(function(){
					this.checked = false;
				});
		}
		drawGraphLines();
	})
	.on('click', "#byDeathsToggle", function(){
		if($(this).is(":checked")){
			$("div#byDeathsCheckboxPane > div > label.countryCheckLabel")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = true;
				});
			$("div#byDeathsCheckboxPane > div > input.countryCheck")
				.each(function(){
					this.checked = true;
				});
		}else{
			$("div#byDeathsCheckboxPane > div > label.countryCheckLabel")
				.each(function(){
					checkboxInfo[$(this).attr("data-labelTitle")]["visible"] = false;
				});
			$("div#byDeathsCheckboxPane > div > input.countryCheck")
				.each(function(){
					this.checked = false;
				});
		}
		drawGraphLines();
	})
	.on('click', "input.countryCheck", function(){
		if($(this).is(":checked")){
			checkboxInfo[$(this).siblings("label").attr("data-labelTitle")]["visible"] = true;
		}else{
			checkboxInfo[$(this).siblings("label").attr("data-labelTitle")]["visible"] = false;
		}
		drawGraphLines();
	})
	.on('click', ".seeAll", function(){
		if($(this).parent().hasClass("topTen")){
			$(this).parent().removeClass("topTen");
			$(this).children("span").html('[back to top 10]');
		}else{
			$(this).parent().addClass("topTen");
			listLength = $(this).attr("listLth")
			$(this).children("span").html('[see all '+listLength+']');
		}
	})
	.on('change', "#checkBoxOrder", function(){
		if($("#checkBoxOrder option:selected" ).val()=="region"){
			$(".showCheckboxes").removeClass("showCheckboxes").addClass("hideCheckboxes");
			$("#byRegionCheckboxPane").removeClass("hideCheckboxes").addClass("showCheckboxes");
			$("#byRegionCheckboxPane>div.regionCheck>div.countryCheckGroup>label.countryCheckLabel").each(function(){
			    if(checkboxInfo[$(this).attr("data-labeltitle")]["visible"]){
			    	$(this).siblings("input")[0].checked = true;
			    }else{
			    	$(this).siblings("input")[0].checked = false;
			    }
			})
		}else if($("#checkBoxOrder option:selected" ).val()=="cases"){
			$(".showCheckboxes").removeClass("showCheckboxes").addClass("hideCheckboxes");
			$("#byCasesCheckboxPane").removeClass("hideCheckboxes").addClass("showCheckboxes");
			//check/upcheck checkboxes to bring them up to date with values in checkboxInfo
			$("#byCasesCheckboxPane>div>label.countryCheckLabel").each(function(){
			    if(checkboxInfo[$(this).attr("data-labeltitle")]["visible"]){
			    	$(this).siblings("input")[0].checked = true;
			    }else{
			    	$(this).siblings("input")[0].checked = false;
			    }
			})
		}else if($("#checkBoxOrder option:selected" ).val()=="deaths"){
			$(".showCheckboxes").removeClass("showCheckboxes").addClass("hideCheckboxes");
			$("#byDeathsCheckboxPane").removeClass("hideCheckboxes").addClass("showCheckboxes");
			//check/upcheck checkboxes to bring them up to date with values in checkboxInfo
			$("#byDeathsCheckboxPane>div>label.countryCheckLabel").each(function(){
			    if(checkboxInfo[$(this).attr("data-labeltitle")]["visible"]){
			    	$(this).siblings("input")[0].checked = true;
			    }else{
			    	$(this).siblings("input")[0].checked = false;
			    }
			})
		}
	}).on('change', "#thresholdValues", function(){
		minimumThreshold = $("#thresholdValues option:selected").val();
		if(minimumThreshold==1){
			$(".pluralCase").removeClass("showThisInline").addClass("hideThis");
		}else{
			$(".pluralCase").removeClass("hideThis").addClass("showThisInline");
		}
		// make sure firsrtReportDates radio is selelcted, which will also redraw the graph 
		$("#firstReportDates").click();
	})
	.on('click', ".deathcase", function(){
		drawGraphLines();
	})
	.on('click', "input.clickable", function(){
		$(this).prev('input').click();
	}).on('click', "#calendarDates", function(){
		chronological = true;
		$("#thresholdValues").attr("disabled", "disabled")
		drawGraphLines();	
	}).on('click', "#firstReportDates", function(){
		$("#thresholdValues").removeAttr('disabled');
		chronological = false;
		drawGraphLines();	
	}).on('click', "#linear", function(){
		logString = "";
		drawGraphLines();	
	}).on('click', "#logarithmic", function(){
		logString = "log";
		drawGraphLines();	
	});
}
