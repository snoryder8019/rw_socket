#Pay Attention to the peril that is this directory. 
##SPA's are tricky, especially when writting all in javascript in a single codebase.  
###ROUTES.js VIEWS.ejs PUBLIC.js PLUGINS.js INLINES.js
There are many instances where i am juggling all 5 for one module. 

##This directory is indexd. The ejs '-include' statement is the best way to control vanilla js.

##Easily build vanilla js to the UI Here! Your module, listener, or utility js will run, but DOMContentLoaded does nothing without executing an interscecting observer to the dom eleement. 

###One Problem: you cannot comment ejs with < ! - - COMMENT FOR HTML- - >, your tags still run at compile.Also, you can't easily / / comment  inside your < % ejs tags %  > without catching a "% >" tag somewhere at ejs view engine compile. 

###NOTICE: If you plan on keeping the vanilla js files, delete the line with the "-include" completely, and replace it with the note of what was removed. 