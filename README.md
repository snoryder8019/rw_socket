Royal World Socket: A Multi-Chatroom Web Application

Release Date: 04-04-2024
Developer: Scott Wallace
Website: https://royal.w2marketing.biz
Overview

Royal World Socket is a cutting-edge chat-based web application tailored for Royal Splendor. It prioritizes providing users with diverse, multi-chatroom options based on permission and club levels. Each chatroom, central to our Single Page Application (SPA), aims for seamless communication and engagement.
Key Features

    Multi-Chatrooms: Initially controlled by admins via CRUD operations. Future updates (V2) will introduce user-created and custom rooms.
    Video Integration: Essential for certain chatrooms, integrating technologies like Zoom API, socket.io, or WebSocketGL. V1 focuses on video broadcasts from selected delegates.
    Exclusivity: Services are available to paid clients only, with enticing non-authenticated previews to encourage membership.
    Customization: Post-launch, we will introduce seasonal avatar and chat room customizations, supported by microtransactions.
    Gaming Module: Incorporates games like bingo and dominoes using technologies like Three.js, Blender, and Vue/Vite. A nod to classic text-based gaming with limited animations.
    E-commerce Integration: Utilizes Shopify API for inventory and sales, integrating a jewel wallet for in-app credits and transactions.

Development and Architecture

    Scalability: The codebase is designed for modular refactoring to enhance microservices and UI scalability, including load balancing.
    Authentication: Utilizes Passport.js for authentication, with Google Cloud Console for additional support. Sessions are managed through MongoDB.
    Front-End: Utilizes EJS for templating, with a plan to transition messy vanilla JS to Vue/Vite for improved state and UI management.
    3D Modeling: Three.js and Blender for 3D scenes, with CannonJs or AmmoJs for physics. Socket.io manages event listeners and game state logic.
    Future Plans: Incorporation of JWT for authentication, potential microservice expansion in areas like notifications and game server management.

Deployment and Versioning

    Current State: The application includes a deployment batch script, with ongoing efforts towards containerization and automated deployment.
    Version Notes: This documentation refers to V1. Future versions will focus on expanding user engagement, customization, and gaming features.

Acknowledgments

Developed by Scott Wallace for Royal Splendor, this application seeks to revolutionize how users engage in chat and gaming online. We look forward to evolving this platform with community feedback and technological advancements.


Blog and Travel Clubs Integration
Blog

A dedicated blog section will be integrated to keep users informed, engaged, and connected with the latest updates, news, and insights about Royal World Socket and its community. This platform will serve as a key tool for:

    Announcements: New features, updates, and future plans for the web application.
    Guides: How-to articles and tutorials on using the application effectively.
    Community Spotlights: Highlighting active members, success stories, and user-generated content.
    Engagement: Encouraging user interaction through comments, shares, and feedback.

Travel Clubs

Travel clubs will be introduced as a premium feature, offering members exclusive access to:

    Group Chats: Dedicated chatrooms for travel enthusiasts to share experiences, tips, and plans.
    Events: Organizing meet-ups, tours, and group travel opportunities.
    Deals and Discounts: Partnering with travel agencies and service providers to offer special rates to our community.
    Shared Itineraries: Users can create and share travel plans, reviews, and recommendations.

Implementation Strategy

    Content Creation: Develop a content calendar for the blog to ensure regular, engaging posts. Collaborate with travel experts and community members for diverse perspectives.
    Community Building: Leverage chatrooms and social media to promote the blog and travel clubs, encouraging user participation and feedback.
    Partnerships: Establish partnerships with travel agencies, hospitality brands, and local businesses to enhance the value of travel clubs.
    Technology Integration: Seamlessly integrate these features into the Royal World Socket platform, ensuring user-friendly navigation and interaction.

Conclusion

Adding a blog and travel clubs not only enriches the Royal World Socket ecosystem but also fosters a stronger, more engaged community. Through these platforms, users can share experiences, gain insights, and enjoy exclusive benefits, reinforcing the application’s position as a leader in online chat and social engagement
