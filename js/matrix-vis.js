function generateFwdMatrix(){
	//console.log("TBD: generateFwdMatrix: Checks"); //not needed as previously done
	
	var obj = preprocessFwdMatrix(appState.hostInstObj);
	var table = buildFwdMatrix(obj.luDepts,obj.regions);
	return table;
}


function preprocessFwdMatrix(hostInstData){
	//we need to convert the data into a table like format
	
	//take each department and push an object for each region in master region array into its regions array
	//iterate through the hostInstData again and this time, push the University into the department's region obj's hiList
	var masterRegionList=[];
	var luDeptsList=[];

	//find all departments and push them into an array
	//find all regions and create a master array of those
	
	for(var i=0;i<hostInstData.length;i++){
		var hostInst = hostInstData[i];
		
		if(masterRegionList.filter(function(a){return a==hostInst.hRegion;}).length==0){//not found in master list
			masterRegionList.push(hostInst.hRegion);
		}
		
		for(var j=0;j<hostInst.luDepts.length;j++){
			var luDept = hostInst.luDepts[j].luDept;
			if((getDuplicates(luDept, luDeptsList, "luDept")).length==0){//department not found
				luDeptsList.push({"luDept":luDept,regions:[]});
			}			
		}
	}

	for(var i=0;i<luDeptsList.length;i++){//now populate the HIs and regions
		for(var j=0;j<masterRegionList.length;j++){
			luDeptsList[i].regions.push({region:masterRegionList[j],hiList:[]});			
		}		
		//now the department has a list of regions associated with it.
		//populate hIs
		var currLUDept = luDeptsList[i];
		for(var idxRegn=0;idxRegn<currLUDept.regions.length;idxRegn++){
			var filteredHIs = hostInstData.filter(function(a){ 
				//first check if the region matches
				if(a.hRegion!=currLUDept.regions[idxRegn].region) return false;
				
				//if region matches, check if dept is in the list
				return a.luDepts.some(function(b){//see if the department exists
					return b.luDept==currLUDept.luDept; 
				});
			});		
			//console.log("DBG preprocessFwdMatrix",luDeptsList[i].luDept,filteredHIs);
			for(var idxFHI=0;idxFHI<filteredHIs.length;idxFHI++){
				currLUDept.regions[idxRegn].hiList.push(filteredHIs[idxFHI].hostInst);					
			}
		}		
	}
	
	return {luDepts:luDeptsList,regions:masterRegionList};
	//final object returned is:
	/*
		luDepts:[
		{
			luDept: departmentName,
			regions:[
						{region: regionName,
							hiList: [
								"hiName",...
							]
						},...			
					]
		},
		...],
		regions:[
			regionName1, regionName2,...
		]
	
	*/
}


function buildFwdMatrix(fwdMatData,regions){
	
/*

open		border		fore color	back color
top row		none		dark red	white
dept row	red 2px		black		white
region row	red 2px		black		gray
hi row/cell	1px gray	black		white

*/
	
	var fontFamily = "font-family: Calibri;text-align:center;"
	var borderTopRow="border:0px solid #ffffff;border-collapse:collapse;";
	var borderTH 	="border:2px solid #B00015;border-collapse:collapse;";
	var borderCell="border:1px solid #808080;border-collapse:collapse;"; //grey border around the hi cells
	
	var colorTopRow = "color:#B00015;";
	var colorRest ="color:#000000;";  //black text on gray background
	
	var backColor = "background-color:#f8f8f8;"
	var backColorTH = "background-color:#D3D3D3;";
	
	var table = $("<table/>").addClass('table-forward-matrix');
	
	var rowOneTD = $("<th/>");
	rowOneTD.html("<h1>Potential Partner Destinations</h1><br>Please note that not all destinations will be available every year");
	rowOneTD.attr("colSpan",fwdMatData.length); //set its width
	rowOneTD.attr("style",borderTopRow+colorTopRow+backColor);
	
	table.append($("<tr/>").append(rowOneTD));
	table.attr("style",borderTH+fontFamily);
	
	//the departments boxes
	var rowDeptHeadings = $("<tr/>");
	for(var i=0;i<fwdMatData.length;i++){
		var thDept = $("<th/>"); //department row
		thDept.text(fwdMatData[i].luDept);	
		thDept.attr("style",borderTH+colorRest+backColor);
		rowDeptHeadings.append(thDept);
	}
	table.append(rowDeptHeadings);
	
	//console.log("DBG buildFwdMatrix>regions");
	for(var i=0;i<regions.length;i++){
		//console.log("DBG buildFwdMatrix>current region>",regions[i]);
		var rowRegion= $("<tr/>"); 
		var rowTH = $("<th/>"); //region row
		rowTH.attr("colSpan",fwdMatData.length);
		rowTH.text(regions[i]);
		rowTH.attr("style",borderTH+backColorTH+colorRest);
		rowRegion.append(rowTH);
		table.append(rowRegion);
		//the region row is now ready
		
		//now we build multiple rows
		var regionDone = false;
		var rowCtr=0;
		while(!regionDone){
			var noHIs=true;
			var rowRR = $("<tr/>");
			for(var j=0;j<fwdMatData.length;j++){
				var regionObj = fwdMatData[j].regions.filter(function(a){return a.region==regions[i];})[0];
				var hiTD=$("<td/>");//just a blank td
				if(regionObj.hiList.length>rowCtr){//no more HIs for this dept from that region
					 hiTD.text(regionObj.hiList[rowCtr]); //the text is pulled in
					 noHIs = false;//we found an HI, so continue
				}			
				hiTD.attr("style",borderCell+colorRest+backColor);
				rowRR.append(hiTD);//append to row
			}//all depts processed, row ready
			table.append(rowRR);
			rowCtr++;
			if(noHIs) regionDone=true;
		}
	}//regions are ready too.
	
	return table;
}

function generateRevMatrix(){
	var obj = preprocessRevMatrix(appState.hostInstObj);
	var table = buildRevMatrix(obj);
	return table;
}

function preprocessRevMatrix(hostInstData){
	//regions wide rows
	//institutions single row per region
	//departments as cells, color coded, use codes

	var masterRegionList = [];
	
	for(var i=0;i<hostInstData.length;i++){
		var hostInst = hostInstData[i];
		
		if(masterRegionList.some(function(a){return a.region==hostInst.hRegion;})){//not found in master list
			masterRegionList.push({region:hostInst.hRegion,hostInsts:[]});
		}//first time the region is encountered
		
		//by now region exists in masterRegionList
		var rIdx = masterRegionList.findIndex(function(a){return a.region==hostInst.hRegion;});
		
		masterRegionList[rIdx].hostInsts.push(hostInst); //hostInst obj contains hostInst name and luDept list
	}
	
	var maxRegionWidth = masterRegionList[0].hostInsts.length;
	for(var i=0;i<masterRegionList.length;i++){//zero start because we are also sorting
		if(maxRegionWidth<masterRegionList[i].hostInsts.length){//push it there
			maxRegionWidth = masterRegionList[i].hostInsts.length;
		}
		for(var j=0;j<masterRegionList[i].hostInsts.length;j++){
			masterRegionList[i].hostInsts[j].luDepts.sort(function(a,b){return (a.faculty==b.faculty)?(a.luDept>b.luDept):(a.faculty>b.faculty);})
		}
	}
	return {maxColSpan:maxRegionWidth,regions:masterRegionList};
	
}

function buildRevMatrix(data){
	
	
	
}

function getObjStructure(obj,tabShift,depth){
	var currDepth = 2;
	var currTabShift = tabShift; //default is single
	
	if(typeof(currTabShift)==="undefined"){ currTabShift = "\t";}
	if(typeof(depth)!=="undefined"){ currDepth = depth;} //max depth of search, to avoid circular reference loops.
//	console.log("TS",tabShift, "TSTypeof",typeof(tabShift),"TSTypeof compare",typeof(tabShift)==="undefined","'"+currTabShift+"'");
	var str="{\n#KEYS#TS}\n";
	var currStr ="";
	for (var property in obj) {
		//if is own property
		if(obj.hasOwnProperty(property)){
			//get a handle to it
			var hnd = obj[property];
			//check if array
			if(Array.isArray(hnd)){
				//if has first element
				if(hnd.length>0){
					var firstElement = hnd[0];
					if(Array.isArray(firstElement)){//array of arrays... we won't explore these deeper
						currStr+=currTabShift+property+" : [[]] (array of arrays)\n";
					}
					else{
						if(firstElement===Object(firstElement)){//is an object
							//if depth==0
							if(currDepth==0){
								currStr += currTabShift+property +" : [ " + "Object(s) ] (use larger depth parameter to enumerate)\n";
							}
							else{
								currStr += currTabShift+property+" : [\n"+currTabShift +"\t"+ getObjStructure(firstElement,currTabShift+"\t\t",currDepth-1) + currTabShift+"]\n"; //close the array
							}
						}
						else{//primitive
							currStr += currTabShift+property + " : [ "+ typeof(firstElement)+" ]\n";
						}						
					}
				}
				else{
				//else is empty
					currStr+= currTabShift+property+" : [] (empty array)\n";
				}
			}
			else{
				//check if object
				if(hnd===Object(hnd)){
					//if depth==0
					if(currDepth==0){//return Object (use larger depth parameter to enumerate)
						currStr += currTabShift+property + " : " + " Object (use larger depth parameter to enumerate)\n";
					}
					else{// else return structure of the object through a recursive call with depth = currDepth -1
						currStr += currTabShift+property + " : " + getObjStructure(hnd,currTabShift+"\t",currDepth-1);						
					}					
				}
				else{
				//else is primitive
					currStr += currTabShift+property + " : "+ typeof(hnd)+"\n";
				}
			}			
		}
			
			
	}	
	return str.replace("#TS",currTabShift.substr(0,currTabShift.length-1)).replace("#KEYS",currStr);
}		

