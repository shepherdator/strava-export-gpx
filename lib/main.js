exports.main = function(options, callbacks)  {

	var FF = {};

	FF.data = require("sdk/self").data;

    require("sdk/page-mod").PageMod({
      	include: "*.strava.com",

      	attachTo: ["existing", "top", "frame"],

      	contentScriptFile : [
      		FF.data.url("includes/jquery-3.2.1.min.js"),
      		FF.data.url("includes/main.js")
        ],

        contentStyleFile : [
        ],

        contentScriptWhen : 'end',

        onAttach : function(worker) {
        }
    });
};
