// Strings to be shown as error messages for error checks
const BAD_STUDENT_ID = "Bad Student ID: #SID";
const BAD_NAME = "Bad Student Name, contains invalid characters: #SNAME";
const INVALID_FILE_BALANCES = "File's header is invalid. This may be the wrong file for Host Institution Balances";
const INVALID_FILE_LUDRANKS = "File's header is invalid. This may be the wrong file for LU Department Rankings";
const INVALID_FILE_MOVEON= "File's header is invalid. This may be the wrong file for MoveOn Data";
const INVALID_FILE_LUSI= "File's header is invalid. This may be the wrong file for LUSI Data";

const INVALID_HI_NAME="Invalid Host Institution name or blank: '#HOSTINST'";
const INVALID_LUD_NAME="Invalid LU department name or blank: '#LUDEPT'";
const INVALID_HI_NAME_CHARS = "Invalid Host Institution name has invalid characters: '#HOSTINST'"
const INVALID_LOCATION = "Location for: #HOSTINST is blank";

const INVALID_LU_RANK="Invalid value for LU RANK or blank: '#LURANK'";
const INVALID_PREF_FLAG="Invalid preference value. Should be a number or blank. Got '#PREF'";
const INVALID_LU_DEPT_CODE="Department code should not be blank. Got '#CODE'";
const INVALID_LU_FAC_CODE = "Faculty code should not be blank. Got '#FAC'";
const INVALID_SUBUNIT_STRING = "Subunit should be a string. Got '#SUBUNIT'";
const NOT_IN_PARTNER_LIST="'#HOSTINST' not found in master list of Host Institutions but ranked by #LUDEPT. Remove from list to proceed";
const RANKED_DUPLICATE="#LUDEPT has already ranked #HOSTINST. Please remove to proceed";

const BAD_STUDENT_EMAIL = "Invalid Student Email: #SEMAIL";
const INVALID_OR_EMPTY = "#COLUMN is empty or contains an invalid number: #SFIELD for #SNAME";
const INVALID_OR_NOTINRANGE = "#COLUMN contains an invalid number: #SFIELD for #SNAME";
const NOT_IN_STAYWISHES = "#SID has not provided stay wishes. Remove from LUSI export to proceed";
const DUPLICATE_RECORD = "Duplicate records for attendance and grades for Student: #SNAME";
const BAD_HI_NAME = "Bad Host Institution Name or blank: #HOSTINST";

const INVALID_PLACES = "Balances for: #HOSTINST is blank or not a number";
const INVALID_PLACESPERDEPT = "Balances per Department for: #HOSTINST is not a number";
const INVALID_LOGIC_PLACES = "Total balances #HPLACES for #HOSTINST is less than the number of balances in department #HDEPT: #HPLACESPERDEPT";
const NOT_IN_MASTERLIST = "'#HOSTINST' not found in master list of Host Institutions but ranked by #LUDEPT. Remove from list to proceed";
const DUPLICATE_RANKING = "#LUDEPT has already ranked #HOSTINST. Please remove to proceed";
const WRONG_FILE = "Incorrect #FILE file structure. Possibly uploaded the wrong file.";
const PARSING_ERROR = "#ERRORNAME: #ERRORMSG";

const ALERT_LUD_ISAVAIL="LU department rankings have already been uploaded. <br>Do you want to clear previous data and upload new rankings?";
const ALERT_HID_ISAVAIL="Partner balances (and LU department rankings) have already been uploaded. <br>Do you want to clear previous data and upload fresh information?";
const ALERT_PID_UNAVAIL="Partner balances and/or LU department rankings are not uploaded.<br>Exports cannot be generated without these.<br>Do you want to upload these?";
const ALERT_LSD_ISAVAIL="LUSI Grades and Attendances have already been uploaded. <br>Do you want to clear previous data and upload new values?";
const ALERT_STD_UNAVAIL="MoveOn Stay Wishes or LUSI Grades and Attendances are not uploaded.<br>Exports cannot be generated without these.<br>Do you want to upload these?";
const ALERT_STD_ISAVAIL="MoveOn Stay Wishes (and LUSI Grades and Attendances) have already been uploaded. <br>Do you want to clear previous data and upload fresh information?";
const ALERT_ALLOC_UNAVAIL="Allocations cannot be generated with incomplete data. <br>Do you want to upload missing data?";
const ALERT_VIEW_OLD="You are about to upload a previously generated allocation. Please note that you can only view this and cannot make any changes to it. <br>Do you wish to proceed?";
const ALERT_VIEW_OLD_OTHER="You are about to upload a previously generated allocation. Please note that you can only view this and cannot make any changes to it.<br>You have already uploaded student or partner institution data. These will not be affected or modified in any way. <br>Do you wish to proceed?";
const ALERT_NO_ALLOC_TO_VIEW="No allocation has been generated or loaded for viewing. <br>Please generate one or load a previously generated one.";


const ERR_NEED_HI_FIRST = "Partner Institution Balances need to be loaded before LU Rankings. Do you wish to do so first?";
const ERR_NEED_MO_FIRST = "MoveOn Stay Wishes need to be loaded before LUSI data. Do you wish to do so first?";



//merged files errors
const WRONG_BIN_FILE = "Invalid file uploaded.";
const ERR_APP_VER="This file was not created by the current application (v#APPVER). Got v#GOTVER. File is unusable.";
const ERR_PARITY="This file is corrupted and failed parity checks. File is unusable.";
