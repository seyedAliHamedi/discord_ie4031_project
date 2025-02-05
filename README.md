# Voice Channels Application

## Features
- Create users

![Alt text](/pictures/Sign%20Up.JPG)
- Create voice channels

![Alt text](/pictures/channel%20creation.JPG)
- Join and leave channels

![Alt text](/pictures/multiple%20channels.JPG)
- Speaking status indication

![Alt text](/pictures/user%20talking.JPG)
- Listing members of a channel

![Alt text](/pictures/members%20list%20of%20a%20channel.JPG)
- Channel owner can delete owned channeles and mute/unmute members

![Alt text](/pictures/channel%20owener%20powers.JPG)

## Prerequisites
- Node.js (v14 or later)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/seyedAliHamedi/discord_ie4031_project
```
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node .\app.js
```

## Usage

1. Open http://[localhost](http://127.0.0.1:3000/):3000 in your web browser
2. Enter a username to create a user
3. Create or join channels
4. Interact with voice channels

## Socket Events

### Client-to-Server Events
- create-user: Create a new user
- create-channel: Create a new channel
- join-channel: Join a specific channel
- leave-channel: Leave current channel
- speaking: Update speaking status
- mute-user: Mute
- unmute-user: Unmute

### Server-to-Client Events
- user-created: User successfully created
- channel-created: New channel created
- channel-joined: Successfully joined a channel
- user-joined: New user joined the channel
- user-left: User left the channel
- user-speaking: User's speaking status changed
- user-muted: User has been muted
- user-unmuted: User has been unmuted

## Project Structure
- app.js: Main server configuration
- models/: Data models for Users and Channels
- socket.js: Socket.io connection management
- public/: Client-side files

## Technologies
- Express.js
- Socket.io
- UUID for unique identifiers
`