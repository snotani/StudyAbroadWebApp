var verboseDecisions=false; //set to true to get additional info on decisions

function unitTestCase1(){

	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":1},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":2},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":3},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":4},
					
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":5},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"3","sDuration":"2"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":6},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"2"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":7}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""},{"luDept":"Department of Psychology","ranking":1,"preferred":""}],"hRegion":"Canada"}
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
	
	console.log("Test Cases: 1,2: Dept: avail or no restrictions, HI: avail and full : Action: Allocate Blindly/Full Sorter.");
	console.log("\t\tPass Conditions: Allocated student list: 'Astute Gaur', 'Considerate Dragonfly', 'Eloquent Chicken'");
	console.log("\t\tPass Conditions: Unallocated student list: 'Dashing Vulture','Busy Tapir','Fabulous Shark','Gifted Worm'");
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
}

function unitTestCase2(){

	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":1},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":2},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":3},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":4},
					
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":5},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"3","sDuration":"2"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":6},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"2"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":7}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""},{"luDept":"Department of Psychology","ranking":2,"preferred":""}],"hRegion":"Canada"}
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
	console.log("Test Cases: 2: Dept: NR, LU Ranking affects outcome, HI: avail and full : Action: Allocate Blindly/Full Sorter. Lower LU Rank Dept loses");
	console.log("\t\tPass Conditions: Allocated student list: 'Astute Gaur', 'Busy Tapir', 'Dashing Vulture'");
	console.log("\t\tPass Conditions: Unallocated student list:'Considerate Dragonfly','Eloquent Chicken','Fabulous Shark','Gifted Worm'");
	
	//apply sma with additional conditions
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
	
}

function unitTestCase3(){

	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":1},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":2},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":3},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":4},
					 
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":5},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"3","sDuration":"2"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":6},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"2"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":7}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""},{"hDept":"School of Computing and Communications","hPlacesPerDept":4,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""},{"luDept":"Department of Psychology","ranking":2,"preferred":""}],"hRegion":"Canada"}
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
		allocationHostInsts.push({hostInst:institution.hostInst,placesTotal:institution.hPlaces*1,placesRemaining:institution.hPlaces*1,
		placesPerDeptRemaining:institution.hiDepts[1].hPlacesPerDept*1, students:[],hostInstInfo:institution});
	}
	
	console.log("Test Cases: 3: Dept: SCC Restricted, HI: avail and full : Action: Allocate Blindly/Full Sorter. Lower LU Rank Dept loses");
	console.log("\t\tPass Conditions: Allocated student list: 'Astute Gaur', 'Dashing Vulture', 'Eloquent Chicken'");
	console.log("\t\tPass Conditions: Unallocated student list:'Busy Tapir', 'Considerate Dragonfly','Fabulous Shark','Gifted Worm'");
	
	//apply sma with additional conditions
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
	
}

function unitTestCase4(){

	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":7},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":6},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":5},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":4},
					
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":3},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"3","sDuration":"1"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":2},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"2"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":1}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""},{"hDept":"School of Computing and Communications","hPlacesPerDept":4,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""},{"luDept":"Department of Psychology","ranking":2,"preferred":""}],"hRegion":"Canada"}
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
		allocationHostInsts.push({hostInst:institution.hostInst,placesTotal:institution.hPlaces*1,placesRemaining:institution.hPlaces*1,
		placesPerDeptRemaining:institution.hiDepts[1].hPlacesPerDept*1,students:[],hostInstInfo:institution});
	}
	console.log("Test Cases: 2: Dept: NR, LU Ranking affects outcome, HI: avail and full : Action: Allocate Blindly/Full Sorter. Lower LU Rank Dept loses");
	console.log("\t\tPass Conditions: Allocated student list: 'Astute Gaur', 'Considerate Dragonfly','Eloquent Chicken'");
	console.log("\t\tPass Conditions: Unallocated student list:'Busy Tapir','Dashing Vulture','Gifted Worm','Fabulous Shark'");
	
	//apply sma with additional conditions
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
	
}

function unitTestCase6(){

	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":7},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":6},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":5},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":4},
					
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":3},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":2},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"1"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":1}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""},{"hDept":"School of Computing and Communications","hPlacesPerDept":4,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":1,"preferred":""},{"luDept":"Department of Psychology","ranking":1,"preferred":""}],"hRegion":"Canada"}
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
		allocationHostInsts.push({hostInst:institution.hostInst,placesTotal:institution.hPlaces*1,placesRemaining:institution.hPlaces*1,
		placesPerDeptRemaining:institution.hiDepts[1].hPlacesPerDept*1,students:[],hostInstInfo:institution});
	}
	console.log("Test Cases: 6: Dept: NR, LU Ranking affects outcome, HI: avail and full : Action: Allocate Blindly/Full Sorter. Both Dept Ranks Equal");
	console.log("\t\tPass Conditions: Allocated student list: 'Astute Gaur', 'Considerate Dragonfly', 'Eloquent Chicken', 'Gifted Worm'");
	console.log("\t\tPass Conditions: Unallocated student list:'Busy Tapir','Dashing Vulture','Fabulous Shark'");
	
	//apply sma with additional conditions
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
	
}

function unitTestCase5(){
	if(true){
	//alert("DBG moode on preAllocationStep");
	 studentList=[
					{"sid":"3001","sName":"Astute Gaur","sEmail":"b.gaur@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"64","sGrade":"23","sGPlace":false,"rid":7},
					
					{"sid":"3002","sName":"Busy Tapir","sEmail":"b.tapir@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"2","sDuration":"2"}],
					"lusi":true,"sAttendance":"50","sGrade":"20","sGPlace":false,"rid":6},
					
					{"sid":"3003","sName":"Considerate Dragonfly","sEmail":"g.dragonfly@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"23","sGPlace":false,"rid":5},
					
					{"sid":"3004","sName":"Dashing Vulture","sEmail":"f.vulture@lancaster.ac.uk","sDegree":"BSc Hons : Computer Science (Study Abroad) : Full Time",
					"sDepartment":"School of Computing and Communications",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"2"}],
					"lusi":true,"sAttendance":"56","sGrade":"15","sGPlace":false,"rid":4},
					
					{"sid":"3005","sName":"Eloquent Chicken","sEmail":"g.chicken@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"1","sDuration":"1"}],
					"lusi":true,"sAttendance":"90","sGrade":"22","sGPlace":false,"rid":3},
					
					{"sid":"3006","sName":"Fabulous Shark","sEmail":"t.shark@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"3","sDuration":"1"}],
					"lusi":true,"sAttendance":"76","sGrade":"16","sGPlace":false,"rid":2},
					
					{"sid":"3007","sName":"Gifted Worm","sEmail":"d.worm@lancaster.ac.uk","sDegree":"BSc Hons : Psychology : Full Time",
					"sDepartment":"Department of Psychology",
					"preference":[{"stayOpportunity":"University of Toronto","sRank":"4","sDuration":"2"}],
					"lusi":true,"sAttendance":"82","sGrade":"19","sGPlace":false,"rid":1}
				]; 
	}	

	if(true){
	//alert("DBG mode on preAllocationStep, hostInst");
	 hostInstList=[
					{"hostInst":"University of Toronto","hLocation":"Canada","hPlaces":6,
					"hiDepts":[{"hDept":"","hPlacesPerDept":0,"hRequire":""},{"hDept":"School of Computing and Communications","hPlacesPerDept":4,"hRequire":""}],
					"luDepts":[{"luDept":"School of Computing and Communications","ranking":2,"preferred":""},{"luDept":"Department of Psychology","ranking":1,"preferred":""}],"hRegion":"Canada"}
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
		allocationHostInsts.push({hostInst:institution.hostInst,placesTotal:institution.hPlaces*1,placesRemaining:institution.hPlaces*1,
		placesPerDeptRemaining:institution.hiDepts[1].hPlacesPerDept*1,students:[],hostInstInfo:institution});
	}
	console.log("Test Cases: 5: Dept: NR, LU Ranking affects outcome, HI: avail and full : Action: Allocate Blindly/Full Sorter. Lower LU Rank Dept loses");
	console.log("\t\tPass Conditions: Allocated student list: 'Eloquent Chicken','Gifted Worm', 'Fabulous Shark','Astute Gaur'");
	console.log("\t\tPass Conditions: Unallocated student list:'Busy Tapir','Considerate Dragonfly','Dashing Vulture'");
	
	//apply sma with additional conditions
	console.log("-----------------------------------------------Test case running-----------------------------------------------");
	//apply sma with additional conditions
	stableMarriageAllocation(allocationStudents, allocationHostInsts);
	console.log("-----------------------------------------------Test case completed---------------------------------------------");
	stringifyAllocations(allocationStudents,allocationHostInsts[0])
	
}

function stringifyAllocations(students, hi){
	console.log("Host Inst: ",hi.hostInst, "Total Places: ", hi.placesTotal, "Allocated: ", (hi.placesTotal-hi.placesRemaining), "Department Restrictions:", hi.hostInstInfo.hiDepts.length>1?"Yes":"No");
	console.log("Allocated students:","'"+hi.students.map(function(student){ return students.filter(function(s){return s.sid==student.sid;})[0].studentInfo.sName}).join("', '")+"'");
	console.log("Unallocated students:","'"+students.filter(({isOptExhausted}) => isOptExhausted==true).map(({studentInfo})=>studentInfo.sName).join("', '")+"'")
	console.log(students,hi);
}


function rTxt(action){
	switch(action){
		case TIE: return "TIE"; break;
		case AWINS: return "AWINS"; break;
		case BWINS: return "BWINS"; break;
		case DEPT_DIFF: return "D DIFF"; break;
		case DEPT_SAME: return "D SAME"; break;
		default:return "UNKNOWN "+action;
	}
	
}


function debugMR(arr){
	return arr.map(({allocDuration,studentInfo})=>"'"+studentInfo.sName+"' ("+allocDuration+")").join(", ");
}
