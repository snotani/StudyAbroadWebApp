//constants for exporting results
const FDATA_TYPE_TSV ='data:text/tsv;charset=utf-8,';
const FDATA_TYPE_CSV ='data:text/csv;charset=utf-8,';
const FDATA_TYPE_JSON ='data:application/json;charset=utf-8,';
const FDATA_TYPE_TEXT = 'data:text/plain;charset=utf-8,';
const FDATA_TYPE_XLS  = 'data:application/vnd.ms-excel,';

const FILE_HI_JSON = "export-partners-#DATE.json";
const FILE_ST_JSON = "export-students-#DATE.json";
const FILE_ALLOC_JSON = "export-allocations-#DATE.json";
const FILE_ACT_LOG = "action-log-#DATE.txt";
const FILE_FWD_MAT = "forward-matrix-#DATE.xls";
const FILE_REV_MAT = "reverse-matrix-#DATE.xls";

const META_HI = "Merged Partners-LU Department Data";
const META_ST = "Merged Students-MoveOn and LUSI Data";
const META_AL = "Generated Allocation [#DATE]";

const ISSTR = true;
const ISTDOROBJ = false;
const ISTDARR = true;
const ISOBJ = false;
const ISHDR = true;
const ISROW = false;

function exportData(action){//export JSONs, CSVs etc
	switch(action){
		case HIJEXPORT:
		case MFWEXPORT:
		case MRVEXPORT: //we need both HI and LUR available
			if(!appState.isLUDDataLoaded||!appState.isHIDataLoaded){// without these, exports don't work.
				var firstMissing = appState.isHIDataLoaded?LUDRANKS:BALANCES;
				toastDialog(ALERT_PID_UNAVAIL,{showYes:true,actionOnYes:'$("#tile-'+firstMissing+'").click();',showNo:true,actionOnNo:'dismiss'});
				return;
			}
			else{//data is available
				if(action!=HIJEXPORT){
					console.log("TBD: export CSVs for matrices");
					if(action==MFWEXPORT){
						exportAsExcel(generateFwdMatrix(),FILE_FWD_MAT);
					}	
					else
						console.log("TBD: exportData",action,"pending");
				}
				else{
					exportAsJSON(appState.hostInstObj,FILE_HI_JSON,META_HI);
				}
			}
			break;
		case STCEXPORT:
		case STJEXPORT: //we need both LUSI and MoveON available
			if(!appState.isLUSIDataLoaded||!appState.isMODataLoaded){// without these, exports don't work.
				var firstMissing = appState.isMODataLoaded?LUSIDATA:MOVEONDT;
				toastDialog(ALERT_STD_UNAVAIL,{showYes:true,actionOnYes:'$("#tile-'+firstMissing+'").click();',showNo:true,actionOnNo:'dismiss'});
				return;
			}
			else{//data is available
				if(action!=STJEXPORT){
					console.log("TBD: export CSVs for student info");
				}
				else{
					exportAsJSON(appState.moveOnObj,FILE_ST_JSON,META_ST);
				}
			}
			break;
		
		case ALCEXPORT: //this cannot be called without a complete allocation being generated
			var deRefObj = deReference(appState.tempAlloc);  //the calling action stores the correct alloc object as tempAlloc
			exportAsJSON(deRefObj,FILE_ALLOC_JSON,META_AL.replace("#DATE",getTimeStamp()));
			break;		
		default:
			console.log("TBD: exportData",action);
			
		
	}
}

function exportAsJSON(obj,fileName, metaTag){
	var dataStrInst="";
	dataStrInst = JSON.stringify({appVersion:appState.appVersion, metaInfo:metaTag, data:obj, parity: getParity(JSON.stringify(obj)+appState.appVersion)});

	downloadFile(dataStrInst,fileName.replace("#DATE",getTimeStamp()),FDATA_TYPE_JSON); //downloads the file with moveOnexport and LusiExport
}

function getTimeStamp(){
	return (new Date()).toJSON().split(".")[0].replace("T","-").replace(":","-").replace(":","-");
}

function exportAsExcel(table,fileName){    
	var tabledata = table.get(0).outerHTML;
	downloadFile(tabledata,fileName.replace("#DATE",getTimeStamp()),FDATA_TYPE_XLS); //downloads the file with moveOnexport and LusiExport
}

function exportAsHTML(resultsDiv){
	// use this function to call student table and institution table when buttons in 'View' clicked
	var strHTML="<html><head><style>STYLETEXT</style></head><body>BODYTEXT</body></html>";
	window.open('data:text/html:charset=utf-8,'+escape(strHTML.replace("BODYTEXT",$(resultsDiv).html()).replace("STYLETEXT",$('style').html())),"allocations.html");
}

function generateStudentTable(studentList){
	var studentTable = $('<table>');
	var hdrRow=["Student ID","Name","Email","Allocated Institution","Pref Rank","Degree Programme (Home)","Department (Home)","Duration"];
	studentTable.append(getTR(ISTDOROBJ,ISOBJ,ISHDR,{"tdContents":hdrRow}));
	var studentData=[];
	
	studentList.sort(function(a,b){ // sort function by order of display
		if(a.sDepartment==b.sDepartment){
			if(a.sDegree==b.sDegree){
				return a.sid>b.sid;
			}
			else 
				return a.sDegree>b.sDegree;
		}
		else	
			return a.sDepartment>b.sDepartment;
	});
	
	for(var i=0;i<studentList.length;i++){
		var student = studentList[i];
		if(student.isAlloc){
			studentData = [student.sid,student.studentInfo.sName,student.studentInfo.sEmail,student.allocatedPlace,student.allocRank,student.studentInfo.sDegree,student.studentInfo.sDepartment,student.allocDuration];
		}
		else{
			studentData = [student.sid,student.studentInfo.sName,student.studentInfo.sEmail,"None",student.allocRank,student.studentInfo.sDegree,student.studentInfo.sDepartment,student.allocDuration];
		}
		
		var tr = getTR(false,false,false,{"tdContents":studentData});
		if(student.isAlloc==false) tr.addClass("unalloc");
		studentTable.append(tr);		
	}
	
	$("#results-wrapper").append(studentTable);
	$("#results-wrapper").append("<br>");
}

function generateInstitutionTable(hostInstList){
	var institutionTable = $('<table>');
	var hdrRow=["Host Institution","Location","Total Places (semesters)","Places Remaining","Students Allocated"];
	institutionTable.append(getTR(ISTDOROBJ,ISOBJ,ISHDR,{"tdContents":hdrRow}));
	var instData=[];
	
	/*hostInstList.sort(function(a,b){ // sort function by order of display
		if(a.sDepartment==b.sDepartment){
			if(a.sDegree==b.sDegree){
				return a.sid>b.sid;
			}
			else 
				return a.sDegree>b.sDegree;
		}
		else	
			return a.sDepartment>b.sDepartment;
	});*/
	
	for(var i=0;i<hostInstList.length;i++){
		var inst = hostInstList[i];
		if(inst.students.length != 0){
			instData = [inst.hostInst,inst.hostInstInfo.hLocation,inst.placesTotal,inst.placesRemaining,inst.students.map(({studentInfo})=>studentInfo.sName).join("', '")];
		}
		else{
			instData = [inst.hostInst,inst.hostInstInfo.hLocation,inst.placesTotal,inst.placesRemaining,"None"];
		}
		
		var tr = getTR(false,false,false,{"tdContents":instData});
		institutionTable.append(tr);		
	}
	
	$("#results-wrapper").append(institutionTable);
	$("#results-wrapper").append("<br>");
}

//download helper
function downloadFile(data, fileName, dataType){	
	try{
		var downloadHnd = document.createElement('a');
		downloadHnd.setAttribute('href', dataType + encodeURIComponent(data));
		downloadHnd.setAttribute('download', fileName);

		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			downloadHnd.dispatchEvent(event);
		}
		else {
			console.log("DBG: downloadFile>downloadTriggered");
			downloadHnd.click();
		}
	}
	catch(e){
		console.log(e,data,fileName,dataType);
		
	}
}

//parity checker
function getParity(s) {
    var hash = 0,
      i, char;
    if (s.length == 0) return hash;
    for (i = 0, l = s.length; i < l; i++) {
      char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return "0x"+((hash + 2147483647) + 1).toString(16);
};

//helper functions that use jquery
function generateTR(tr,tdContents){
	for(var i=0;i<tdContents.length;i++){
		var td=$('<td>');
		td.html(tdContents[i]);
		tr.append(td);
	}	
}

function getTD(content){
	var td=$('<td>');
	td.html(content);
	return td;
}

function getTR(isContent,isTDArray,isHeaderRow,tdData){//isContent=true if tdData is a string containing <TD>s; else if isTDArray=true, it is an array of TD handles, if false it is an object with two arrays, tdContents and tdStyles
	var tr=isHeaderRow?$('<thead>'):$('<tr>');
	if(isContent){
		tr.html(tdData); //string containing a few <td>data</td> 
	}
	else{
		if(isTDArray){ //an array of td handles
			for(var i=0;i<tdData.length;i++){
				tr.append(tdData[i]);
			}
		}	
		else{
			generateTR(tr,tdData.tdContents);
		}
	}
	return tr;	
}
