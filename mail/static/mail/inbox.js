document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
  //form submit
  document.querySelector('form').onsubmit = submit_compose;

  

  
  
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email_details').style.display ='none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.getElementById('replyTitle').innerHTML = 'New Email';
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email_details').style.display ='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    //get all the emails
    emails.forEach(email => show_emails(email,mailbox));

  });
}

function show_emails(email,mailbox){

  //this is a container for 1 email
  const container = document.createElement('div');
  container.className = 'rows-email';

  // this is the sender/recepient 
  const person = document.createElement('div');
  person.className = 'col email-sender';
  if(mailbox !== 'sent'){
    person.innerHTML = email.sender;
  }else{
    person.innerHTML = email.recipients[0];
  }
  container.append(person);

  //this is the subject of the email
  const subject = document.createElement('div');
  subject.className = 'col email-subject';
  subject.innerHTML = email.subject;
  container.append(subject);

  //this is the timestamp of the email
  const time = document.createElement('div');
  time.id = 'timestamp';
  time.className ='col email-time';
  time.innerHTML = email.timestamp;
  container.append(time);

  const backdiv = document.createElement('div');
  if(email.read){ 
    container.className = 'read-email';
  }else{
    container.className = 'rows-email';
  }
  backdiv.append(container);
  //icons for archive and mark read in inbox
  if (mailbox !== 'sent'){
    const archivedImage = document.createElement('img');
    archivedImage.className='icons archivedButton';
    archivedImage.src ="static/mail/images/achived.png";
    // archivedImage.style.display = 'none';
    container.append(archivedImage);
    archivedImage.addEventListener('click',() => archived_email(email.id,email.archived));
    
  }
  //this is the read/unread icon
  const readImage = document.createElement('img');
  readImage.className='icons readButton';
  readImage.src ="static/mail/images/read_mail.png";
  // readImage.style.display = 'none';
  readImage.addEventListener('click',() => mark_as_read(email.id,email.read));
  container.append(readImage);
  
  // container.addEventListener('mouseover',() =>mouseOver(email.id));
  // container.addEventListener('mouseout',() =>mouseOut(email.id));
  time.addEventListener('click',() => show_email_details(email.id,mailbox));
  subject.addEventListener('click',() => show_email_details(email.id,mailbox));
  person.addEventListener('click',() => show_email_details(email.id,mailbox));
  // this is to append all the div in the html
  //basically this is the div for all the emails
  document.querySelector('#emails-view').append(container);
  
  
}
//mark as read for icon button
function mark_as_read(email_id,email_read){
  const new_read = !email_read;
  console.log(`Email read = ${new_read}`)
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({
        read: new_read
    })
  })
  //reload the page
  window.location.reload();
}
//when email is open
function open_email_read(email_id){
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({
        read: true
    })
  })
}


function show_email_details(email_id,mailbox){
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email_details').style.display ='block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      open_email_read(email_id);
      document.querySelector('#email_subject').innerHTML = email.subject;
      document.querySelector('#email_time').innerHTML = email.timestamp;
      document.querySelector('#email_sender').innerHTML = email.sender;
      document.querySelector('#email_recipients').innerHTML = email.recipients;
      document.querySelector('#email_body').innerHTML = email.body;
      console.log(mailbox);
      
      //archive button inside the emmail
      if(mailbox ==='archive'){
        
        document.getElementById('email_archived').innerHTML = 'Unarchived';
      }else{
        console.log(mailbox);
        document.getElementById('email_archived').innerHTML = 'Archived';
      }
      //archived button outside the email
      document.getElementById('email_archived').addEventListener('click', () => archived_email(email.id,email.archived));
      //reply button
      document.getElementById('email_reply').addEventListener('click', () => compose_reply(email));

  });
}

function compose_reply(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email_details').style.display ='none';

  document.getElementById('replyTitle').innerHTML = 'Reply Email';
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-recipients').disabled = true;

  if(email.subject.indexOf("Re: ")===-1){
    email.subject = "Re: " + email.subject;
  }
  
  document.querySelector('#compose-subject').value = email.subject;
  document.querySelector('#compose-subject').disabled = true;
  document.querySelector('#compose-body').value =`Reply: \n \n \n On ${email.timestamp} ${email.sender} wrote:\n -"${email.body}"`;
}

function archived_email(email_id,email_archived){
  //this means that if the email_archived is false then it is in the inbox
  //else it is in the archive which means it will change the value to switch places/ or to transfer the email
  //whenever the user wants.
  const new_archived = !email_archived;
  console.log(`Email Successfull transfer in archived ${new_archived}`)
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({
        archived: new_archived
    })
  })
  //reload the page
  window.location.reload();
  //then go to inbox page
  load_mailbox('inbox');
  
}

  


// function mouseOver(email_id){
//   console.log('over');
//   document.querySelector('.icons').style.display = 'block';
// }
// function mouseOut(email_id){
//   console.log('out');
//   document.querySelector('.icons').style.display = 'none';
// }


//this is the fuction to submit the compose email
function submit_compose(){
  //to get the value from the input elemet id in the form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value
  
  fetch(`/emails`, {
    method: 'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      if(result.error){
        console.log(result);
      }
      else{
        load_mailbox('sent');
      }
  });
  return false;
}

