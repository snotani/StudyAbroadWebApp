const AWINS = -1;
const BWINS = 1;
const TIE   =  0;
const DEPT_SAME = 100;
const DEPT_DIFF = -100;
const SUGGESTED = 999;

function allocate(){
	var obj = preAllocationStep(appState.moveOnObj,appState.hostInstObj);
	stableMarriageAllocation(obj.students, obj.hosts);
}

function preAllocationStep(studentList,hostInstList,isDebug){

	if(isDebug){
	alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"34529152","sName":"Beautiful Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time","sDepartment":"School of Computing and Communications","preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"},{"stayOpportunity":"University of Iowa","sRank":"2","sDuration":"2"}],"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":13}
				]; 
	}	

	if(isDebug){
	alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"Australian National University","hLocation":"Australia","hPlaces":4,"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""}],"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""}],"hRegion":"Australia"}
				];
	}
	
	//sort the moveOnExport array by its Random Index
	studentList.sort(function(a,b){ 
		return a.rid-b.rid;
	});

	var allocationStudents = [];

	for(var i=0;i<studentList.length;i++){
		var student = studentList[i];
		allocationStudents.push({sid:student.sid,isAlloc:false,isOptExhausted:false,allocatedPlace:null,allocDuration:0,allocRank:0,studentInfo:student,currTopIdx:0});
	}

	var allocationHostInsts = [];

	for(var i=0;i<hostInstList.length;i++){ 
		var institution = hostInstList[i];
		allocationHostInsts.push({hostInst:institution.hostInst,placesTotal:institution.hPlaces*1,placesRemaining:institution.hPlaces*1,students:[],hostInstInfo:institution});
	}

	//check if stay wish is in masterlist and department check -> TO BE DONE
	console.log("TBD: Checks - StayOpportunity in HI File and LU Ranks & Departments in LU Ranks match Departmens in StayWishes");
	

	return {students:allocationStudents, hosts:allocationHostInsts};

}


function stableMarriageAllocation(studentList,hostInstList){
	var unallocatedCount = studentList.length; //all are unassigned, this is decremented within the while loop whenever we manage to allocate a student, and incremented whenever an allocated student gets deallocated.
	var cnt = 0; //counts iterations
	var minGradeDifference = appState.minGradeDelta; // minimum grade difference to give preference to student
	var actionLog = [];

	while((unallocatedCount>0)){
		cnt++; //emergency brake
		// console.log(studentList.length);
		if(cnt>Math.pow(studentList.length,2)){//debug code required to prevent run-away conditions
			console.log("stableMarriageAllocation->O(n^2) EXIT. Error?");
			actionLog.push({action:"ERROR: Algorithm failed to execute properly."});
			break;
		}
		
		var nUAStudent = getFirstUnallocatedStudent(studentList); //get the first unallocated student
		
//		actionLog.push({action:"INFO: Current unallocated student -> Student ID: "+nUAStudent.sid+", Is Allocated?: "+nUAStudent.isAlloc+", Allocated place: "+nUAStudent.allocatedPlace+", Current preference index: "+nUAStudent.currTopIdx+".\n"});
		
		if(nUAStudent.noMoreStudents){
			// console.log("stableMarriageAllocation: End of line, we cannot have unallocated students remaining ");
			actionLog.push({action:"INFO: No more unallocated students with options that are not exhausted.\n"});
			break;			
		}
		
		//if here, we need a university choice
		var nStudentStaywish = getTopChoiceOfStudent(nUAStudent);
		// console.log("Student's top choice",nStudentStaywish);
		actionLog.push({action:"INFO: Student SID:"+nUAStudent.sid+", Alloc?: "+nUAStudent.isAlloc+", HI: "+nUAStudent.allocatedPlace+", StayWish Idx: "+nUAStudent.currTopIdx+" Wish:> "+JSON.stringify(nStudentStaywish)+"\n"});
		
		if(nUAStudent.isOptExhausted){
			// console.log("stableMarriageAllocation: End of line, we cannot have unallocated students remaining ");
			actionLog.push({action:"ERROR: No more unallocated students with options that are not exhausted.\n"});		
			break;			
		}
		else{//has choices that can be checked
			var requestedHI = getHostInst(hostInstList,nStudentStaywish.stayOpportunity);

			var hiPlacesRemaining = requestedHI.placesRemaining*1
			var placesNeeded = nStudentStaywish.sDuration*1;

			actionLog.push({action:"INFO: Student SID:" + nUAStudent.sid + " HI: "+requestedHI.hostInst+", Total Places: "+requestedHI.placesTotal+", Places Remaining: "+requestedHI.placesRemaining+".\n"});
			
			//check if department has restrictions, if array is non-zero length, restrictions exist
			var deptLimits = requestedHI.hostInstInfo.hiDepts.filter(function(hiDept){
					return hiDept.hDept == nUAStudent.studentInfo.sDepartment;
			});
			
			var deptStudents  = requestedHI.students.filter(({studentInfo})=>(studentInfo.sDepartment==nUAStudent.studentInfo.sDepartment));
			
			//if no restrictions, use zero, else compute
			var deptPlacesAllotted = deptLimits.length>0?deptLimits[0].hPlacesPerDept*1:0; //how many that dept got at start
			var deptPlacesAllocated = deptLimits.length>0?getTotalDuration(deptStudents):0; //how many have been filled for that dept 
			var deptPlacesRemaining = deptPlacesAllotted - deptPlacesAllocated; //how many remain available
						
			if((deptLimits.length==0)||!(placesNeeded>deptPlacesRemaining)){//if no restrictions or dept has places
				//when no dept restrictions apply, we apply allocate blindly or full sorter based on placesRemaining
				if(hiPlacesRemaining < placesNeeded){ // not enough hi places, apply full sorter

					actionLog.push({action:"DECISION: Full Sorter"+(deptLimits.length>0?" as Dept # Available":"")+". "+requestedHI.hostInst+ " has "+hiPlacesRemaining+ " places available to allocate student with ID: "+nUAStudent.sid+". Needed: "+placesNeeded+ ".\n"});
					
					//build an array to process the existing students and the new student
					var fullSortList = [nUAStudent].concat(requestedHI.students); 
				
					//sort them 
					sorter(fullSortList,requestedHI); // sorter function
					
					//slice the list to create a 'short list'
					var sliceOutcome = slicer(fullSortList,requestedHI.placesTotal,nUAStudent,placesNeeded);
					
					if(sliceOutcome.failedToAllocate){
						//current student cannot be given his current top choice
						updateTopChoice(nUAStudent,hostInstList);
						actionLog.push({action:"ACTION: Full HI Sorter (LOSES): " +nUAStudent.sid+" Not enough places in -> "+requestedHI.hostInst+ " to allocate student\n"});
					}
					else{//student was allocated, need to kick out students
						//first update the new student as allocated
						
						allocateStudent(nUAStudent,requestedHI.hostInst);
						unallocatedCount--;
						actionLog.push({action:"ACTION: Full HI Sorter (WINS): " +nUAStudent.sid+" Enough places in -> "+requestedHI.hostInst+ " to allocate student post slicer\n"});
						
						//then go and update the HI balances and students array using the tempArray
						updateHostInst(requestedHI, fullSortList);
						
						// finally mark all students in unallocStudents to unalloc (isAlloc:false) 
						var actions=deallocateStudents(sliceOutcome.studentsToDealloc,hostInstList);
						unallocatedCount += sliceOutcome.studentsToDealloc.length;
						
						actionLog = actionLog.concat(actions); //save actions performed in deallocateStudents function
					}
				}
				else{//host inst has more places than student's duration, allocate blindly					
					actionLog.push({action:"DECISION: Allocate Blindly. Enough places in -> "+requestedHI.hostInst+ " to allocate student SID:"+nUAStudent.sid+"\n"});
				
					allocateStudent(nUAStudent,requestedHI.hostInst); 
					unallocatedCount--;
					actionLog.push({action:"ACTION: Allocate Blindly: " +nUAStudent.sid+" Enough places in -> "+requestedHI.hostInst+ " to allocate student\n"});
						
					//push the student into the list
					requestedHI.students.push(nUAStudent)
					
					//update the institution, the student array is already updated, so we pass itself
					updateHostInst(requestedHI, requestedHI.students);
				}
			}
			else{ // dept restrictions are available and need to be checked by department 
				//we will end up here when dept has restriction AND dept is full.
				//create the other lists needed
				var otherStudents = requestedHI.students.filter(({studentInfo})=>(studentInfo.sDepartment!=nUAStudent.studentInfo.sDepartment)); 
			
				//students from the restricted dept and to which the new student belongs
				
				if(deptPlacesRemaining < placesNeeded){//the if is redundant 
					actionLog.push({action:"DECISION: Dept Sorter, then branch as Dept: Full for SID:" +nUAStudent.sid+ " at: "+requestedHI.hostInstInfo.hostInst+"\n"});

					var deptSorter = [nUAStudent].concat(deptStudents); //add the new student to the list to sort
					sorter(deptSorter,requestedHI); // sorter function for only departments
					var deptSliceOutcome = slicer(deptSorter,deptPlacesAllotted,nUAStudent,placesNeeded); // slicer only for department level
					
					if(deptSliceOutcome.failedToAllocate){//dept sorter, student cannot be allocated
						//current student cannot be given his current top choice
						updateTopChoice(nUAStudent,hostInstList);
						actionLog.push({action:"ACTION: Dept Sorter (LOSES): "+nUAStudent.sid+" Not enough places in -> "+requestedHI.hostInst+ "'s department to allocate student\n"});
					}
					else{//dept sorter, student can be allocated
						//we still need to check if he can be allocated overall, there may or may not be enough places
						actionLog.push({action:"DECISION: HI Sorter post Dept Sorter for SID:"+nUAStudent.sid+" at: "+requestedHI.hostInst+ "\n"});
						var hiListSorter = requestedHI.students.filter(({sid})=>{
							//get every student in HI's currently allocated list which do not appear in the 
							//deallocation list from the dept level sorter
							return !deptSliceOutcome.studentsToDealloc.some(function(s){return s.sid==sid;});
						});
						
						var placesUsedUp = getTotalDuration(hiListSorter);
						
						if(placesUsedUp+placesNeeded>requestedHI.placesTotal*1){//not enough places in hi, so full sorter
							//we need another short-listing action to be performed.
							hiListSorter = [nUAStudent].concat(hiListSorter);//we add the unalloc student to the list of students who belong to other dept as well as students from same dept that were not deallocated in the previous step
							sorter(hiListSorter,requestedHI);
							var hiSliceOutcome=slicer(hiListSorter,requestedHI.placesTotal,nUAStudent,placesNeeded);//now run slicer on whole inst
							if(hiSliceOutcome.failedToAllocate){
								updateTopChoice(nUAStudent,hostInstList);
								actionLog.push({action:"ACTION: Full Sorter Post Dept Sort (LOSES): "+nUAStudent.sid+" Not enough places in -> "+requestedHI.hostInst+ " to allocate student\n"});
							}
							else{//allocation is possible, process it
								// student was allocated
								actionLog.push({action:"ACTION: Full Sorter Post Dept Sort (WINS): " +nUAStudent.sid+" Enough places in -> "+requestedHI.hostInst+ " to allocate student post slicer\n"});
								allocateStudent(nUAStudent,requestedHI.hostInst);
								unallocatedCount--;
								
								//update the host inst info with the students
								updateHostInst(requestedHI, hiListSorter);
							
								// finally mark all students in unallocStudents to unalloc (isAlloc:false) 
								//we will have students from the department as well other depts to deallocate
								var deallocList = hiSliceOutcome.studentsToDealloc.concat(deptSliceOutcome.studentsToDealloc);
								var actions=deallocateStudents(deallocList,hostInstList);
								unallocatedCount += deallocList.length;
								actionLog.concat(actions);								
							}
						}
						else{//enough places in hi, so allocate blindly here
							actionLog.push({action:"DECISION: Allocate Blindly Post Dept Sort: "+nUAStudent.sid +" Enough places in -> "+requestedHI.hostInst+ " to allocate student.\n"});
				
							allocateStudent(nUAStudent,requestedHI.hostInst); 
							unallocatedCount--;
							actionLog.push({action:"ACTION: Allocate Blindly Post Dept Sort: " +nUAStudent.sid+" Enough places in -> "+requestedHI.hostInst+ " to allocate student\n"});
						
							//at this point we still have dept students to deallocate
							updateHostInst(requestedHI, deptSorter.concat(otherStudents));
					
							// finally mark all students in unallocStudents to unalloc (isAlloc:false) 
							//we will have students from the department to deallocate
				
							var actions=deallocateStudents(deptSliceOutcome.studentsToDealloc,hostInstList);
							unallocatedCount += deptSliceOutcome.studentsToDealloc.length;
							actionLog.concat(actions);	
						}
						
					}
						
				}
				else{//department has places,
					actionLog.push({action:"ERROR: This situation should not occur:"+nUAStudent.sid+" at:"+requestedHI.hostInstInfo.hostInst });
				}
			}
		}
		
		actionLog.push({action:"INFO: Host Institution after being chosen -> Host Institution: "+requestedHI.hostInst+", Total Places: "+requestedHI.placesTotal+", Places Remaining: "+requestedHI.placesRemaining+", Student allocated: '"+requestedHI.students.map(({studentInfo})=>studentInfo.sName).join("', '")+"'.\n"});
			
	}
	console.log("here");
	if(actionLog.length!=0){
		var str=actionLog.map(({action})=> action).join("");
		//for(var i=0;i<actionLog.length;i++){
			//str+= actionLog[i].action+"\n";
		//}
		// console.log("DBG: stableMarriageAllocation\n",str);
		if (confirm("Download Action Log?")) {
			downloadFile(str,FILE_ACT_LOG.replace("#DATE",getTimeStamp()), FDATA_TYPE_TEXT);
		} else {
			console.log("Action Log can be retrieved by using variable: 'strAction'");
			strAction = str;
		}
	}
}	


function getFirstUnallocatedStudent(arr){
	var unallocList = arr.filter(function(student){  // filter to find if there are still students left to allocate
		return ((student.isAlloc==false) && (student.isOptExhausted==false));
	});	
	return unallocList.length==0? {noMoreStudents:true} : unallocList[0];	 
}


function getTopChoiceOfStudent(studentObj){
	// console.log(studentObj);
	if(studentObj.currTopIdx>=studentObj.studentInfo.preference.length){	// if no more student choices, check the department advisors ranks
		var newIdx = studentObj.currTopIdx-studentObj.studentInfo.preference.length; 	
		if(newIdx>=studentObj.deptWishes.length){//not the student is truly toast	
			studentObj.isOptExhausted = true; // all the students choices are exhausted
			console.log("ERR: Algorithm mucked up with",studentObj," isOptExhausted should have been set previously");
		return null; //if null is returned, calling fun reduces the unallocated students count by 1
	}	
		else{//try to allocate him on department stay wishes
			return studentObj.deptWishes[newIdx];
		}
	}	
	else{
	   //currTopIdx starts with zero
	   return studentObj.studentInfo.preference[studentObj.currTopIdx];
		//studentObj.currTopIdx++; //DO NOTincrement for next run. Wait till allocation fails.
	}
}


function getHostInst(arr,stayOpportunity){

	var matches = arr.filter(function(hiObj){
		return hiObj.hostInst==stayOpportunity;
	});
	return matches[0];
}

function getTotalDuration(arr){
	return arr.map(({allocDuration})=>allocDuration*1).reduce((a,b)=>a+b,0);	
}


// var funcArray = [{getPrefFlagStatus, getGuaranteedPlace, getDepartmentStatus}];

function sorter(students, hostInst){
	if(verboseDecisions) console.log("DBG: pre-sorter",students.length,students.map(({sid})=>sid).join(", "));
	students.sort(function(a,b){
		if(!verboseDecisions){
			return sortByRules(a,b,hostInst);
		}
		else{//verbose mode, the variable verboseDecisions is defined in testCases.js
			var decision = sortByRulesVerbose(a,b,hostInst);
			console.log("DBG: Sorter","Decision based on",decision.source,a.sid,b.sid, "Winner:", decision.decision==AWINS?a.sid:decision.decision==BWINS?b.sid:"TIE");
			return decision.decision;
		}
	});
	if(verboseDecisions) console.log("DBG: post-sorter",students.length,students.map(({sid})=>sid).join(", "));
}



function sortByRules(a,b,hostInst){
	var result = getPrefFlagStatus(a,b, hostInst);//this requires the whole HI
	if(result!=TIE) return result;

	result = getGuaranteedPlace(a,b);
	if(result!=TIE) return result;

	result = getDepartmentStatus(a,b,hostInst);
	if(result==DEPT_SAME){
		result = getGrades(a,b);
		if(result!=TIE) return result;
		
		result = getStaywishRank(a,b,hostInst.hostInst); //this only requires the HI name
		if(result!=TIE) return result;
		
		result = getAttendance(a,b);
		if(result!=TIE) return result;
		
		result = getDuration(a,b,hostInst.hostInst);
		if(result!=TIE) return result;
	}
	else{
		result = getDepartmentRanking(a,b,hostInst);
		if(result!=TIE) return result;
		
		result = getStaywishRank(a,b,hostInst.hostInst);
		if(result!=TIE) return result;
		
		result = getDuration(a,b,hostInst.hostInst);
		if(result!=TIE) return result;
	}
	
	return TIE;
}

function sortByRulesVerbose(a,b,hostInst){//use this to debug the situation where test case fails. Activated by setting verboseDecisions = true;
	console.log("DBG: sortByRules", a.sid, b.sid, "PFS:",rTxt(getPrefFlagStatus(a,b, hostInst)),"GP:",rTxt(getGuaranteedPlace(a,b)),"iDEPT:",rTxt(getDepartmentStatus(a,b, hostInst)),"DRANK:",rTxt(getDepartmentRanking(a,b,hostInst)),"Wish:",rTxt(getStaywishRank(a,b,hostInst.hostInst)),"Att:(SDOnly) ",rTxt(getAttendance(a,b)),"Duration:",rTxt(getDuration(a,b,hostInst.hostInst)));
	
	var result = getPrefFlagStatus(a,b, hostInst);//this requires the whole HI
	if(result!=TIE) return {decision:result,source:"PFS"};

	result = getGuaranteedPlace(a,b);
	if(result!=TIE) return {decision:result,source:"GuaPl"};

	result = getDepartmentStatus(a,b,hostInst);
	if(result==DEPT_SAME){
		result = getGrades(a,b);
		if(result!=TIE) return {decision:result,source:"Grades"};
		
		result = getStaywishRank(a,b,hostInst.hostInst); //this only requires the HI name
		if(result!=TIE) return {decision:result,source:"Wish"};
		
		result = getAttendance(a,b);
		if(result!=TIE) return {decision:result,source:"Attendance"};
		
		result = getDuration(a,b,hostInst.hostInst);
		if(result!=TIE) return {decision:result,source:"Duration"};
	}
	else{
		result = getDepartmentRanking(a,b,hostInst);
		if(result!=TIE) return {decision:result,source:"DeptRank"};
		
		result = getStaywishRank(a,b,hostInst.hostInst);
		if(result!=TIE) return {decision:result,source:"Wish"};
		
		result = getDuration(a,b,hostInst.hostInst);
		if(result!=TIE) return {decision:result,source:"Duration"};
	}
	
	return {decision:TIE,source:"No Decision"};
}


function getPrefFlagStatus(a,b,hostInst){ // gives the institution with 'preferred' flag a preference

	//var hostInstObj = typeof(a.allocatedPlace)==="undefined"?b.allocatedPlace:a.allocatedPlace;
    
    var aDeptPrefRank = hostInst.hostInstInfo.luDepts.filter(function(luda){
							return luda.luDept == a.studentInfo.sDepartment;
							})[0].preferred;
							

	var bDeptPrefRank = hostInst.hostInstInfo.luDepts.filter(function(luda){
							return luda.luDept == b.studentInfo.sDepartment;
						})[0].preferred;
	
	/*
		aPR	bPR return
		num	num	aPR compared bPR WIN,TIE,LOSE (if aPR>bPR -> AWINS, aPR == bPR -> TIE, aPR< bPR -> BWINS)
		num --  AWINS
		--  num BWINS
		--  --  TIE
	*/

	if(typeof(aDeptPrefRank)==="number"){
		if(typeof(bDedptPrefRank)==="number"){ //here if both are numbers
			if(aDeptPrefRank > bDeptPrefRank){
				return AWINS;
			}
			else if(aDeptPrefRank == bDeptPrefRank){
				return TIE;
			}
			else{
				return BWINS;
			}
		}
		else{  // here if a is a number, but b is blank
			return AWINS;
		}
	}
	else{ 
		if(typeof(bDedptPrefRank)==="number"){ // here if a is blank, but b is a number
			return BWINS;
		}
		else{ //none of them are numbers
			return TIE;  
		}
	}
} 


function getGuaranteedPlace(a,b){ // gives preference to those with gp
	if(a.studentInfo.sGPlace){
		if(b.studentInfo.sGPlace){
			return TIE;
		}
		else{
			return AWINS;
		}
	}
	else{
		if(b.studentInfo.sGPlace){
			return BWINS;
		}
		else{
			return TIE;
		}
	}
}


function getDepartmentStatus(a,b,hostInst){
	var aDept = a.studentInfo.sDepartment;
	var bDept = b.studentInfo.sDepartment;
	var aSubunit = a.studentInfo.sSubunit;
	var bSubunit = b.studentInfo.sSubunit;

/* NO! WONT WORK	
	var aSubunit = hostInst.hostInstInfo.luDepts.filter(function(lus){
						return lus.luDept == a.studentInfo.sDepartment;
					})[0].subunit;
	var bSubunit = hostInst.hostInstInfo.luDepts.filter(function(lus){
						return lus.luDept == b.studentInfo.sDepartment;
					})[0].subunit;
	
*/
	if(aDept!=bDept) return DEPT_DIFF;
	else{ 
		// check if there is subunit in StayWishes 
		if(typeof(aSubunit)==="string"){
			if(typeof(bSubunit)==="string"){	// if here, both departments have subunit
				if(aSubunit.localeCompare(aSubunit) == 0){  
					return DEPT_SAME;	// same subunits, therefore same department
				}
				else{
					return DEPT_DIFF;	// both have subunits but are different
				}
			}
			else{	// only one student has subunit, therefore different departments
				return DEPT_DIFF;
			}
		}
		else{
			if(typeof(bSubunit)==="string"){  // checks if one student has subunit and returns different departments if so
				return DEPT_DIFF;
			}
			else{
				return DEPT_SAME;	// if none of them have subunits, then they are same department 
			}
		}
	}
}


function getGrades(a,b){
	var aGrade = a.studentInfo.sGrade;
	var bGrade = b.studentInfo.sGrade;
	
	if((Math.abs(aGrade-bGrade)<appState.minGradeDelta) || (isNaN(aGrade) || isNaN(bGrade))){//within fuzzy range or either is blank
		return TIE;
	}
	else{//clear cut difference
		return (aGrade>bGrade)?AWINS:BWINS;
	}
}


function getStaywishRank(a,b,hostInst){
	var aStaywishRank = a.studentInfo.preference.filter(function(pref){
		return pref.stayOpportunity == hostInst;
	})[0].sRank*1;
	
	var bStaywishRank = b.studentInfo.preference.filter(function(pref){
		return pref.stayOpportunity == hostInst;
	})[0].sRank*1;
	//console.log("DBG: a:(",a.sid,", ",aStaywishRank,"), b:(",b.sid,", ",bStaywishRank,")");
	if(aStaywishRank < bStaywishRank){  // highest rank wins
		return AWINS;
	}
	else{
		if(aStaywishRank == bStaywishRank){
			return TIE;
		}
		else{
			return BWINS;
		}
	}
}

function getAttendance(a,b){
	var aAttendance = a.studentInfo.sAttendance;
	var bAttendance = b.studentInfo.sAttendance;
   
	if((aAttendance == bAttendance) || (isNaN(aAttendance) || isNaN(bAttendance))){ // equal attendance or attendance is blank
		return TIE;
	}
	else{ // a or b wins by attendance
		return (aAttendance>bAttendance)?AWINS:BWINS;
	}
}

function getDuration(a,b,hostInst){
	var aDuration = a.studentInfo.preference.filter(function(pref){
		return pref.stayOpportunity == hostInst;
	})[0].sDuration;
	
	var bDuration = b.studentInfo.preference.filter(function(pref){
		return pref.stayOpportunity == hostInst;
	})[0].sDuration;
	
	if(aDuration > bDuration){ // higher duration wins
		return AWINS;
	}
	else if(aDuration == bDuration){
		return TIE;  	// if same duration, random index
	}
	else{
		return BWINS;
	}
}


function getDepartmentRanking(a,b, hostInst){
	//var hostInstObj = typeof(a.allocatedPlace)==="undefined"?b.allocatedPlace:a.allocatedPlace;
	
	var aDeptRank = hostInst.hostInstInfo.luDepts.filter(function(luda){
					return luda.luDept == a.studentInfo.sDepartment;
				})[0].ranking;

	var bDeptRank = hostInst.hostInstInfo.luDepts.filter(function(luda){
					return luda.luDept == b.studentInfo.sDepartment;
				})[0].ranking;

	
	if(aDeptRank < bDeptRank){ // lower number has higher rank
		return AWINS;
	}
	else if (aDeptRank == bDeptRank){
		return TIE;
	}
	else{
		return BWINS;
	}
}

function slicer(students,placesTotal,newStudent,newDuration){
	var unallocatedStudents = [];
	
	//get total duration of all students, the newStudent.allocDuration is blank atm
	var placesRequired = getTotalDuration(students)+newDuration*1;
	
	var si=students.findIndex(function(a){
		return a.sid==newStudent.sid;	
	});
	//console.log("convert to action log statement:New student position in short list is si",si);
	
	//if(getTotalDuration(students.slice(si+1,students.length))<newDuration){
		//even if we kick out all students below this student,we wont be able to allocate him
	//}
	
	while((placesTotal < placesRequired) && (students.length > si + 1)){
		var lastStudent = students.pop(); // remove last student
		
		placesRequired = placesRequired - lastStudent.allocDuration;
		unallocatedStudents.push(lastStudent);  //pushes the removes students into array of unallocated
	}
	
	if(placesRequired > placesTotal){//condition when kicking out students doesn't allocate the new student
		return {failedToAllocate:true};
	}
	else{
		return {studentsToDealloc:unallocatedStudents, failedToAllocate:false, newHIBalance:placesRequired};
	}
}


function allocateStudent(student,hostInstObj){ //this only updates the student object not the hostInst 
	//update the relevant values of the allocation student object 
	student.allocatedPlace = hostInstObj;
	student.isAlloc = true;
	student.allocRank = student.studentInfo.preference[student.currTopIdx].sRank; // assign his choice rank to student
	student.allocDuration = student.studentInfo.preference[student.currTopIdx].sDuration; // assign duration to student
}


function deallocateStudents(students,hiList){
	// set their allocated flag to false;
	var actions=[];
	for(var i=0;i<students.length;i++){ // clear up allocDuration,allocPlace, isAlloc flag  for each student
		students[i].allocatedPlace = null;
		students[i].isAlloc = false;
		students[i].allocRank = 0;
		students[i].allocDuration = 0; 
	
		// then call updateTopChoice on each student
//		console.log("DBG: deallocateStudents>calling updateTopChoice", students);
		updateTopChoice(students[i],hiList);
		actions.push({action:"ACTION: Sorter on full list (LOST ALLOCATION): " +JSON.stringify(students[i].sid)+" after sorting\n"});
	}
	return actions;
}

function updateTopChoice(failedStudent,hiList){
	failedStudent.currTopIdx++; // increments currTopIdx
	if(failedStudent.currTopIdx >= failedStudent.studentInfo.preference.length){ // checks if currTopIdx >= length of prefereces array
	
		if(typeof(failedStudent.deptWishes)==="undefined"){//first time we are here
			//populate the options that the student's departmental advisor has ranked
			var sInfo = failedStudent.studentInfo;
			//we break the encapsulation here... but can't be bothered...
		
			var deptRankedHIs = hiList.filter(function(hInstObj){
				var hInst = hInstObj.hostInstInfo;
				return hInst.luDepts.some(function(lud){
					if(lud.luDept == sInfo.sDepartment){
						if(hasSubUnit(sInfo.sSubunit)==hasSubUnit(lud.subunit)){
							return true;
						}
						else return false
					}
					else return false;
				})				
			});
	
			//now we have a list of HIs that the student's departmental YA has suggested
			deptRankedHIs = deptRankedHIs.filter(function(hInst){
				
				return !sInfo.preference.some(function(pref){
	
					return pref.stayOpportunity == hInst.hostInst; //we remove anything which was already on the student's wish list
				});
			});
	
			deptRankedHIs.sort(function(a,b){
				var luDPrefA = a.luDepts.filter(function(aLuD){
					return aLuD.luDept==sInfo.sDepartment;
				});
				if(luDPrefA.length>0){//subunit malarkey
					luDPrefA = luDPrefA.filter(function(al){
						return al.subunit == sInfo.sSubunit;						
					});
				}
				
				var luDPrefB = b.luDepts.filter(function(bLuD){
					return bLuD.luDept==sInfo.sDepartment;
				});
				if(luDPrefB.length>0){//subunit malarkey
					luDPrefB = luDPrefB.filter(function(bl){
						return bl.subunit == sInfo.sSubunit;						
					});
				}
	
				return luDPrefA[0].ranking>luDPrefB[0].ranking;
			});
			
			//now that sorting is complete, we need to populate the new deptWishes array
			failedStudent.deptWishes=[];
			for(var i=0;i<deptRankedHIs.length;i++){
				failedStudent.deptWishes.push({stayOpportunity:deptRankedHIs[i].hostInst, sDuration:sInfo.preference[0].sDuration, sRank:SUGGESTED});				
			}
			//we now have a new list to work with
	
		}
		
		var newIdx = failedStudent.currTopIdx-failedStudent.studentInfo.preference.length; 
	
		if(newIdx>=failedStudent.deptWishes.length){//not the student is truly toast
	
			failedStudent.isOptExhausted = true; // all the students choices are exhausted
		}
		else{
			return; //nothing to do yet
		}
	}	
	else{
		return;  // return nothing - continue through next iteration
	}		
		
		
	/*	
		// SUGGESTED: 999
		// if options exhausted, get the list of the unis from the department of the student
		// remove all the staywishes of the student -> if non-zero list, if places remaining in the unis ranked by the department then 
		// allocate him to the uni remaining
	*/
}


function hasSubUnit(subunit){
	if(typeof(subunit)==="undefined") return false;
	return subunit;	
}

function updateHostInst(hostInstObj,tempArray){	
	hostInstObj.placesRemaining = hostInstObj.placesTotal - getTotalDuration(tempArray); //newBalance tells us sum of the remaining student's duration.
	if(hostInstObj.placesRemaining<0){
		alert("Error: Balances computation error for: "+hostInstObj.hostInstInfo.hostInst);	
		console.log("ERR:",hostInstObj,tempArray,getTotalDuration(tempArray));
	}
	// now the new student is in the hostInst shortlist 
	hostInstObj.students = tempArray;
}

// made variables global - put them at the top
var allocRankStats = [{rank:0,count:0}]; //put objects here
var totalStudents = 0;
var unallocStudents = 0;
var allocStudents = 0;
var sumRanks = 0;
var studentAvgRank = 0;

function computeStatsStudents(students){
	totalStudents = students.length;

	for(var i=0;i<students.length;i++){		// iterates through all students individually
		var student = students[i];
		if(student.isAlloc){
			if(typeof(allocRankStats[student.allocRank*1])=== "undefined"){		//create an object if this is the first time we encounter this pref rank
				allocRankStats[student.allocRank*1] = {rank: student.allocRank*1, count:1}; 
			}
			else allocRankStats[student.allocRank*1].count++;  // increment by one
			
			sumRanks += (1*student.allocRank);
		}
		else{
			if(typeof(student.isAlloc)=== "undefined"){ 
				console.log("ERR: computeStats> isAlloc is undefined. Unexpected error", student);
			}
			else {	//isAlloc = false
				allocRankStats[0].count++;
				console.log("Student is not allocated so don't count him to average the ranks");
			}
		}		
	}
		
	unallocStudents = allocRankStats[0].count;
	allocStudents = totalStudents - unallocStudents;
	studentAvgRank = (sumRanks/(allocStudents));	// total student average rank only for students with allocations
	
	if(allocStudents + unallocStudents != totalStudents){ // this shouldnt happen, weird error
		console.log("Error: Something went wrong. Numbers don't add up");
	}
		
	//we now have sparse arrays...so we have to handle them with care
	for(var i=0;i<allocRankStats.length;i++){
		if(i in allocRankStats){//only for indices that exist
			allocRankStats[i].percent = 1*((allocRankStats[i].count/(i==0?students.length:allocStudents))*100).toFixed(2); //note the check for index 0			
		}
		else{
			console.log("INFO: Index:",i,"not present in allocRankStats",allocRankStats);
		}
	}
	
	return allocRankStats;
}

// made variabes global
var placesRemainingStats = [{places:0,count:0, hostInsts:[]}]; // put objects here
var placesTotal = 0;
var placesUnallocated = 0;
var placesAllocated = 0;

function computeStatsHostInst(hostInsts){

	for(var i=0;i<hostInsts.length;i++){	// iterates through all insts individually
		var hostInst = hostInsts[i];
		
		if(typeof(placesRemainingStats[hostInst.placesRemaining*1])=== "undefined"){		//create an object if this is the first time we encounter this nº of places remaining
				placesRemainingStats[hostInst.placesRemaining*1] = {places:hostInst.placesRemaining*1, count:1, hostInsts:[hostInst]}; 
		}
		else {
			placesRemainingStats[hostInst.placesRemaining*1].count++;  // increment by one
			placesRemainingStats[hostInst.placesRemaining*1].hostInsts.push(hostInst);
		}
		
		placesTotal += (1*hostInst.placesTotal);
		placesUnallocated += (1*hostInst.placesRemaining);
	}
	
	placesAllocated = placesTotal - placesUnallocated;
	
	for(var i=0;i<placesRemainingStats.length;i++){
		if(i in placesRemainingStats){	//only for indices that exist
			placesRemainingStats[i].percent = 1*((placesRemainingStats[i].count/(placesTotal))*100).toFixed(2);
		}
		else{
			console.log("INFO: Index:",i,"not present in placesRemainingStats",placesRemainingStats);
		}
	}
	
	return placesRemainingStats;
}

function populateStats(showNew){
	console.log("TBD: populateStats for:",showNew?"Curr Data":"Prev Data");
	var allocData = showNew?appState.currAllocData:appState.prevAllocData;
	console.log("TBD: populateStats");	
}

function generateStudentStatsTable(){
	var outerTable = $('<table>');
	var hdrRowData = ["Total Students","Allocated","Unallocated","Avg Rank"];
	var hdrRowObj = getTR(ISTDOROBJ,ISOBJ,ISHDR,{"tdContents":hdrRowData});
	outerTable.append(hdrRowObj);
	
	var dataRow = [totalStudents, allocStudents, unallocStudents, studentAvgRank]; 
	var dataRowObj = getTR(ISTDOROBJ,ISOBJ,ISROW,{"tdContents":dataRow});
	outerTable.append(dataRowObj);
	
	var rankStats = getChoiceStats();

	var maxLength=Math.max(rankStats.length);
	for(var i=0;i<maxLength;i+=2){
		var trData=[];
		if(!(typeof(rankStats[i])==="undefined")){
			trData.push(rankStats[i]);
			trData.push(rankStats[i+1]);
		}
		else{
			trData.push(getTD(""));
			trData.push(getTD(""));
		}
	
		outerTable.append( getTR(ISTDOROBJ,ISTDARR,(i==0)?ISHDR:ISROW,trData));
	}
	$("#results-student-stats").append(outerTable);
	$("#results-student-stats").append("<br>");
}

function getChoiceStats(){
	//Rank: Count: Percent:
	var choiceRanks = [];//$('<table>');

	choiceRanks.push(getTD("Rank"));
	choiceRanks.push(getTD("Number / Percentage Students"));
	
	for(var i=0;i<allocRankStats.length;i++){
		var ars = allocRankStats[i];
		if(typeof(ars)!=="undefined"){
			choiceRanks.push(getTD(ars.rank));
			choiceRanks.push(getTD(ars.count+" / "+ars.percent+"%"));
		}
	}	
	return choiceRanks;
}

function generateHostInstStatsTable(){
	var outerTable = $('<table>');
	var hdrRowData = ["Total Places","Allocated","Unallocated"];
	var hdrRowObj = getTR(ISTDOROBJ,ISOBJ,ISHDR,{"tdContents":hdrRowData});
	outerTable.append(hdrRowObj);
	
	var dataRow = [placesTotal, placesAllocated, placesUnallocated]; 
	var dataRowObj = getTR(ISTDOROBJ,ISOBJ,ISROW,{"tdContents":dataRow});
	outerTable.append(dataRowObj);
	
	var placeStats = getPlacesStats();

	var maxLength=Math.max(placeStats.length);
	for(var i=0;i<maxLength;i+=2){
		var trData=[];
		if(!(typeof(placeStats[i])==="undefined")){
			trData.push(placeStats[i]);
			trData.push(placeStats[i+1]);
		}
		else{
			trData.push(getTD(""));
			trData.push(getTD(""));
		}
	
		outerTable.append( getTR(ISTDOROBJ,ISTDARR,(i==0)?ISHDR:ISROW,trData));
	}
	$("#results-hi-stats").append(outerTable);
	$("#results-hi-stats").append("<br>");
}

function getPlaceStats(){
	//Places: Count: Percent:
	var placesRem = [];//$('<table>');

	placesRem.push(getTD("Number of Places"));
	placesRem.push(getTD("Number / Percentage Remaining"));
	
	for(var i=0;i<placesRemainingStats.length;i++){
		var prs = placesRemainingStats[i];
		if(typeof(prs)!=="undefined"){
			placesRem.push(getTD(prs.places));
			placesRem.push(getTD(prs.count+" / "+prs.percent+"%"));
		}
	}	
	return placesRem;
}