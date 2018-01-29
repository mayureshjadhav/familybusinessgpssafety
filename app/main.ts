// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";

import { AppModule } from "./app.module";

// import * as LocalNotifications from "nativescript-local-notifications";

// import * as app from "application";

// app.on(app.resumeEvent, (args: app.ApplicationEventData) => {
//     if (args.android) {

//         const act = args.android;
//         const intent = act.getIntent();
//         const extras = intent.getExtras();
//         if (extras) {
//             console.log("If your notification has data (key: value) pairs, they will be listed here:");
//             const keys = extras.keySet();
//             const iterator = keys.iterator();
//             while (iterator.hasNext()) {
//                 const key = iterator.next();
//                 console.log(key + ": " + extras.get(key).toString());
//             }

//             LocalNotifications.requestPermission().then((granted) => {
//                 if (granted) {

//                     LocalNotifications.schedule([{
//                         id: 1,
//                         title: 'Interest Point Added',
//                         body: " is added",
//                         ticker: 'The ticker',
//                         badge: 1,
//                         // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
//                         // groupSummary:"Summary of the grouped messages above", //android only
//                         ongoing: true, // makes the notification ongoing (Android only)
//                         // smallIcon: 'res://heart',
//                         // interval: 'minute',
//                         // sound: "customsound-ios.wav", // falls back to the default sound on Android
//                         at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
//                     }]).then(
//                         () => {
//                             console.log("Notification scheduled");
//                         },
//                         (error) => {
//                             console.log("scheduling error: " + error);
//                         }
//                         );
//                 }
//             });
//         }
      
//     }
// });

// A traditional NativeScript application starts by initializing global objects, setting up global CSS rules, creating, and navigating to the main page. 
// Angular applications need to take care of their own initialization: modules, components, directives, routes, DI providers. 
// A NativeScript Angular app needs to make both paradigms work together, so we provide a wrapper platform object, platformNativeScriptDynamic, 
// that sets up a NativeScript application and can bootstrap the Angular framework.
platformNativeScriptDynamic().bootstrapModule(AppModule);
