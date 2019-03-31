var appState={
	/*the four flags below are set when the file successfully loads*/
	isHIDataLoaded:false,
	isLUDDataLoaded:false,
	isMODataLoaded:false,
	isLUSIDataLoaded:false,
	hostInstObj:null,
	moveOnObj: null,
	appVersion:"1.1.0",
	minGradeDelta:1
};


/*---- Documentation for future use----
execution pathways:
ui-controls.js > setUploadHandlers sets the upload handlers for the 6(+) file upload dialogs
ui-controls.js>fs.onChange -> uploadTrigger (action,callFwdFn,fs.id) -> pre-processor.js>processFile ->callFwdFn (fs.id,file.data,action) -> broadcastSuccess(digest,action)-> ui-controls.js>advanceUI(action) -> requestUIUpdate -> updateTicks -> DONE

ui-controls.js>processBtnTileClick -> tile-action.click -> processNavTileClick(tile-action.id) -> showCardGroup (action) -> showCard -> requestUIUpdate -> updateTicks -> DONE;
								   -> showCard(action) -> requestUIUpdate -> updateTicks -> DONE;
								   -> viewMatrix(action)
								   -> uploadCheck(action) -> openFileDialog -> fs.click -> WAIT FILE SELECT;
								   -> data-export.js>exportData(action)	-> exportAsJSON
																		-> exportASCSV
								   

*/