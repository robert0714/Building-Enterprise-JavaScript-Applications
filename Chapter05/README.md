# Using the Visual Studio Code debugger

page 138

* https://code.visualstudio.com/docs/editor/debugging
* https://code.visualstudio.com/docs/introvideos/debugging
* https://code.visualstudio.com/docs/nodejs/nodejs-debugging

You may also use the debugger statement, which has exactly the same effect as setting a breakpoint. The only difference is that the debugger statement would now be part of the code, which is usually not what you want:

```javascript
const requestHandler = function (req, res) {
   debugger;
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Hello, World!');
}
```

After you've set the breakpoint, go to the Debugger tab in your editor. Click the Start Debugging button (usually this looks like the "Play" button: ►);

The debugger throws an error because it doesn't recognize the ES6 modules' import syntax. 
This is because we are running the debugger on the source file directly,
instead of the compiled file produced by Babel. 
To instruct VSCode to process modules, we can do one of two things:

* Install the @babel/node package and instruct VSCode to execute our file
using babel-node .
* Instruct VSCode to add the --experimental-modules flag when running
Node. This has been supported since Node v8.5.0.

To do either of these, we need to add configurations to the VSCode debugger.
Configurations in VSCode are defined as JSON objects inside a launch.json ( .vscode/launch.json ) file. To edit the launch.json file, click the cogwheel button ( ) near the top. Then, paste in the following JSON object, which will provide us with both configurations mentioned before, as well as an option to run the program as normal:


```javascript
{
  "version": "0.2.0",
  "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Node",
        "program": "${file}",
        "protocol": "inspector"
       },
       {
           "name": "Babel Node",
           "type": "node",
           "request": "launch",
           "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/babel-node",
           "runtimeArgs":
            ["--presets","@babel/env"],
            "program": "${file}",
            "protocol": "inspector"
        },
        {
            "name": "Node with Experimental Modules",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "~/.nvm/versions/node/v8.15.0/bin/node",
            "runtimeArgs": ["--experimental-modules"],
            "program": "${file}",
            "protocol": "inspector"
        }],
        "compounds": []
        }
```

Now, also remember to install the @babel/node package as a development dependency:

```bash
yarn add @babel/node --dev
```

## Retaining line numbers

To use babel-node with the VSCode debugger, we also need to enable the retainLines option in Babel, which retains the line numbers between the source
code and the built files. If we don't do this, VSCode's debugger would set the
breakpoints at the incorrect lines.

However, we only want to retain lines when debugging our code; when we are
building our application, we want it to be formatted sensibly. To do this, we can update our .babelrc to apply the retainLines option only when the BABEL_ENV environment variable is set to "debug" :

```json
{  
   "presets":[  
      [  
         "@babel/preset-env",
         {  
            "targets":{  
               "node":"current"
            }
         }
      ]
   ],
   "env":{  
      "debug":{  
         "retainLines":true
      }
   }
}
```

Then, open up the launch.json file again and add the following to the Babel Node configuration:

```json
{  
    "name": "Babel Node",
    "type": "node",
    ...
    ...
    "protocol": "inspector",
    "env": {
    "BABEL_ENV": "debug"
    }
}
```

## Examining the req object

page 142 

Now, stop your API server (if you're running it), go back to src/index.js , open up the Debug panel, select one of the two configurations we just defined, and click the Start Debugging button (►). This time, you should see it succeed:


In a new tab, navigate to localhost:8080 . This time, you won't see our Hello,
World! text; this is because our server hasn't provided a response yet! Instead, it has paused at the breakpoint we set.

On the left-hand side, we can see a tab called VARIABLES, and here we can see all the local, closure, and global variables available at our breakpoint. When we expand the req variable, we'll find the method and url properties, which are exactly what we need:

## Asserting the correct response payload
page 146 

```bash
docker-compose up -d
yarn run test:e2e
```
