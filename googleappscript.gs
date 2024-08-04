// if you want to store your email server-side (hidden), uncomment the next line
var TO_ADDRESS = "some1@gmail.com, some12@gmail.com";

// sanitize content from the user - trust no one
function sanitizeInput(rawInput) {
   var placeholder = HtmlService.createHtmlOutput(" ");
   placeholder.appendUntrusted(rawInput);
   return placeholder.getContent();
}

// spit out all the keys/values from the form in HTML for email
// uses an array of keys if provided or the object to determine field order
function formatMailBody(obj, order) {
  var result = "";
  if (!order) {
    order = Object.keys(obj);
  }

  // loop over all keys in the ordered form data
  for (var idx in order) {
    var key = order[idx];
    result += "<h4 style='text-transform: capitalize; margin-bottom: 0'>" + key + "</h4><div>" + sanitizeInput(obj[key]) + "</div><br>";
    // for every key, concatenate an `<h4 />`/`<div />` pairing of the key name and its value,
    // and append it to the `result` string created at the start.
  }

  result += "<br><br>" + "<div>Please find the attachment of the Calender Event.</div>" + "<br>";
  result += "<div> Thank You, </div>";
  result += "<div> Vignesh & Sneha </div>";
  return result;
}

// function getAttachments(events) {
//   var files_to_get = ["main.ics"];
//   var attachments = [];

//   if (events.includes('Haldi and Mehendi - Sneha') || events.includes('Haldi & Mehendi - Vignesh')) {
//     files_to_get.push("haldi.ics");
//   }

//   if (events.includes('Sangeet')) {
//     files_to_get.push("sangeet.ics");
//   }

//   if (events.includes('Lunch')) {
//     files_to_get.push("lunch.ics");
//   }

//   for (i = 0; i < files_to_get.length; i++) {
//     var files = DriveApp.getFilesByName(files_to_get[i]);
//     while (files.hasNext()) {
//       var file = files.next();
//       attachments.push(file.getAs('text/calendar'));
//       Logger.log(file.getId());
//     }
//   }

//   Logger.log(attachments);
//   return attachments;
// }

function generateICSBlob(events, name, email) {

  var mainString = `
BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Sneha & Vignesh Tie the Knot
X-WR-TIMEZONE:Asia/Kolkata
X-WR-CALDESC:Sneha & Vignesh Tie the Knot Calender
BEGIN:VEVENT
DTSTART:20241208T023000Z
DTEND:20241208T093000Z
DTSTAMP:20240803T143217Z
UID:${Utilities.getUuid()}
CREATED:20240803T143025Z
LAST-MODIFIED:20240803T143038Z
LOCATION:Bengaluru\, Karnataka\, India
STATUS:CONFIRMED
SUMMARY:Sneha & Vignesh Tie the Knot: Muhurtham
ORGANIZER;CN=Vignesh & Sneha:
ATTENDEE;CN=${name};MAILTO:${email}:
END:VEVENT
BEGIN:VEVENT
DTSTART:20241207T133000Z
DTEND:20241207T173000Z
DTSTAMP:20240803T143217Z
UID:${Utilities.getUuid()}
CREATED:20240803T142718Z
LAST-MODIFIED:20240803T143120Z
LOCATION:Bengaluru\, Karnataka\, India
STATUS:CONFIRMED
SUMMARY:Sneha & Vignesh Tie the Knot: Reception
ORGANIZER;CN=Vignesh & Sneha:
ATTENDEE;CN=${name};MAILTO:${email}:
END:VEVENT`;

  var haldiString = `
BEGIN:VEVENT
DTSTART:20241206T103000Z
DTEND:20241206T143000Z
DTSTAMP:20240803T144831Z
UID:${Utilities.getUuid()}
CREATED:20240803T144815Z
LAST-MODIFIED:20240803T144815Z
LOCATION:Bengaluru\, Karnataka\, India
STATUS:CONFIRMED
SUMMARY:Sneha & Vignesh Tie the Knot: Haldi
ORGANIZER;CN=Vignesh & Sneha:
ATTENDEE;CN=${name};MAILTO:${email}:
END:VEVENT`;

  var sangeetString = `
BEGIN:VEVENT
DTSTART:20241207T103000Z
DTEND:20241207T123000Z
DTSTAMP:20240803T144630Z
UID:${Utilities.getUuid()}
CREATED:20240803T144613Z
LAST-MODIFIED:20240803T144613Z
LOCATION:Bengaluru\, Karnataka\, India
STATUS:CONFIRMED
SUMMARY:Sneha & Vignesh Tie the Knot: Sangeet
ORGANIZER;CN=Vignesh & Sneha:
ATTENDEE;CN=${name};MAILTO:${email}:
END:VEVENT`;

  var lunchString = `
BEGIN:VEVENT
DTSTART:20241215T053000Z
DTEND:20241215T093000Z
DTSTAMP:20240803T143616Z
UID:${Utilities.getUuid()}
CREATED:20240803T143600Z
LAST-MODIFIED:20240803T143600Z
LOCATION:Bengaluru\, Karnataka\, India
STATUS:CONFIRMED
SUMMARY:Sneha & Vignesh Tie the Knot: Lunch
ORGANIZER;CN=Vignesh & Sneha:
ATTENDEE;CN=${name};MAILTO:${email}:
END:VEVENT`;

  var endString = `
END:VCALENDAR`;

  var eventString = "";
  eventString += mainString;
  if (events.includes('Haldi and Mehendi - Sneha') || events.includes('Haldi & Mehendi - Vignesh')) {
    eventString += haldiString;
  }

  if(events.includes('Sangeet')) {
    eventString += sangeetString;
  }

  if (events.includes('Lunch')) {
    eventString += lunchString;
  }

  eventString += endString;

  Logger.log(eventString);
  return Utilities.newBlob(eventString, 'text/calendar', 'event.ics');
}

function doPost(e) {
  try {
    Logger.log(e);
    record_data(e)

    // shorter name for form data
    var mailData = e.parameters;
    var orderParameter = e.parameters.formDataNameOrder;
    var dataOrder;
    if (orderParameter) {
      dataOrder = JSON.parse(orderParameter);
    }

    var calenderEvents = [generateICSBlob(e.parameters.Events[0], e.parameters.Name, e.parameters.Email)];

    MailApp.sendEmail({
      to: String(mailData.Email),
      cc: String(TO_ADDRESS),
      subject: "Sneha & Vignesh tie the Knot. RSVP Confirmation",
      htmlBody: formatMailBody(mailData, dataOrder),
      attachments: calenderEvents
    });

    return ContentService
          .createTextOutput(
            JSON.stringify({"result":"success",
                            "data": JSON.stringify(mailData) }))

  } catch (error) {
    Logger.log(error);
    return ContentService
          .createTextOutput(JSON.stringify({"result":"error", "error": error}))
          .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * record_data inserts the data received from the html form submission
 * e is the data received from the POST
 */
function record_data(e) {
  var lock = LockService.getDocumentLock();
  lock.waitLock(30000); // hold off up to 30 sec to avoid concurrent writing

  try {
    Logger.log(JSON.stringify(e)); // log the POST data in case we need to debug it

    // select the 'responses' sheet by default
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameters.formGoogleSheetName || "responses";
    var sheet = doc.getSheetByName(sheetName);

    var oldHeader = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newHeader = oldHeader.slice();
    var fieldsFromForm = getDataColumns(e.parameters);
    var row = [new Date()]; // first element in the row should always be a timestamp

    // loop through the header columns
    for (var i = 1; i < oldHeader.length; i++) { // start at 1 to avoid Timestamp column
      var field = oldHeader[i];
      var output = getFieldFromData(field, e.parameters);
      row.push(output);

      // mark as stored by removing from form fields
      var formIndex = fieldsFromForm.indexOf(field);
      if (formIndex > -1) {
        fieldsFromForm.splice(formIndex, 1);
      }
    }

    // set any new fields in our form
    for (var i = 0; i < fieldsFromForm.length; i++) {
      var field = fieldsFromForm[i];
      var output = getFieldFromData(field, e.parameters);
      row.push(output);
      newHeader.push(field);
    }

    // more efficient to set values as [][] array than individually
    var nextRow = sheet.getLastRow() + 1; // get next row
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // update header row with any new data
    if (newHeader.length > oldHeader.length) {
      sheet.getRange(1, 1, 1, newHeader.length).setValues([newHeader]);
    }
  }
  catch(error) {
    Logger.log(error);
  }
  finally {
    lock.releaseLock();
    return;
  }

}

function getDataColumns(data) {
  return Object.keys(data).filter(function(column) {
    return !(column === 'formDataNameOrder' || column === 'formGoogleSheetName' || column === 'formGoogleSendEmail' || column === 'honeypot');
  });
}

function getFieldFromData(field, data) {
  var values = data[field] || '';
  var output = values.join ? values.join(', ') : values;
  return output;
}
