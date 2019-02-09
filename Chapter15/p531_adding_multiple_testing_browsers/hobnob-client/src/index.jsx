import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs';

// const emailInput = React.createElement('input',{type :'email'});
// const passwordInput = React.createElement('input',{type:'password'});
// const registerBtn= React.createElement('button',null,'Register');
function register (email , digest){
    const payload ={email,digest};
    const request =new Request('http://localhost:8080/users',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        mode: 'cors',
        body: JSON.stringify(payload)
    })

    return fetch(request).then(
        response => {
            if(response.status === 200){
                return response,text();
            }else{
                throw new Error('Error crating new user');
            }
        }
    )
}
const validator = {
   email: (email) => /\S+@\S+\.\S+/.test(email),
   password: (password) => password.length > 11 && password.length < 48
}

function getIndicatorColor(state) { 
   if (state.valid ===null || state.value.length === 0){
        return  'transparent';
       
    }
    return state.valid ? 'green' : 'red';                
}

class Input extends React.Component {
    constructor(){
        super();
        this.state = {valid : null}
    }
    validate = (event) => {
        const value  = event.target.value;
        const valid  = validator[this.props.type](value);
        this.setState({ value , valid });
    }
    render () {
        return  (<label> 
        {this.props.label} 
        <input  id={this.props.type} type={this.props.type}  onChange={this.validate}            /> 
        <div  className="indicator" style={{height: "20px",width: "20px",backgroundColor: getIndicatorColor(this.state)}}></div>
        </label> )
    }
}
function Button(props) {
    return <button id={props.id} disabled={props.disabled}>{props.title}</button>
  }

class  RegistrationForm   extends React.Component {
    constructor(props){
        super(props);
        this.email=React.createRef();
        this.password =React.createRef();
    }

    handleRegistration = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const hasValidParams =this.email.current.state.valid && this.password.current.state.valid;
        if (!hasValidParams){
            console.error('Invalid Parameters');
            return ;
        }
        const email = this.email.current.state.value;
        const password = this.password.current.state.value;
        console.log(this.email.current);
        console.log(this.password.current);
        const digest = bcrypt.hashSync(password, 10);
        register(email, digest).then(console.log).catch(console.error);
    }
    render() {
        return (
        <form  onSubmit={this.handleRegistration}>
         <Input label="Email" id="email" type="email"  ref={this.email}/>
         <Input label="Password" id="password" type="password"   ref={this.password} />                 
         <Button title="Register" id="register-button"   />
        </form>
        )
    }                
};
// React.createElement('form',null,emailInput,passwordInput,registerBtn);
// ReactDOM.render(registrationForm , document.getElementById('renderTarget') );
// ReactDOM.render( React.createElement(RegistrationForm, null),  document.getElementById('renderTarget') );
ReactDOM.render( <RegistrationForm />,  document.getElementById('renderTarget') );