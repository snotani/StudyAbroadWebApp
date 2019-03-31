function broadcastSuccess(fileFor, objDigest){
	switch(fileFor){
	//Host Institution	
		case BALANCES:
			appState.hostInstObj = objDigest;
			appState.isHIDataLoaded = true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);
			break;
		case LUDRANKS:
			//appState.hostInstObj = objDigest; //the object has been updated, maybe redundant step
			appState.isLUDDataLoaded = true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);			
			break;
		case HIMERGED:
			appState.hostInstObj = objDigest;
			appState.isHIDataLoaded = true;
			appState.isLUDDataLoaded = true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);			
			break;
		case MOVEONDT: //MOVEONDT
			appState.moveOnObj = objDigest;
			appState.isMODataLoaded =true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);
			break;
		case LUSIDATA: 
			appState.isLUSIDataLoaded=true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);
			break;
		case STMERGED: //MOVEONDT
			appState.moveOnObj = objDigest;
			appState.isMODataLoaded =true;
			appState.isLUSIDataLoaded=true;
			appState.isAllocGenerated=false; //clear any previous allocation
			advanceUI(fileFor);
			break;
		case ALLOCPRV:
			appState.prevAllocData = regenReferences(objDigest);
			appState.isPrevDataLoaded = true;
			advanceUI(fileFor);
			break;
		default:
			console.log("TBD: Update BroadcastSuccess Function for:" + fileFor);
	}
}

function digestHostInstExport(arrHnd,callerFSId, fileFor){
	console.log("INFO: Digesting Host Institution Export", arrHnd.length,fileFor);	
	var hostInstObj = [];
	arrHnd2 = arrHnd;
/*
0: "Name"​​​	1: "Location"​​​	2: "Places(semesters)"​​​	3: "Department(Home)"	4: "Place/Department"	5: "Requirements", 6: "Region"

*/	
	var expectedHeader=["Name","Location","Places (semesters)","Department (Home)","Places/Department","Requirements","Region"];
	var rowOne = arrHnd[0];
	if(expectedHeader.length!=rowOne.length || isInvalidHeader(expectedHeader,rowOne)){
		console.log("ERR: Host Inst File Header Invalid: Got: ","'"+rowOne.join("', '")+"'"," Expected: ",","+expectedHeader.join("','")+"'");
		var compareStr = "<br>Expected format: '"+expectedHeader.join("','")+"'<br>";
		compareStr+="Got: '"+rowOne.join("','")+"'";
		//Parsed CSV file has invalid header, very likely has bad values too
		toastDialog(INVALID_FILE_BALANCES+compareStr,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
	}
	else{	
		var errors = [];
		for(var i=1;i<arrHnd.length;i++){
			var row = arrHnd[i];
			var hostInst=row[0];
			var hLocation=row[1];
			var hPlaces = row[2];
			var hDept = row[3];
			var hPlacesPerDept = row[4];
			var hRequirements = row[5];
			var hRegion = row[6];

			if(hostInst.length==0){ //failure modes: if host institution is blank
				console.log("Failed to digest institution record (or blank):'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_HI_NAME.replace("#HOSTINST",hostInst)});
				continue;
			}			
			
			//Error checks
			var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-="; //double check
			if(hostInst.match(specialChars)){	//if host Institution contains any of the above special characters, throw error
				console.log("Host Institution Name contains special invalid characters");
				errors.push({rowId:i+1,err:INVALID_HI_NAME_CHARS.replace("#HOSTINST",hostInst)});
				continue;
			}
			
			if(hLocation.length==0){ 	//if Location is blank
				console.log("Location is blank:'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_LOCATION.replace("#HOSTINST",hostInst)});
				continue;
			}

			if(isNaN(hPlaces) || hPlaces.length==0){ //if Places is not a number and is blank
				console.log("Failed to digest places field (or blank):'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_PLACES.replace("#HOSTINST",hostInst)});
				continue;
			}
			else{
				hPlaces = hPlaces*1;
			}

			if(isNaN(hPlacesPerDept)){ //if Places is not a number and is blank
				console.log("CHECK:Places per Dept is not a number '",i,row,"'");
				//errors.push({rowId:i+1,err:INVALID_PLACES_PER_DEPT.replace("#HOSTINST",hostInst)});
				continue;
			}
			else{
				hPlacesPerDept=hPlacesPerDept*1;
			}

			if(hPlacesPerDept.length != 0){	//if places per dept field is not empty
				if(hPlaces < hPlacesPerDept){ //if the number of total places is less than the places per dept, throw error
					console.log("Invalid: total places less than number of places per dept");
					errors.push({rowId:i+1,err:INVALID_LOGIC_PLACES.replace("#HPLACES",hPlaces).replace("#HOSTINST",hostInst).replace("#HDEPT",hDept).replace("#HPLACESPERDEPT",hPlacesPerDept)}); 
					continue; 
				}
			}
			else{
				console.log("Places per dept field is empty");
			}
			
			if(failureMode(hRegion,{isStr:true,isNonBlankStr:true})){
				console.log("ERR: Invalid region");
				errors.push({rowId:i+1,err:"Partner Institution' region cannot be blank"});
			}
			
			var instChk = getDuplicates(hostInst,hostInstObj,"hostInst");
			var deptObj= {"hDept":row[3],"hPlacesPerDept":row[4]*1,"hRequire":row[5]};
			if(instChk.length==0){//new dept, make new entries			
				hostInstObj.push({"hostInst":hostInst,"hLocation":row[1],"hPlaces":row[2]*1,"hRegion":hRegion, hiDepts:[deptObj], luDepts:[]});
			}
			else{
				instChk[0].hiDepts.push(deptObj);				
			}
			//console.log("DBG: digestMoveOnExport",i);
		}
		if(errors.length!=0){
			var str="Failed to digest Host Institution export.<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<errors.length;i++){
				str+= "<br><span class='modal-nth-error'>Row: "+errors[i].rowId+" Error:" + errors[i].err+"</span>";
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		}
		else{
			//successful completion of parsing info, lets broadcast a success message
			console.log("INFO: Digested MoveOn Export","Success",fileFor);
			broadcastSuccess(fileFor,hostInstObj);
		}
	}
}

function digestLuDeptExport(arrHnd,callerFSId, fileFor){
	console.log("INFO: Digesting LU Department Export", arrHnd,fileFor);	
	var hostInstArr = appState.hostInstObj;
	//arrHnd2 = arrHnd;
/*
0: "Department(Home)"​​​	1: "Host Institution"​​​	2: "Ranking"​​​	3: "Preferred"	  4: "Dept Code"	5: "Faculty"	6: "Subunit"	
*/	
	var expectedHeader=["Department (Home)","Host Institution","Ranking","Preferred","Dept Code","Faculty","Subunit"];
	var rowOne = arrHnd[0];
	if(expectedHeader.length!=rowOne.length || isInvalidHeader(expectedHeader,rowOne)){
		console.log("ERR: LU Dept Ranking File Header Invalid: Got: ","'"+rowOne.join("', '")+"'"," Expected: ",","+expectedHeader.join("','")+"'");
		var compareStr = "<br>Expected format: '"+expectedHeader.join("','")+"'<br>";
		compareStr+="Got: '"+rowOne.join("','")+"'";
		//Parsed CSV file has invalid header, very likely has bad values too
		toastDialog(INVALID_FILE_LUDRANKS+compareStr,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
	}
	else{	
	
		//first we clear any previous information pushed during a failed upload
		for(var i=0;i<hostInstArr.length;i++){
			hostInstArr.luDepts=[]; //clear the array
		}		
		
		var errors = [];
		for(var i=1;i<arrHnd.length;i++){
			var row = arrHnd[i];
			var luDept 		= row[0];
			var hostInst	= row[1];
			var ranking 	= row[2];
			var preferred 	= row[3];
			var deptCode 	= row[4];
			var faculty     = row[5];
			var subunit     = row[6];

			//console.log("DBG: digestLuDeptExport",i,row,arrHnd[i]);
			if(failureMode(hostInst,{isStr:true,isNonBlankStr:true,dumpConsole:false})){//failure modes
				console.log("ERR: Digest LU Export:>Failed to digest institution record (or blank):'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_HI_NAME.replace("#HOSTINST",hostInst)});
				continue;
			}
			
			if(failureMode(luDept,{isStr:true,isNonBlankStr:true})){//failure modes
				console.log("ERR: Digest LU Export:>Blank department record:'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_LUD_NAME.replace("#LUDEPT",luDept)});
				continue;
			}

			if(failureMode(ranking,{isNum:true,isInRange:[1,99]})){//failure modes
				console.log("ERR: Digest LU Export:>Blank ranking record (or not a number):'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_LU_RANK.replace("#LURANK",ranking)});
				continue;
			}
			
			var prefCheck=failureMode(preferred,{isNum:true,isStr:true,isNonBlankStr:true,isInRange:[1,99],verbose:true});
			if(prefCheck.isNonBlankStr){//it is a non-blank str, better be a number in range
				console.log("DBG: digestLuDeptExport",preferred, prefCheck.isNonBlankStr, prefCheck.isNum, prefCheck.isInRange);
				if(!prefCheck.isNum || !prefCheck.isInRange){//either is false
					console.log("ERR: Preferred flag is incorrect",i,row);
					errors.push({rowId:i+1,err:INVALID_PREF_FLAG.replace("#PREF",preferred)});
					continue;
				}
				else{//is a ranged numeric value
					preferred = preferred*1;
				}
			}//else it is blank and we are fine with that.
			
			if(failureMode(deptCode,{isStr:true,isNonBlankStr:true})){//failure modes
				console.log("ERR: Digest LU Export:>Blank department code :'",i,row,"'");
				errors.push({rowId:i+1,err:INVALID_LU_DEPT_CODE.replace("#CODE",deptCode)});
				continue;
			}
			
			if(failureMode(faculty,{isStr:true,isNonBlankStr:true})){
				console.log("ERR: Digest LU Export:>Blank faculty code:",i,row);
				errors.push({rowId:i+1,err:INVALID_LU_FAC_CODE.replace("#FAC",faculty)});
				continue;
			}
			
			if(failureMode(subunit, {isStr:true})){
				console.log("ERR: Digest LU Export:>Subunit not a string:",i,row);
				errors.push({rowId:i+1,err:INVALID_SUBUNIT_STRING.replace("#SUBUNIT",subunit)});
				continue;
			}
			
			//file fidelity checks complete. Actual processing now

			var hostInstChk = getDuplicates(hostInst,hostInstArr,"hostInst");
			if(hostInstChk.length==0){ 
				errors.push({rowId:i+1,err:NOT_IN_PARTNER_LIST.replace("#HOSTINST",hostInst).replace("#LUDEPT",luDept)});
			}
			else{ //check if the lu department has already ranked this host inst
				var luDeptChk = getDuplicates(luDept,hostInstChk[0].luDepts,"luDept");
				if(luDeptChk.length>0){
					var subUnitCheck = getDuplicates(subunit,luDeptChk,"subunit");
					if(subUnitCheck.length>0){
						console.log("ERR: Digest LU Export:> Institution already ranked by department");
						errors.push({rowId:i+1,err:RANKED_DUPLICATE.replace("#LUDEPT",luDept+(subunit.length>0?("-"+subunit):"")).replace("#HOSTINST",hostInst)});
					}
					else{
						console.log("INFO: Duplicate department but different subunit", luDept, subunit,luDeptChk);
					}
				}
				else{//not duplicated, add LU Dept to list inside host Inst obj
					hostInstChk[0].luDepts.push({"luDept":luDept,"ranking":ranking*1,"preferred":preferred, "deptCode":deptCode, "faculty":faculty, "subunit":subunit});
				}
			}
		}
	
		if(errors.length!=0){
			var str="Failed to digest LU Department export.<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<errors.length;i++){
				str+= "<br><span class='modal-nth-error'>Row: "+errors[i].rowId+" Error:" + errors[i].err+"</span>";
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		}
		else{
			//successful completion of parsing info, lets broadcast a success message
			console.log("INFO: Digested LU Department Export","Success",fileFor);
			broadcastSuccess(fileFor);
		}
	}
}

function digestHIMergedExport(arrHnd,callerFSId,fileFor){
	console.log("INFO: digestHIMergedExport",arrHnd.length, callerFSId,fileFor);
	//arrHnd2 = arrHnd;
	var hiObjTemp;
	try {
		hiObjTemp = JSON.parse(arrHnd);	//parse: convert from json to proper object
		console.log("DBG: digestHIMergedExport",hostInstObj)
	} catch (e) {//may not be a JSON object or is broken
		if (e instanceof SyntaxError) {
			var syntaxError = [];
			syntaxError.push({err:PARSING_ERROR.replace("#ERRORNAME", e.name).replace("#ERRORMSG", e.message)});
			
			var str="<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<syntaxError.length;i++){
				str+= "<br>" + syntaxError[i].err;
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return; //no more processing in this function after error
		}
	}		
	console.log("DBG: Parse succeeded",hiObjTemp);
	//basic checks on object status
	//appVersion:appState.appVersion, metaInfo:"Merged Partner-LU Department Data", data:obj, parity: getParity(JSON.stringify(obj))}
	if((typeof(hiObjTemp.appVersion)==="undefined")||(hiObjTemp.appVersion!==appState.appVersion)){//app version error
		toastDialog(WRONG_BIN_FILE+ERR_APP_VER.replace("#APPVER",appState.appVersion).replace("#GOTVER",hiObjTemp.appVersion),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	
	if((typeof(hiObjTemp.parity)==="undefined")){//if parity is not available
		toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	else{
		console.log("TBD: digestHIMergedExport>parity checks",hiObjTemp.parity,getParity(JSON.stringify(hiObjTemp.data)));
		if(hiObjTemp.parity!==getParity(JSON.stringify(hiObjTemp.data)+appState.appVersion)){
			toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return;
		}//
		else{
			var hostInst = hiObjTemp.data[0].hostInst;

			if(typeof(hostInst)==="undefined"||typeof(hostInst) !== "string"){//checks if first thing in object is hostInst and is a string and not empty
				console.log("Wrong file uploaded");
				toastDialog(WRONG_FILE.replace("#FILE","Partner Balances"),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			}
			else{
				//successful completion of parsing info, lets broadcast a success message
				console.log("INFO: Digested Merged Institution Export","Success",fileFor);
				broadcastSuccess(fileFor,hiObjTemp.data);
			}
			
		}
	}
}

function digestStMergedExport(arrHnd,callerFSId,fileFor){
	console.log("INFO: digestStMergedExport",arrHnd.length, callerFSId,fileFor);
	//arrHnd2 = arrHnd;
	var moveOnTemp;
	try {
		moveOnTemp = JSON.parse(arrHnd);	//parse: convert from json to proper object
		console.log("DBG: digestStMergedExport",moveOnTemp)
	} catch (e) {//may not be a JSON object or is broken
		if (e instanceof SyntaxError) {
			var syntaxError = [];
			syntaxError.push({err:PARSING_ERROR.replace("#ERRORNAME", e.name).replace("#ERRORMSG", e.message)});
			
			var str="<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<syntaxError.length;i++){
				str+= "<br>" + syntaxError[i].err;
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return; //no more processing in this function after error
		}
	}		
	console.log("DBG: Parse succeeded",moveOnTemp);
	//basic checks on object status
	if((typeof(moveOnTemp.appVersion)==="undefined")||(moveOnTemp.appVersion!==appState.appVersion)){//app version error
		toastDialog(WRONG_BIN_FILE+ERR_APP_VER.replace("#APPVER",appState.appVersion).replace("#GOTVER",moveOnTemp.appVersion),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	
	if((typeof(moveOnTemp.parity)==="undefined")){//if parity is not available
		toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	else{
		if(moveOnTemp.parity!==getParity(JSON.stringify(moveOnTemp.data)+appState.appVersion)){
			toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return;
		}//
		else{
			var sid = moveOnTemp.data[0].sid;

			if(typeof(sid)==="undefined"||isNaN(sid)){//checks if first thing in object is sid and is a number and not empty
				console.log("Wrong file uploaded",moveOnTemp);
				toastDialog(WRONG_BIN_FILE.replace("#FILE","Student Info"),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			}
			else{
				//successful completion of parsing info, lets broadcast a success message
				console.log("INFO: Digested Merged Student Export","Success",fileFor);
				broadcastSuccess(fileFor,moveOnTemp.data);
			}			
		}
	}
}

function digestMoveOnExport(arrHnd,callerFSId,fileFor){
	//console.log("INFO: Digesting MoveOn Export", arrHnd,fileFor);	
	var moveOnObj = [];
	arrHnd2 =arrHnd;
/*
"Student ID","Name"​​​,"Email"​​​,"Stay Opportunity"​​​,"Rank"​​​,"Degree Programme (Home)"​​​,"Department (Home)"​​​,"Duration"
*/
	var expectedHeader=["Student ID","Name","Email","Stay Opportunity","Rank","Degree Programme (Home)","Department (Home)","Duration", "Subunit"];
	var rowOne = arrHnd[0];
	console.log("DBG digestMoveOnExport",rowOne.length,expectedHeader.length,isInvalidHeader(expectedHeader,rowOne));
	if(expectedHeader.length!=rowOne.length || isInvalidHeader(expectedHeader,rowOne)){
		console.log("ERR: MoveOn File Header Invalid: Got: ","'"+rowOne.join("', '")+"'"," Expected: ","'"+expectedHeader.join("','")+"'");
		var compareStr = "<br>Expected format: '"+expectedHeader.join("','")+"'<br>";
		compareStr+="Got: '"+rowOne.join("','")+"'";
		//Parsed CSV file has invalid header, very likely has bad values too
		toastDialog(INVALID_FILE_MOVEON+compareStr,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
	}
	else{		
		var errors = [];
		for(var i=1;i<arrHnd.length;i++){
			var row = arrHnd[i];
			var sid=row[0];
			var sName = row[1];
			var sEmail = row[2];
			var sRank = row[4]; 
			var sDuration = row[7];
			var sSubunit = row[8];

			if(isNaN(sid) || sid.length<8){//checks if sid is a number and 8 digits long
				console.log("Failed to digest student record (Not a number, not correct structure or blank):'",i,row,"'");
				errors.push({rowId:i+1,err:BAD_STUDENT_ID.replace("#SID",sid)});
				continue;
			}
			//Error checks
			var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
			if(sName.match(specialChars)){	//if sName contains any of the above special characters, throw error
				console.log("Student Name contains special invalid characters");
				errors.push({rowId:i+1,err:BAD_NAME.replace("#SNAME", sName)});
				continue;
			}

			if (!isValidEmail(sEmail)){  //check if it is a valid email 
				console.log("Invalid Email");
				errors.push({rowId:i+1,err:BAD_STUDENT_EMAIL.replace("#SEMAIL", sEmail)});
				continue;
			}

			//check if stay wish is in masterlist and department check -> TO BE DONE as step prior to running allocation algorithm

			if(isNaN(sRank) || sRank.length == 0 || sRank < 1){ //is Rank field is not an number or is empty, throw error
				console.log("Rank is empty or invalid");	
				errors.push({rowId:i+1,err:INVALID_OR_EMPTY.replace("#COLUMN","Rank").replace("#SFIELD",sRank).replace("#SNAME",sName)});
				continue;
			}

			if(isNaN(sDuration)|| sDuration.length == 0 || !inRange(sDuration,1,2)){ //is Duration is not number or empty -> error
				console.log("Duration is empty or invalid");
				errors.push({rowId:i+1,err:INVALID_OR_EMPTY.replace("#COLUMN","Duration").replace("#SFIELD",sDuration).replace("#SNAME",sName)});
				continue;
			}
			
			var stdChk = getDuplicates(sid,moveOnObj,"sid");
			var prefObj= {"stayOpportunity":row[3],"sRank":row[4],"sDuration":row[7]};
			if(stdChk.length==0){//new student, make new entries			
				moveOnObj.push({"sid":sid,"sName":row[1],"sEmail":row[2],"sDegree":row[5],"sDepartment":row[6],"sSubunit":sSubunit,preference:[prefObj]});
			}
			else{//since stdChk is a handle to the 'student' object, we can use it to push the opportunity
				stdChk[0].preference.push(prefObj);				
			}
			//console.log("DBG: digestMoveOnExport",i);
		}
		if(errors.length!=0){
			var str="Failed to digest MoveOn export.<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<errors.length;i++){
				str+= "<br>Row: "+errors[i].rowId+" Error:" + errors[i].err;
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		}
		else{
			//successful completion of parsing info, lets broadcast a success message
			console.log("INFO: Digested MoveOn Export","Success",fileFor);
			studentsObj = moveOnObj; //now we have a handle for the object
			broadcastSuccess(fileFor,moveOnObj);
		}
	}
}

function digestLusiExport(arrHnd, callerFSId, fileFor){
	//console.log("INFO: Digesting LUSI Export", arrHnd,fileFor);	
	var moveOnExport = appState.moveOnObj;

	arrHnd2 =arrHnd;
/*
"Student ID","Name"​​​,"Attendance"​​​,"Grade"​​​,"Place Guaranteed"​
*/
	var expectedHeader=["Student ID","Name","Attendance","Grade","Place Guaranteed"];
	var rowOne = arrHnd[0];
	if(expectedHeader.length!=rowOne.length || isInvalidHeader(expectedHeader,rowOne)){
		console.log("ERR: LUSI File Header Invalid: Got: ","'"+rowOne.join("', '")+"'"," Expected: ","'"+expectedHeader.join("','")+"'");
		var compareStr = "<br>Expected format: '"+expectedHeader.join("','")+"'<br>";
		compareStr+="Got: '"+rowOne.join("','")+"'";
		//Parsed CSV file has invalid header, very likely has bad values too
		toastDialog(INVALID_FILE_LUSI+compareStr,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
	}
	else{	
		//set the LUSI flag to false;
		for(var i=0;i<moveOnExport.length;i++){
			moveOnExport[i].lusi = false; 
		}
	
		var errors = [];
		for(var i=1;i<arrHnd.length;i++){
			var row = arrHnd[i];
			var sid=row[0];
			var sName = row[1];
			var sAttendance = row[2];
			var sGrade = row[3];
			var sGPlace = typeof(row[4])=="undefined"?"":row[4];

			if(isNaN(sid) || sid.length<8){//checks if sid is a number and 8 digits long
				console.log("Failed to digest student record (Not a number, wrong structure(digits) or blank):'",i,row,"'");
				errors.push({rowId:i+1,err:BAD_STUDENT_ID.replace("#SID",sid)});
				continue;
			}
			
			//Error checks
			var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
			if(sName.match(specialChars)){	//if sName contains any of the above special characters, throw error
				console.log("Student Name contains special invalid characters");
				errors.push({rowId:i+1,err:Bad_Student_Name.replace("#SNAME", sName)});
				continue;
			}

			if(isNaN(sAttendance) || !inRange(sAttendance,0,100)){ //is Attendance field is not an number or not in range
				console.log("Attendance is empty or invalid");	
				errors.push({rowId:i+1,err:INVALID_OR_NOTINRANGE.replace("#COLUMN","Attendance").replace("#SFIELD",sAttendance).replace("#SNAME",sName)});
				continue;
			}

			if(isNaN(sGrade) || !inRange(sGrade,0,24)){ //is Grade field is not an number or is empty, throw error
				console.log("Grade is empty or invalid");	
				errors.push({rowId:i+1,err:INVALID_OR_NOTINRANGE.replace("#COLUMN","Grade").replace("#SFIELD",sGrade).replace("#SNAME",sName)});
				continue;
			}
			
			if("YNYESNO".indexOf(sGPlace.toUpperCase())<0&&sGPlace.length>0){//non-blank, not fool-proof though.
				console.log("Invalid Placement flag");
				errors.push({rowId:i+1,err:INVALID_PLACE_FLAG.replace("#FLAG",sGPlace)});
				continue;
			}

			//if here, checks passed
			var stdChk = getDuplicates(sid,moveOnExport,"sid");
			if(stdChk.length==0){//LUSI export has orphan students, need to remove
				errors.push({rowId:i+1,err:NOT_IN_STAYWISHES.replace("#SID",sid)});
			}
			else{//since stdChk is a handle to the 'student' object, we can use it to push the opportunity
				if(stdChk[0].lusi){//shouldn't duplicate, flag is only set when LUSI data is set successfully in the current run
					errors.push({rowId:i+1,err:DUPLICATE_RECORD.replace("#SNAME",sName)});
				}
				else{
					stdChk[0].sAttendance 	= sAttendance;
					stdChk[0].sGrade 		= sGrade;
					stdChk[0].sGPlace		= sGPlace.toUpperCase()=="YES"||sGPlace.toUpperCase()=="Y";
					stdChk[0].lusi 			= true; //this flag is checks for duplicates in LUSI export but avoid situations when LUSI upload fails part of the way through.
				}
			}
			//console.log("DBG: digestMoveOnExport",i);
		}
		if(errors.length!=0){
			var str="Failed to digest LUSI export.<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<errors.length;i++){
				str+= "<br>Row: "+errors[i].rowId+" Error:" + errors[i].err;
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		}
		else{
			//successful completion of parsing info, lets broadcast a success message
			console.log("INFO: Digested LUSI Export","Success",fileFor);
			randomIndex(moveOnExport); //set the random indices on the student objects one more time
			broadcastSuccess(fileFor);
		}
	}
}

function digestAllocExport(arrHnd, callerFSId, fileFor){
	console.log("INFO: digestAllocExport",arrHnd.length, callerFSId,fileFor);
	//arrHnd2 = arrHnd;
	var allocTemp;
	try {
		allocTemp = JSON.parse(arrHnd);	//parse: convert from json to proper object
		console.log("DBG: digestAllocExport",allocTemp)
	} catch (e) {//may not be a JSON object or is broken
		if (e instanceof SyntaxError) {
			var syntaxError = [];
			syntaxError.push({err:PARSING_ERROR.replace("#ERRORNAME", e.name).replace("#ERRORMSG", e.message)});
			
			var str="<br>Re-upload file after fixing the following errors:";
			for(var i=0;i<syntaxError.length;i++){
				str+= "<br>" + syntaxError[i].err;
			}
			toastDialog(str,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return; //no more processing in this function after error
		}
	}		
	console.log("DBG: Parse succeeded",digestAllocExport);
	//basic checks on object status
	if((typeof(allocTemp.appVersion)==="undefined")||(allocTemp.appVersion!==appState.appVersion)){//app version error
		toastDialog(WRONG_BIN_FILE+ERR_APP_VER.replace("#APPVER",appState.appVersion).replace("#GOTVER",allocTemp.appVersion),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	
	if((typeof(allocTemp.parity)==="undefined")){//if parity is not available
		toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
		return;
	}
	else{
		if(allocTemp.parity!==getParity(JSON.stringify(allocTemp.data)+appState.appVersion)){
			toastDialog(WRONG_BIN_FILE+ERR_PARITY,{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			return;
		}//
		else{
			var allocStudents = allocTemp.data.allocationStudents;

			if(typeof(allocStudents)==="undefined"||isNaN(allocStudents)){//checks if first thing in object is sid and is a number and not empty
				console.log("Wrong file uploaded",allocTemp);
				toastDialog(WRONG_BIN_FILE.replace("#FILE","Student Info"),{showOK:true,actionOnOK:"$('"+callerFSId+"').click();"});
			}
			else{
				//successful completion of parsing info, lets broadcast a success message
				console.log("INFO: Digested Merged Student Export","Success",fileFor);
				broadcastSuccess(fileFor,allocTemp.data);
			}			
		}
	}
}

function regenReferences(obj){
	console.log("TBD: regenReferences",obj);
	return obj;
}

// Random Index 
function randomIndex(arr){
	var bag = [];  //array of memory indexes
	var currentStudent;
	
	for(i=1; i<=arr.length; i++){		//for loop to populate indexes in array arr
		bag.push(i);
	}												
		
	arr.forEach(function(currentStudent) {
		var bagindex = Math.floor(Math.random()*bag.length);
		currentStudent.rid = bag[bagindex];
		bag.splice(bagindex,1);
	});
}	

function isValidEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

function inRange(x, min, max) {
  return x >= min && x <= max || "";
}


function clearLUData(action){//applying reload
	if(!appState.isLUDDataLoaded||!appState.isHIDataLoaded){
		toastDialog("Unexpected Error: clearLUData. App will be restarted",{showOK:true,actionOnOK:"location.reload();"});
	}
	var hostInstObj = appState.hostInstObj;
	for(var i=0;i<hostInstObj.length;i++){
		hostInstObj[i].luDepts=[]; //clear this info
	}	
	requestUIUpdate(action);
	appState.isLUDDataLoaded=false;
	clearStudentData();
}

function clearHIData(action){
	if(!appState.isHIDataLoaded){
		toastDialog("Unexpected Error: clearHIData. App will be restarted",{showOK:true,actionOnOK:"location.reload();"});
	}
	appState.hostInstObj=[];//set it to blank
	appState.isHIDataLoaded=false;
	appState.isLUDDataLoaded=false;
	requestUIUpdate(action);
	clearStudentData();
}

function clearStudentData(){
	console.log("TBD: Clear Student Data");	
}


function processFile(fileHnd, callForwardFn, fileFor,callerFSId, isJSON){ 
//these blobs contain the contents of the file after FileReader completes reading
	var fileContentsBlob=null;
	if(typeof(isJSON)==="undefined"){
		isJSON = false;
	}

//if FileReader unavailable, this cannot proceed
	if(window.FileReader){		
		console.log("INFO: Processing file:", fileHnd.name); //debug
		var promises = [];
		promises.push(readFile(fileHnd)); //trigger file read and push the promise for use
		
		Promise.all(promises).then(function(arrayObj) {
			//single file read, so everything is just here
			console.log("INFO: File read complete. Sizes: Expected: ",arrayObj[0].length," Got: ",fileHnd.size);
			if(fileHnd.size!=arrayObj[0].length){//just in case asynchronous loading mucks up
				console.log("ERR: Critical: Size-mismatch: ",fileHnd.size,arrayObj[0].length);
				toastDialog(FILE_SIZE_MISMATCH.replace("#FILEHND", fileHnd.name).replace("#FILESIZE",fileHnd.size).replace("#ARRSIZE",arrayObj[0].length),{showOK:true,actionOnOK:"showCard('tile-"+fileFor+"');"});
				invalidateState(fileFor);
				return null;
			}
			else{//file was read properly, send a parsed array
				fileContentsBlob=arrayObj[0];
				console.log("INFO: Read successful. Passing data to:", callForwardFn.name);
				if(!isJSON)
					callForwardFn($.csv.toArrays(fileContentsBlob),callerFSId,fileFor); //we passed a function handle, now we call that function
				else
					callForwardFn(fileContentsBlob,callerFSId,fileFor); //we passed a function handle, now we call that function
			}
		});
	}
	else{//file reader is unavailable
		toastDialog(FILE_READER_UNAVL,{showOK:true,actionOnOK:"dismiss"});
		console.log("TBD->Alternative File load options");
	}
}

function randomIndex(arr){
	var bag = [];  //array of memory indexes
	var currentStudent;
	
	for(i=0; i<=arr.length; i++){		//for loop to populate indexes in array arr
		bag.push(i);
	}												
		
	arr.forEach(function(currentStudent) {
		var bagindex = Math.floor(Math.random()*bag.length);
		currentStudent.rid = bag[bagindex];
		bag.splice(bagindex,1);
	});
}	

function isValidEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

function inRange(x, min, max) {
  return x >= min && x <= max || "";
}

function getDuplicates(val, arr, field){
	return arr.filter(function(a){ return a[field]==val;});	
}

function failureMode(val,checks){
	//the check object can be the following
	/*{
		isNum:flag, isInRange:[2 value array], isStr:flag, isNonBlankStr:flag, verbose:flag
	}*/
	//if any of these flags 'isX' are present and the value fails the check, failureMode is present
	//we return a true if verbose flag is false and a detailed object if not
	//if no failure modes exist, false is returned
	var result;
	
	if(checks.verbose){
		result = {};
		if(checks.isNum){
			if(isNaN(val)){
				result.isNum = false;				
			}
			else{
				result.isNum = true;
			}
			if(checks.isInRange){//only if is numeric
				if(isNaN(val) ||checks.isInRange[0]>val || val>checks.isInRange[1]){
					result.isInRange = false;
				}				
				else{
					result.isInRange = true;
				}
			}
		}
		if(checks.isStr){
			if(typeof(val)==="string"){//not checking for String objects...
				result.isStr = true;//is a string for sure
				if(checks.isNonBlankStr){//check if the string is not blank
					if(val.length==0){//if zero, it is blank
						result.isNonBlankStr=false; //thus false
					}
					else{
						result.isNonBlankStr=true;
					}
				}
			}
			else{//is not a string
				result.isStr = false;
			}
		}	
	}
	else{
		result = false;
		if(checks.isNum){//check if is a number
			if(isNaN(val)){//if this returns true, this check failed
				result = true; //tell the caller failureMode exists				
			}
			if(checks.isInRange){//only  if numeric, is it in range?
				if(checks.isInRange[0]>val || val>checks.isInRange[1]){//if true, not in range
					result = true;//tell the caller failureMode exists
				}				
			}
		}
		if(checks.isStr){
			if(typeof(val)==="string"){//not checking for String objects...
				if(checks.isNonBlankStr){//is it a non-blank string`
					if(val.length==0){//it is a blank string
						result = true;//tell the caller failureMode exists
					}
				}
			}
			else{
				result = true;	//it is not a string, failureMode exists
			}
		}
		
	}
	if(checks.dumpConsole){
		console.log("DBG failureMode",val,"checksFailed:",result, (checks.isNum)?"isNum: "+(!isNaN(val)):"-",checks.isStr?("isStr: "+typeof(val)==="string"):"-",checks.isNonBlankStr?("NZLStr: "+val.length!=0):"-");
		
	}
	return result;
}

function isInvalidHeader(base,comp){
	if(base.join(",")!=comp.join(",")){
		for(var i=0;i<base.length;i++){
			
			console.log("DBG: isInvalidHeader",i,base[i],comp[i],base[i]==comp[i]);
		}
		
	}
	return base.join(",")!=comp.join(",");
}

//promisified FileReader
function readFile(file, readAsBinary,blob) {//promisify FileReader obj
    var reader = new FileReader();
    var deferred = $.Deferred();
	if(typeof(readAsBinary)==="undefined")
		readAsBinary = false;

    reader.onload = function(event) {
//		console.log("DBG readFile",file.size,event.target.result.length);
		//we check if file.size is same as string length, if not, we reread file as binary
		if(file.size!=event.target.result.length && !readAsBinary){//only one try
			deferred.resolve(readFile(file,true,event.target.result));
		}
		else{
			if(readAsBinary){ //compare the files
				compareFiles(event.target.result,blob);
			}
			deferred.resolve(readAsBinary?blob:event.target.result);//we return the string text only
		}
    };

    reader.onerror = function() {
        deferred.reject(this);
    };
    
	if(readAsBinary)
		reader.readAsArrayBuffer(file);  
	else	
		reader.readAsText(file);

    return deferred.promise();
}

function compareFiles(binObj,txtObj){
	console.log(binObj,txtObj);
	var int8View = new Int8Array(binObj);
	for(var i=0;i<txtObj.length;i++){
		//console.log(i,txtObj.charCodeAt(i),int8View[i], txtObj.charAt(i));
	}
}