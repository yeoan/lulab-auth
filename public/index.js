
function handleSignUp(){
  validateInput();
}

function validateInput(){
  var email = document.getElementById('Enter_the_Form_Element_for_Email_field').value;
  var password = document.getElementById('Enter_the_Form_Element_for_Password_field').value;
  console.log(validate.single(email, {presence: true, email: true}));
}
