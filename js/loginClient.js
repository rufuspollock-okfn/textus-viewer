/**
 * Wrapper around the remote service methods injected into the express app by login.js on the server
 * side. Handles updating the login model when users log in and out.
 */
define([ 'models' ], function(models) {

  var prefix = "api/";

  var noEmailMessage = "No email address provided.";

  var noPasswordMessage = "No password provided.";

  var loginClient = {

    /**
     * Determine whether there is a user logged in, passing the result of the call to the
     * callback and updating the login model as a side effect.
     */
    getCurrentUser : function(callback) {
      $.getJSON(prefix + "login/user", function(data) {
        if (data.success) {
          models.loginModel.set({
            loggedIn : true,
            user : data.user,
            init : true
          });
        } else {
          models.loginModel.set({
            loggedIn : false,
            user : null,
            init : true
          });
        }
        if (callback) {
          callback(data);
        }
      });
    }
  };

  return loginClient;

});
