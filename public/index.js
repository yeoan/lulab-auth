


function handleSignUp(){
  let email = document.getElementById('Enter_the_Form_Element_for_Email_field').value;
  let password = document.getElementById('Enter_the_Form_Element_for_Password_field').value;
  let confirmPassword = document.getElementById('Enter_the_Form_Element_for_Password_check_field').value;
  let username = document.getElementById('Enter_the_Form_Element_for_Username_field').value;
  let constraints = {
  confirmPassword: {
    equality: "password"
  }
};
  if(password===confirmPassword){
    signUp(username,email,password,confirmPassword);
  }else{
    alert('密碼不同')
  }
}

function signUp(uname,email,pass,pass2){
  console.log(uname);
  console.log(email);
  console.log(pass);
  console.log(pass2);
  axios.post('http://127.0.0.1:3000/register', {
    username: uname,
    email: email,
    password: pass,
    comfirmPassword: pass2
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}
