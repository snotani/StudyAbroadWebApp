const HOMEPAGE = "home";
const HOSTINST = "host-inst";
const BALANCES = "balances";
const LUDRANKS = "lu-ranks";
const HIMERGED = "partner-merged";
const HIMATRIX = "host-inst-matrix";
const HIEXPORT = "host-inst-export";
const HIFWDMAT = "matrix-forward";
const HIREVMAT = "matrix-reverse";
const HIMATEXP = "matrix-export";

const STUDENTS = "students";
const MOVEONDT = "moveon";
const LUSIDATA = "lusi";

const STMERGED = "students-merged";
const STEXPORT = "students-export";

const ALLOCPRV = "alloc-previous";

const ALLOCATE = "allocations";
const GENERATE = "generate-new";
const ALLOCNOW = "allocate-now";
const ALLOCEXP = "allocation-export";
const VIEWARES = "alloc-output";
const SETTINGS = "settings";

//file upload selectors
const BALUPLOAD = "balances-upload";
const LUDUPLOAD = "lu-ranks-upload";
const HIMUPLOAD = "himerged-upload";
const MOVUPLOAD = "moveon-upload";
const LUSUPLOAD = "lusi-upload";
const STMUPLOAD = "moveondt-upload";
const ALPUPLOAD = "old-alloc-upload";

/*/host-inst-json button-tile-host-inst-json ui-controls.js:122:4
TBD: processBtnTileClick export-matfwd button-tile-export-matfwd ui-controls.js:122:4
TBD: processBtnTileClick export-matrev button-tile-export-matrev*/

//export selectors
const HIJEXPORT = "export-hi-json";
const MFWEXPORT = "export-matfwd";
const MRVEXPORT = "export-matrev";

const STJEXPORT = "export-st-json";
const STCEXPORT = "export-st-csv";


//view matrices selectors
const VIEWFWDM = "view-matrix-forward";
const VIEWREVM = "view-matrix-reverse";

const TICKHI = "-tick-host-inst";
const TICKLD = "-tick-lu-ranks";
const TICKST = "-tick-moveon";
const TICKLU = "-tick-lusi";

//file selectors
const FSMOVEON = "#fs-moveon-upload";
const FSLUSI   = "#fs-lusi-upload";
const FSSTDMERGED = "#fs-student-merged";

const FSHIBAL  = "#fs-balances-upload";
const FSLURANK = "#fs-lu-rank-upload";
const FSHIMERGED = "#fs-balances-merged";

const FSALLOCOLD = "#fs-alloc-old";

$(document).ready(function(){
	$("#toaster").hide(); //hide the modal toaster
	$("#results-modal").hide();
	
	//set click handlers by using the class names.
	$(".nav-tile").on('click',function(){processNavTileClick(this.id);});
	$(".sub-tile").on('click',function(e){processSubTileClick(this.id,e)});
	$(".button-tile").on('click',function(e){processBtnTileClick(this.id,e)});
	
	$("#sub-tile-group-allocations").find(".sub-tile").off("click");
	$("#sub-tile-group-allocations").find(".sub-tile").on("click",function(e){
		allowAllocateActions(this.id, e);
	});
	
	$("#tile-home").click();
	setUploadHandlers();
	
	$("#appver").text(appState.appVersion);
	
});

function processNavTileClick(id){//set it active, while de-activating all other
	//console.log("DBG: id-main:",id);
		
	var currTileID = "#"+id;
	
	//make the main tiles inactive, i.e change color
	$(currTileID).siblings().removeClass("nav-tile-active");
	
	//make the sub-tiles in the inactive groups slide up and disappear
	$(currTileID).siblings().find(".sub-tile-group").slideUp(500,function(){$(this).removeClass("sub-tile-visible")});
	
	//mark the current tile active
	$(currTileID).addClass("nav-tile-active");
	
	//make the sub-tiles in the current tile slide down and appear
	$(currTileID).find(".sub-tile-group").slideDown(500,function(){$(this).addClass("sub-tile-visible")});
	$(currTileID).find(".sub-tile").removeClass("sub-tile-active");
	$(currTileID).find(".sub-tile").addClass("sub-tile-inactive");
	
	showCardGroup(id);
}

function processSubTileClick(id,e){	
	
	//when sub-tile is clicked, get all sub-tiles in the sub-tile group (parent) to which the sub-tile belongs
	//make all the sub-tiles in that group inactive
	$("#"+id).siblings().removeClass("sub-tile-active");
	$("#"+id).siblings().addClass("sub-tile-inactive");
	
	//now, make the correct sub-tile active
	$("#"+id).removeClass("sub-tile-inactive");
	$("#"+id).addClass("sub-tile-active");
	
	//prevent the click being bubbled to the parent nav-tile
	e.stopPropagation();
	
	//Nav-UI changes completed, update the main section to show the correct card 
	showCard(id);
}

function processBtnTileClick(id,e){
	var action = isValidTile(id,"processBtnTileClick");
	if(!action){ return; }	//if action is invalid, do not process it
	
	// console.log("DBG: processBtnTileClick",action);
	switch(action){
		case HOSTINST: //open home cards for the next three
		case STUDENTS:
		case ALLOCATE:
		case BALANCES: //these should only happen when Host-Inst Card is open
		case LUDRANKS: 
		case HIMATRIX:
		case HIEXPORT:
		case MOVEONDT:
		case LUSIDATA:		
		case STEXPORT:
			$("#tile-"+action).click();
			break;
		case STMERGED:
		case HIMERGED: //this requires special processing
			showCard("#tile-"+action);
			break;
		case HIFWDMAT: 
		case HIMATEXP:
		case HIREVMAT:
			showCard("#tile-"+action);
			break;
		case VIEWFWDM:
		case VIEWREVM: //show matrices in a new page
			viewMatrix(action);
			break;
		case HIMUPLOAD:
		case BALUPLOAD: //file-selector click
		case LUDUPLOAD:
		case MOVUPLOAD:
		case LUSUPLOAD:
		case STMUPLOAD:
		case ALPUPLOAD:
		case GENERATE: //similar to file upload but slightly different
			uploadCheck(action,e);
			break;
		case HIJEXPORT:
		case MFWEXPORT:
		case MRVEXPORT:
		case STCEXPORT:
		case STJEXPORT:
			exportData(action);
			break;
		case ALLOCNOW:
			allocate();
			break;
		default:
			console.log("TBD: processBtnTileClick",action, id);
	}
}

function allowAllocateActions(id,e){
	//console.log("DBG: allowAllocateActions",id);
	var action = isValidTile(id,"processBtnTileClick");
	
	switch(action){
		case ALLOCEXP:
		case GENERATE: //block if data is not loaded
			if(!appState.isLUDDataLoaded||!appState.isLUSIDataLoaded||!appState.isHIDataLoaded||!appState.isMODataLoaded){//any of them is missing
				e.stopPropagation();
				toastDialog(ALERT_ALLOC_UNAVAIL,{showYes:true,actionOnYes:"openFirstMissing();",showNo:true,actionOnNo:"dismiss"});				
			}	
			else{
				processSubTileClick(id,e); //go to generate tab
			}
			break;		
		case VIEWARES: //cannot view if neither are loaded
			if(!appState.isPrevDataLoaded&&!appState.isAllocGenerated){
				e.stopPropagation();
				toastDialog(ALERT_NO_ALLOC_TO_VIEW,{showOK:true,actionOnOK:"dismiss"});
			}else{
				processSubTileClick(id,e);
			}
			break;
		case SETTINGS:
			processSubTileClick(id,e);
			break;
		
	}
}

function showCard(id){
	var action = isValidTile(id,"showCard");
	
	console.log("INFO: showCard > id:",id,"action:",action);
	
	if(!action){ return; }	//if action is invalid, do not process it
	
	if($("#tile-"+action).parent().is(":hidden")){
		$("#tile-"+action).parent().parent().click();
	}
	
	var cardId = "#card-"+action; //select the correct card
	//console.log("DBG: showCard",cardId,$(cardId).attr("id"));
	$(cardId).siblings().hide(500,function(){}); //hide its siblings
	$(cardId).show(500,function(){}); //show the card
	
	switch(action){
		case HOMEPAGE: //if home page is loaded, we request update on appState
		case HOSTINST: //if host-inst home page is loaded, we request updates on appState
		case BALANCES:
		case LUDRANKS:
		case HIMATRIX:
		case HIFWDMAT:
		case HIMERGED:
		case HIEXPORT:
		
		case STUDENTS:
		case MOVEONDT:
		case LUSIDATA:
		case STEXPORT:
		case STMERGED:
		case GENERATE:
		case ALLOCATE:
			requestUIUpdate(action);
			break;
		case VIEWARES:// UI has already been updated
			break;
		default:
			console.log("TBD: showCard>action:",action,"Request UI update if needed? or anything else?");
	}
}

function showCardGroup(id){
	var action = isValidTile(id,"showCardGroup");
	
	console.log("INFO: showCardGroup> id:",id,"action:",action);

	if(!action){ return; }

	var cardGroupId = "#card-group-"+action; //select the correct card group
	$(cardGroupId).siblings().hide(500,function(){}); //hide the sibling card groups
	$(cardGroupId).show(500,function(){}); //show the card group`
	
	showCard(id); //also show the top card
}

function isValidTile(id,caller){//checks if the show functions were passed correct data
	if(id.split("tile-").length<2){//likely ids: tile-* sub-tile-* button-tile-*
		alert("ERR: "+id+" "+caller);
		return false;
	}
	return id.split("tile-")[1];
}


/*--------FileUpload---------*/
function uploadCheck(action,e){
	e.stopPropagation(); //stop event from bubbling
	
	switch(action){
	case LUDUPLOAD:{//lu dept ranks
		if(appState.isLUDDataLoaded){//this doesn't affect Host-Inst Data
			toastDialog(ALERT_LUD_ISAVAIL,{showYes:true,actionOnYes:"clearLUData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
		}
		else{
			openFileDialog(action);
		}
		return;
	} break;
	case BALUPLOAD:{//balances
		if(appState.isHIDataLoaded){//this affects both data
			toastDialog(ALERT_HID_ISAVAIL,{showYes:true,actionOnYes:"clearHIData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
		}
		else{
			openFileDialog(action);
		}
		return;
	}break;
	case HIMUPLOAD:{//merged file
		if(appState.isHIDataLoaded||appState.isLUDDataLoaded){
			toastDialog(ALERT_HID_ISAVAIL,{showYes:true,actionOnYes:"clearHIData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
		}
		else{
			openFileDialog(action);
		}
		return;
	}break;
	case LUSUPLOAD:{//LUSI Export
			if(appState.isLUSIDataLoaded){
				toastDialog(ALERT_LSD_ISAVAIL,{showYes:true,actionOnYes:"clearStudentData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
			}
			else{
				openFileDialog(action);
			}
			return;
		}
		break;
	case MOVUPLOAD:{//MoveON Export
			if(appState.isMODataLoaded||appState.isLUSIDataLoaded){
				toastDialog(ALERT_STD_ISAVAIL,{showYes:true,actionOnYes:"clearStudentData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
			}
			else{
				openFileDialog(action);
			}
			return;
		}
		break;
	case STMUPLOAD:{//merged student data
		if(appState.isMODataLoaded||appState.isLUSIDataLoaded){
				toastDialog(ALERT_STD_ISAVAIL,{showYes:true,actionOnYes:"clearStudentData('"+action+"');openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
			}
			else{
				openFileDialog(action);
			}
			return;
		}
		break;
	case GENERATE:{//
			if(!appState.isLUDDataLoaded||!appState.isLUSIDataLoaded||!appState.isHIDataLoaded||!appState.isMODataLoaded){//any of them is missing
				toastDialog(ALERT_ALLOC_UNAVAIL,{showYes:true,actionOnYes:"openFirstMissing();",showNo:true,actionOnNo:"dismiss"});
			}	
			else{
				$("#tile-"+GENERATE).click(); //go to generate tab
			}
		}
		break;
	case ALPUPLOAD:{ //old data uploaded to view allocations
		if(appState.isMODataLoaded||appState.isLUSIDataLoaded){
				toastDialog(ALERT_VIEW_OLD_OTHER,{showYes:true,actionOnYes:"openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
			}
			else{
				toastDialog(ALERT_VIEW_OLD,{showYes:true,actionOnYes:"openFileDialog('"+action+"');",showNo:true,actionOnNo:"dismiss"});
			}
			return;
		}
		break;
	default:
		console.log("ERR: uploadCheck","Unexpected action caller",action);
		alert("ERR: uploadCheck>"+action);
	}
}

function openFileDialog(action){
	console.log("INFO: openFileDialog requested by:",action);
	switch(action){
		case BALUPLOAD:			
			$(FSHIBAL).trigger('click');
			break;
		case LUDUPLOAD:
			if(appState.isHIDataLoaded){
				$(FSLURANK).trigger('click');
			}
			else{
				toastDialog(ERR_NEED_HI_FIRST,{showYes:true,showNo:true,actionOnNo:'dismiss',actionOnYes:'$("#tile-balances").click();'});
			}
			break;
		case HIMUPLOAD:
			$(FSHIMERGED).trigger('click');
			break;
		case MOVUPLOAD:
			console.log("DBG: openFileDialog",MOVUPLOAD,FSMOVEON,$(FSMOVEON).attr("id"));
			$(FSMOVEON).trigger('click');
			break;
		case LUSUPLOAD:
			if(appState.isMODataLoaded){
				$(FSLUSI).trigger('click');
			}
			else{
				toastDialog(ERR_NEED_MO_FIRST,{showYes:true,showNo:true,actionOnNo:'dismiss',actionOnYes:'$("#tile-moveon").click();'});
			}
			break;	
		case STMUPLOAD:
			$(FSSTDMERGED).trigger('click');
			break;	
		case ALPUPLOAD:
			$(FSALLOCOLD).trigger('click');
			break;			
		default:
			console.log("TBD: openFileDialog",action);
	}
}

function selectFile(fileFor){
	console.log("DBG: selectFile",fileFor);
	switch(fileFor){
		case 'hostInstExport': //this is the data from MoveOn about the students' stay wishes
			if(!$("hostInstExportFS").val()){//file not selected, show file selection dialog box
				$("#hostInstExportFS").trigger('click');
			}else{
				/*$("#hostInstExport").hide();
				$("#luDeptExport").show();*/
			}
			break;
		default:
			console.log("TBD: selectFile",action);
	}
}


function setUploadHandlers(){
	//student related file input handlers
	$(FSMOVEON).on('change', function() {
		uploadTrigger($(FSMOVEON).prop('files')[0], 1000000, digestMoveOnExport, MOVEONDT, FSMOVEON );
	});
	$(FSLUSI).on('change', function() {
		uploadTrigger($(FSLUSI).prop('files')[0], 1000000, digestLusiExport, LUSIDATA, FSLUSI );
	});
	$(FSSTDMERGED).on('change', function() {
		uploadTrigger($(FSSTDMERGED).prop('files')[0], 1000000, digestStMergedExport, STMERGED, FSSTDMERGED, true);
	});

		//institution related file input handlers
	$(FSHIBAL).on('change', function() {
		uploadTrigger($(FSHIBAL).prop('files')[0], 1000000, digestHostInstExport, BALANCES, FSHIBAL );
	});
	$(FSLURANK).on('change', function() {
		uploadTrigger($(FSLURANK).prop('files')[0], 1000000, digestLuDeptExport, LUDRANKS, FSLURANK );
	});
	$(FSHIMERGED).on('change', function() {
		uploadTrigger($(FSHIMERGED).prop('files')[0], 1000000, digestHIMergedExport, HIMERGED, FSHIMERGED, true);
	});	
	
	$(FSALLOCOLD).on('change', function() {
		uploadTrigger($(FSALLOCOLD).prop('files')[0], 1000000, digestAllocExport, ALLOCPRV, FSALLOCOLD, true);
	});
}

function uploadTrigger(fileHnd, maxSize, callForwardFn, action, callerFSId, isJSON){
	if(fileHnd.size<maxSize){//we don't allow files bigger than 1MB
		processFile(fileHnd, callForwardFn, action,callerFSId, isJSON);
	}
	else{
		toastDialog("Selected file: '"+fileHnd.name+"' is too large ("+fileHnd.size+").<br>Please select a smaller file",{showOK:true,actionOnOK:"hideToast();$('#"+callerFSId+"').click();"});			
	}	
}

/*---------UI Update---------*/

function openFirstMissing(){
	if(!appState.isHIDataLoaded){
		$("#tile-"+BALANCES).click();
		return;
	}
	if(!appState.isMODataLoaded){
		$("#tile-"+MOVEONDT).click();
		return;
	}	
	if(!appState.isLUDDataLoaded){
		$("#tile-"+LUDRANKS).click();
		return;
	}
	if(!appState.isLUSIDataLoaded){
		$("#tile-"+LUSIDATA).click();
		return;
	}	
	console.log("ERR: openFirstMissing>this should never execute",appState);
}

function advanceUI(action){
	switch(action){
		case BALANCES: //partner data loaded
			requestUIUpdate(action);
			$("#tile-"+LUDRANKS).click();
			break;
		case LUDRANKS: //partner data loaded;
			requestUIUpdate(action);
			$("#tile-"+HIMATRIX).click();
			break;
		case HIMATRIX:
			requestUIUpdate(action);
			break;
		case HIMERGED:
			requestUIUpdate(action);
			$("#tile-"+HIMATRIX).click();
			break;
		case MOVEONDT:
			requestUIUpdate(MOVEONDT);
			$("#tile-"+LUSIDATA).click();
			break;
		case LUSIDATA:
			requestUIUpdate(LUSIDATA);
			$("#tile-"+STEXPORT).click();
			break;
		case STMERGED:
			requestUIUpdate(STMERGED);
			$("#tile-"+STEXPORT).click();
			break;	
		case ALLOCPRV:
			requestUIUpdate(ALLOCPRV);
			$("#tile-"+VIEWARES).click();
			break;
		default:
			console.log("TBD: advanceUI",action);
			break;		
	}
	
}

function requestUIUpdate(card){
	switch(card){
		case HOMEPAGE:
		case ALLOCATE:
			updateTicks(card,true,true,true,true); break;
		case HIMATRIX:
		case HIFWDMAT:
		case HIMERGED:	
		case HOSTINST:
		case HIEXPORT:
			updateTicks(card,true,true,false,false); break;
		case BALANCES:
			updateTicks(card,true,false,false,false); break;
		case LUDRANKS:
			updateTicks(card,false,true,false,false); break;
		case HIMUPLOAD: //button on HIMERGED card
			updateTicks(HIMERGED,true,true,false,false); break;
		case STUDENTS:
		case STEXPORT:
		case STMERGED:
			updateTicks(card,false,false,true,true); break;
		case MOVEONDT: //MOVEONDT
			updateTicks(card,false,false,true,false); break;
		case LUSIDATA:
			updateTicks(card,false,false,false,true); break;	
		case GENERATE:
			updateTicks(card,true,true,true,true);break;
		case ALLOCPRV:
			populateStats(false);break;
		default:
			console.log("TBD: requestUIUpdate",card);
	}
}

function updateTicks(preprefix,hiData,ldData,stData,luData){
	var prefix = "#"+preprefix;
	var dbgAttr = hiData?TICKHI:ldData?TICKLD:stData?TICKST:TICKLU;
//	console.log("DBG: updateTicks",prefix,dbgAttr, hiData,ldData,stData,luData,$(prefix+dbgAttr).attr("id"));
	if(hiData){
		if(appState.isHIDataLoaded){$(prefix+TICKHI).removeClass("text-tick-hide");}
		else{$(prefix+TICKHI).addClass("text-tick-hide");	}
	}
	
	if(ldData){
		if(appState.isLUDDataLoaded){$(prefix+TICKLD).removeClass("text-tick-hide");}
		else{$(prefix+TICKLD).addClass("text-tick-hide");	}
	}
	
	if(stData){
		//console.log("DBG: updateTicks>moveON",prefix+TICKST,stData,luData,$(prefix+TICKST).attr("id"));
	
		if(appState.isMODataLoaded){$(prefix+TICKST	).removeClass("text-tick-hide");}
		else{$(prefix+TICKST).addClass("text-tick-hide");}
	}
	
	if(luData){
		//console.log("DBG: updateTicks>moveON",prefix+TICKLU,stData,luData,$(prefix+TICKLU).attr("id"));
		if(appState.isLUSIDataLoaded){$(prefix+TICKLU).removeClass("text-tick-hide");}
		else{$(prefix+TICKLU).addClass("text-tick-hide");}	
	}
	
}



/*---------Error messages modal display---------*/
function toastDialog(msg, choices){
	$("#toasterMsg").html(msg);
	$("#toaster").show();
	//auto-hide all buttons
	$("#modal-buttons").children().hide();
	/*$("#choiceOK").hide();
	$("#choiceYes").hide();
	$("#choiceNo").hide();
	*/
	if(typeof(choices.showOK)!=="undefined"){//show it
		$("#choiceOK").show();
		$("#choiceOK").attr("onclick",(choices.actionOnOK=="dismiss"?'':choices.actionOnOK)+"hideToast();");
	}

	if(typeof(choices.showYes)!=="undefined"){//show it
		$("#choiceYes").show();
		$("#choiceYes").attr("onclick",(choices.actionOnYes=="dismiss"?'':choices.actionOnYes)+"hideToast();");
	}
	
	if(typeof(choices.showNo)!=="undefined"){//show it
		$("#choiceNo").show();
		$("#choiceNo").attr("onclick",(choices.actionOnNo=="dismiss"?'':choices.actionOnNo)+"hideToast();");
	}		
}
	
function hideToast(){
	$("#toaster").hide();		
}

function viewMatrix(whichOne){
	if(whichOne==VIEWFWDM){
		var w = window.open();
		$(w.document.body).append(generateFwdMatrix());
	}
	else{
		var w = window.open();
		var html = $("#toNewWindow").html();

		$(w.document.body).html("<h1>TBD: viewMatrix: Generate for "+whichOne+"<h1>");
	}
}

function dumpTags(className,depth){
	var hnd = document.getElementsByClassName(className);
	var lists=[];
	for(var i=0;i<hnd.length;i++){
		var topParent=getParent(hnd[i],depth);
		console.log("DBG Tags:",topParent.id,">",hnd[i].id);
		var duplicate = getDuplicates(hnd[i].id, lists, "id");
		if(duplicate.length>0){
			duplicate[0].parents.push(topParent.id);
		}
		else{
			lists.push({id:hnd[i].id,parents:[topParent.id]});
		}
	}	
	for(var i=0;i<lists.length;i++){		
		if(lists[i].parents.length>1){
			console.log("Duplicates:",lists[i].id,">",lists[i].parents.join(", "));
		}
	}
}
function getParent(node,depth){
	var parentNode=node;
	var itr=0;
	while(itr<depth){
		parentNode = parentNode.parentNode;
		itr++;
	}	
	return parentNode;
}