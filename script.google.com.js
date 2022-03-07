const BATCH_SIZE = 100;
const ARCHIVE_DAYS_TYPES = [1, 2, 3, 7];

function gmailAutoArchive() {
  ARCHIVE_DAYS_TYPES.forEach(numDays => gmailAutoarchiveHelper(numDays));
}

function gmailAutoarchiveHelper(numDays) {
  const labelName = "autoarchive-" + numDays;
  Logger.log(`Running archiver for numDays: ${numDays}`);
  const delayDays = numDays; // will only impact emails more than numDays days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - delayDays); // what was the date at that time?

  const label = GmailApp.getUserLabelByName(labelName);
  if (label == null || label == undefined) return -1;
  Logger.log('Found label: %s', label.getName());

  // Only include threads older than the limit we set in delayDays
  // let threads = label.getThreads(0, 500).filter(thread => thread.getLastMessageDate() < maxDate && thread.isInInbox());
  let threads = label.getThreads(0, 500).filter(thread => thread.getLastMessageDate() < maxDate);

  Logger.log(`Found ${threads.length} emails.`);

  while (threads.length) {
    const this_batch_size = Math.min(threads.length, BATCH_SIZE);
    let this_batch = threads.splice(0, this_batch_size);

    // remove label 'autoarchive' to speed up this script on the next runs
    this_batch.forEach(thread => thread.removeLabel(label)); 

    GmailApp.markThreadsRead(this_batch);
    GmailApp.moveThreadsToArchive(this_batch);
  }
}
