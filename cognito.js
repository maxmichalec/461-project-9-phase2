const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
    //PLACEHOLDER
});

const CognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;
const client = new CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

//Auth Flows
let params = {
    ClientId: 'your_cognito_app_client_id',
    Username: 'username',
    Password: 'userpassword',
    UserAttributes: [
        {
            Name: 'email',
            Value: 'user@example.com'
        },
        // other attributes
    ]
};

client.signUp(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});


//User Auth
let params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: 'your_cognito_app_client_id',
    AuthParameters: {
        'USERNAME': 'username',
        'PASSWORD': 'userpassword'
    }
};

client.initiateAuth(params, function(err, authData) {
    if (err) {
        // handle error
    } else {
        // successful response
        console.log(authData);
    }
});
