/* ------------------------------------------- */
/* -- Google form workflows by Kevin Turner -- */

/* -- Referencing central function library as 'cfl.function', must be added to this projects libraries -- */
/* -- Set the following properties to define your global script attributes -- */

// The recipient address for error messages
PropertiesService.getScriptProperties().setProperty('errorEmail', 'kevin.turner@danebank.nsw.edu.au');

// The email template to use from the central function library
PropertiesService.getScriptProperties().setProperty('emailTemplate', 'Simple');

// The name of the form for communication purposes
PropertiesService.getScriptProperties().setProperty('formCommsName', 'Professional Development Application');

// The name mask for sent emails
PropertiesService.getScriptProperties().setProperty('senderMask', 'Danebank Forms');

// A clause for confirmation emails to workflow initiators where there is an approval process involved, will be ignored in a non approval workflow
PropertiesService.getScriptProperties().setProperty('approvalClause', 'You will be notified of the outcome via an automated email once your submission has been reviewed');

// A clause to go in the footer of email correspondence
PropertiesService.getScriptProperties().setProperty('footerClause', 'This data is confidential and must be used with discretion.<br>If you are having any trouble with this email please contact helpdesk@danebank.nsw.edu.au'); 

// Workflow type required:
// 1 = Simple confirmation
// 2 = Single Approval
// 3 = Double Approval (Sequential approval workflows)
PropertiesService.getScriptProperties().setProperty('workflowType', 3);

// The wording of the stage 1 approval pending status [optional]
PropertiesService.getScriptProperties().setProperty('stage1Status', 'Pending Approval from Head of Department');

// The wording of the stage 2 approval pending status [optional]
PropertiesService.getScriptProperties().setProperty('stage2Status', 'Pending Approval from Executive Staff');

/* ----- End of global script attributes ----- */
/* ------------------------------------------- */

// run this once the first time this script is installed and the above attributes have been set
function Initialize() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i in triggers) { ScriptApp.deleteTrigger(triggers[i]); }
  ScriptApp.newTrigger("SendWorkflowMail").forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create(); // Simple Confirmation worfklow trigger
  cfl.createWorkflowColumns(PropertiesService.getScriptProperties().getProperty('workflowType')); // Create columns for specified workflow
}

function woah(e) {
  var testURL = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var testURL2 = ScriptApp.getService().getUrl();
  var timestamp = e.parameter.recordID;
}

// Web app workflow approvals function
// Most mobile device email applications won't process HTML forms, so approval buttons must be a href get calls such as below, MAKE SURE NO SENSITIVE DATA IS EXPOSED AS THIS IS AN INSECURE METHOD
// Must be called as webAppURL?key1=value1&key2=value2&etc
// Currently expecting approve=true/false, recordID=timestamp, docID=GUID of target google sheet, source=email, initID=email
// eg https://script.google.com/a/danebank.nsw.edu.au/macros/s/AKfycbxNW0wajUzlk9vLJx2y3TOxSjLS1owVQ85R0mD9fxcOqD8r3sUC/exec?approve=true&recordID=02/07/2018%2015:33:01&docID=1FcipTdTYpwC_zM_cD6Fgu5XQKQXK1zZmxMydaXtwgRA&initID=kevin.turner@danebank.nsw.edu.au&source=kevin.turner@danebank.nsw.edu.au
// !! ATN Once final approval has been submitted don't write any more approval/denials
function doGet(e) {
  // Log the workflow intiation except for status checks
  if (e.parameter.approve != "status") {
    try { 
      if (e.parameter.approvalSource == "undefined" || e.parameter.approvalSource == "") { cfl.logSheet("Approval workflow initiated , could not read initiating account",2); }
      else { cfl.logSheet("Approval workflow initiated from account " + e.parameter.approvalSource,1); }
    }
    catch(er1) { cfl.logSheet("Approval workflow initiated , could not read initiating account - " + er1,2); }
  }
  
  // Main process
  try {
    // Passed Paramaters into variables
    var approved = e.parameter.approve;
    var timestamp = e.parameter.recordID;
    var ssid = e.parameter.docID;
    var initiatorEmail = e.parameter.initID;
    var approvalSource = e.parameter.approvalSource;
    
    // Catch missing http get paramaters
    if (approved == "undefined" || timestamp == "undefined" || ssid == "undefined" || approvalSource == "undefined" || initiatorEmail == "undefined") { cfl.logSheet("Paramaters not passed correctly from approval email.",2); }
    else { timestamp = timestamp.replace("%20", " "); }
    
    // Spreadsheet variables
    var formCommsName = PropertiesService.getScriptProperties().getProperty('formCommsName');
    var ss2 = SpreadsheetApp.openById(ssid);
    var sheet = ss2.getActiveSheet();
    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    var sheetData = sheet.getDataRange().getDisplayValues();
    var approvalColumn = cfl.getWorkflowColumn(sheetData,"Approval 1",lastCol); // !!ATN APPROVAL PART WHEN PART 2 WHEN SOURCE != FINAL RECIPIENT THEN Approval 2 etc
    var approvalByColumn = cfl.getWorkflowColumn(sheetData,"Approval 1 By",lastCol);
    var approvalText = cfl.getApprovalAttribute(approved, "text");
    var approvalColour = cfl.getApprovalAttribute(approved, "colour");
    var approvalRow = cfl.getRowID(sheetData, timestamp, lastRow); // Find row of timestamp (the associated record ID for approval)
    if(approvalRow == "unknown") { cfl.logSheet("Could not find associated record for approval workflow.",2); } // Throw error to log if record not found
    
    // Return an HTML status page if the request is for a status update
    if (approved == "status") { 
      var workflowCol = cfl.getWorkflowColumn(sheetData, "Workflow Status", lastCol);
      var status = sheetData [approvalRow-1][workflowCol-1];
      var statusPage = cfl.getStatusPage(status, formCommsName);
      return HtmlService.createHtmlOutput(statusPage);
    } 
    
    // Write to Google Sheet and logs and return HTML thank you page
    sheet.getRange(approvalRow,approvalColumn).setValue(approvalText).setFontWeight("bold").setHorizontalAlignment("center").setFontColor(approvalColour); // Approval Cell
    sheet.getRange(approvalRow,approvalByColumn).setValue(approvalSource + " on " + new Date()).setFontWeight("normal").setHorizontalAlignment("left").setFontColor("gray").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP); // Approved By Cell
    cfl.logSheet("Approval workflow completed successfully from " + approvalSource + " with results: Approved: " + approved + " approvalRow: " + approvalRow,1);
    //return ContentService.createTextOutput("We found the ID: " + timestamp + " DocID: " + ssid + " Approved: " + approved + " approvalRow: " + approvalRow);
    return HtmlService.createHtmlOutput(cfl.getThankYouPage(approved, formCommsName));
  }
  catch(er2) {
    // Error Actions
    cfl.logSheet(er2,2);
    GmailApp.sendEmail(PropertiesService.getScriptProperties().getProperty('errorEmail'), "Error from form " + SpreadsheetApp.getActiveSpreadsheet().getName().replace(" (Responses)",""), er2 + " Log File https://docs.google.com/spreadsheets/d/" + cfl.getLogGID() + "/");
    return ContentService.createTextOutput(er2);
  }
}

function doPost(e) {
  // Deprecated - slightly more secure but most email clients don't support HTML form actions within emails making it fairly useless for email HTML form actions
  return ContentService.createTextOutput("Dang - Form action not permitted."); 
}

// Workflow function
// workflowStage null = simple, 2 = approval 1, 3 = approval 2
function SendWorkflowMail(e,workflowStage) {
  try {
    var workFlowType = PropertiesService.getScriptProperties().getProperty('workflowType');
    var workFlowStageName = cfl.getWorkflowStageName(workflowStage);
  } catch(er) {
    cfl.logSheet("Couldn't process workflow Stage",2);
  }
  try {
    cfl.logSheet("Intiating Form Email Workflow - " + workFlowStageName,1);
    // Form Variables
    var formName = SpreadsheetApp.getActiveSpreadsheet().getName();
    formName = formName.replace(" (Responses)","");
    var formCommsName = PropertiesService.getScriptProperties().getProperty('formCommsName');
    
    // Retrieve sheet data and set variables
    var sheet = SpreadsheetApp.getActiveSheet();
    var columns = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    var sheetData = sheet.getDataRange().getDisplayValues();
    var emailSentColumn = cfl.getWorkflowColumn(sheetData,"Email Sent",lastCol);
    var confEmailColumn = cfl.getWorkflowColumn(sheetData,"Confirmation Sent",lastCol);
    var workflowColumn = cfl.getWorkflowColumn(sheetData,"Workflow Status",lastCol);
 
    // !!ATN NEED IF STATEMENT FOR STAGE
    
    // Define email variables and pass form input into variables
    var messageHTML,  textbody, cc = "";
    var senderName = PropertiesService.getScriptProperties().getProperty('senderMask'); // This will show up as the automated email sender's name
    var initiatorEmail = e.namedValues["Email address"].toString(); // This is the submitter's email address
    var initiatorName;
    if(e.namedValues["First Name"].toString() == "" && e.namedValues["Surname"].toString() == "") { initiatorName = initiatorEmail; }
    else { initiatorName = e.namedValues["First Name"].toString() + " " + e.namedValues["Surname"].toString(); }
    var subject = formCommsName + " from " + initiatorName;
    var timestamp = e.namedValues["Timestamp"].toString();
    var pendingApprovalText = "", subjectApprovalText = "", headerApprovalText = "", bodyButtons = "", approvalClause = "", approvalStatusButton = ""; // Approval workflow variables, will remain blank unless approval workflow catch is triggered
    
    // Conditional area for recipients
    var recipient = "kevin.turner@danebank.nsw.edu.au";
    // cc = "email1@school.nsw.edu.au; email2@school.nsw.edu.au";
    
    // Approval Workflow trigger
    if (workFlowType > 1 ) {
      var rowID = timestamp;
      var targetFormID = SpreadsheetApp.getActiveSpreadsheet().getId(); // the GUID of the attached google sheet
      var webAppID = ScriptApp.getService().getUrl();
      var approvalArray = ["",""]; // extra varaibles can be sent to HTML email form if necessary
      bodyButtons = cfl.approvalGetButtons(rowID, targetFormID, webAppID, initiatorEmail, recipient, approvalArray);
      approvalStatusButton = cfl.approvalStatusButton(rowID, targetFormID, webAppID, initiatorEmail, initiatorEmail, approvalArray);
      pendingApprovalText = " - Pending Approval";
      subjectApprovalText = "Action Required - Approval - ";
      headerApprovalText = "<strong>Awaiting your approval</strong><br>";
      approvalClause = "<br>" + PropertiesService.getScriptProperties().getProperty('approvalClause');
    }
        
    // Variables to replace HTML email code blacks
    var headerBlock = headerApprovalText + formCommsName + " submitted by " + initiatorName;
    var bodyInit = "<div style=\"text-align: center; color: gray;\">The following " + formCommsName + " has been submitted:</div>";
    var bodyBlock = bodyInit + cfl.passFormDataToHTML(e,columns) + bodyButtons;
    var footerBlock = PropertiesService.getScriptProperties().getProperty('footerClause');
    cfl.logSheet("Processed form data from " + initiatorEmail,1);
    
    // Generate email HTML and text body
    var emailHTML = UrlFetchApp.fetch(cfl.getEmailTemplateURL(PropertiesService.getScriptProperties().getProperty('emailTemplate'))); // pass HTML object to local variable
    messageHTML = emailHTML.getContentText(); // Extract HTML code from object as text
    messageHTML = messageHTML.replace("HEADERBLOCK",headerBlock); // Replace the Header code block
    messageHTML = messageHTML.replace("BODYBLOCK",bodyBlock); // Replace the Body code block
    messageHTML = messageHTML.replace("FOOTERBLOCK",footerBlock); // Replace the Footer code block
    textbody = messageHTML.replace("<br>", "\n");  // Text version of email
 
    // Send the email via gmail app to the defined recipient email address, check for CC, write to google sheet
    if( cc == "" ) { 
      GmailApp.sendEmail(recipient, subjectApprovalText + subject, textbody, { name: senderName, htmlBody: messageHTML });
      sheet.getRange(lastRow,emailSentColumn).setValue("Submitted data sent to: " + recipient + " on " + new Date() + pendingApprovalText).setFontWeight("normal").setFontColor("gray").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      cfl.logSheet("Submission Email sent to " + recipient + pendingApprovalText,1);
    }
    else { 
      GmailApp.sendEmail(recipient, subjectApprovalText + subject, textbody, { cc: cc, name: senderName, htmlBody: messageHTML });
      sheet.getRange(lastRow,emailSentColumn).setValue("Submitted data sent to: " + recipient + ", cc: " + cc + " on " + new Date() + pendingApprovalText).setFontWeight("normal").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      cfl.logSheet("Submission Email sent to " + recipient + ", CC'd " + cc + pendingApprovalText,1);
    }   
    
    // Confirmation column and receipt email to form intiator
    subject = "Your " + formCommsName + " has been submitted" + pendingApprovalText;
    messageHTML = messageHTML.replace(headerBlock, "<label style=\"color: white;\">Submitted details - " + formCommsName + "</label>" + approvalStatusButton);
    messageHTML = messageHTML.replace(bodyBlock, cfl.genConfTable(formCommsName, approvalClause) + bodyBlock);
    messageHTML = messageHTML.replace(bodyInit, "");
    if (workFlowType > 1) { 
      messageHTML = messageHTML.replace(headerApprovalText, ""); // remove Awaiting Approval text
      messageHTML = messageHTML.replace(bodyButtons, ""); // remove Approval buttons
    }
    textbody = messageHTML.replace("<br>", "\n");
    GmailApp.sendEmail(initiatorEmail, subject, textbody, { name: senderName, htmlBody: messageHTML });
    sheet.getRange(lastRow,confEmailColumn).setValue("Receipt sent to: " + initiatorEmail + " on " + new Date()).setFontWeight("normal").setFontColor("gray");  
    cfl.logSheet("Confirmation Email sent to " + initiatorEmail,1);
    
    // !!ATN Need additional conditions for work stage and workflow type
    if (workFlowType > 1 ) { sheet.getRange(lastRow,workflowColumn).setValue(PropertiesService.getScriptProperties().getProperty('stage1Status')).setFontWeight("bold").setHorizontalAlignment("center").setFontColor("orange"); }
    else { sheet.getRange(lastRow,workflowColumn).setValue("Completed").setFontWeight("bold").setHorizontalAlignment("center").setFontColor("green"); }
    
    // !!ATN If final approval, need to send confirmation to initiator to say their x has been approved
    
    cfl.logSheet("Completed Form Email Workflow - " + workFlowStageName,1);
  } catch (er) {
    // Error Actions
    cfl.logSheet(er,2);
    GmailApp.sendEmail(PropertiesService.getScriptProperties().getProperty('errorEmail'), "Error from form " + SpreadsheetApp.getActiveSpreadsheet().getName().replace(" (Responses)",""), er + " Log File https://docs.google.com/spreadsheets/d/" + cfl.getLogGID() + "/");
    return ContentService.createTextOutput(er);
  }
}