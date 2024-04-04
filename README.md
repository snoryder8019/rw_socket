A quick summary spewed out on 04-04-2024 :

This codebase was developed by Scott Wallace. https://royal.w2marketing.biz

Royal World Socket is a chat based web application developed for Royal Splendor. 
The core of this application should serve its visitors multi chatroom options, permission and club level based, chat should the first consideration in any module developed in this SPA.
Chat rooms upon deployment will be controled and created via CRUD in the admin panel. V2 will look into user based and custom rooms.
Video is mandatorty. Some chat rooms may nned to render video for our users this is a flashpoint between Zoom api, socket-io, or websocketGL. V1 will only need to broadcast video from a few deligates of the owner of this app.

All clients will be paid clients, there are no free permissions other than non auth copy to promote a membership.
Avatars and Chat Room customizations will available as seasons progress after launch, and yup we will micro tranact customizations to the UX. Design and 3d models will be manual until a V2. 
I hope to create an interface to exand on custom creation community for chat and gaming parlotr. 


GAMING threeJS blender vue/vite a module within the webapp which will be our portal to bingo and dominoes.
Archaic Text Based Gaming method, where we can attach game state and logic to a very very limitied collection of aniamtions. 


ECOMMERCE will manage via shoppify api and a jewel wallet will credit within the web app using shoppifys webhooks. This is the prefered inventory and ecom for our Client.

This codebase should be refactored and moularized to scale up the microservices, and scale the UI horizontally via node balnacer. 
I have a deploymane bat of this code prepared, and am tracking updates for containerization and auto deploy options moving forward.
Authentication via Passport.js, google cloud console.
Local password managed and serialized user via passport. 
Mongo sessions hold session's key metadata.
socket_io requests the user object to emit to to clients effectively pulling thumbnails to broadcast or changing the class in the DOM.
This iteration of chat will refactor to modularize changing chat rooms and theoir specific capabilities.
all front end is leveraged using .ejs as a templating engine while vanilla js handles the UI very messily ATM.
Ultimately threeJS plays nicely with blender for scene, modeling, and rigging of 3d objects. CannonJs or AmmoJs for physics, socketio controls event listeneers, and Game State Logics are handled on the webapp server
Implimentation of VUE/VITE will be necesarry to scale state and UI management and maintain imports and ultimately move away from require. JWT will handle auth if sessions bears too much weight.
possible microserviced AUTH, CHAT, NOTIFICATIONS, GAME_SERVER_IO
all design is using css and a SASS compiler from scss
