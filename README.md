# 1. Fundamentals

## Introduction

In this guide, we will cover briefly: what are websockets, how much they differ from HTTP protocol, when they are useful, and a little explanation about how http protocols works. Also, providing example code we hope to acheive a better understanding of this content.

-------------------------------------------------------

## Understanding HTTP protocol

#### What is HTTP protocol?

Fundamentally, HTTP is a communication protocol that enables clients (such as a web browser) and servers to share information.

For example, HTML documents, images, application data (JSON), and more.

## How it works?

When a client does a request, the server sends a response that includes not only the requested content, but also relevant information about the request.

Is important to keep in mind that **after server returns this response to client, the connection between the two ones is closed**.
![alt text](https://images.ctfassets.net/ee3ypdtck0rk/1kp3L78PA3GizIQ9P8fPFZ/8fc93fc45005d6d0122c08f00d64873f/http-request-response-cycle.png?w=1841&h=653&q=50&fm=webp)


## It is possible to make a realtime connection only with HTTP?

Short answer: Yes, but is complicated.

This pattern, where the client makes a request and the server issues a response, works well for static resources like web pages, files, or application data.

However, consider a scenario where the **client doesn’t know when new information will become available.**

Let's think we are implementing a new feature for a newsletter website. We need this updates to happen in realtime. In this case, the client has no idea when the next update in the story is going to break.

Now, you _could_ code the client to make HTTP requests at a frequent interval just in case something happens and, for a handful of clients, that might work well enough.

But suppose you have hundreds or thousands of clients making requests to the server that yield nothing new between updates.

Not only is this a waste of bandwidth and server resources, but say the update breaks moments after the most recent request finished - it could be several seconds before the next request is sent and the user gets an update. This approach is called HTTP Polling and it's not as efficient as you can see.

There are other possibles solutions like HTTP Streaming, but all those have serious drawbacks to consider.


-----------------------------------------------------------------------

## Websockets

#### What are WebSockets?

Like HTTP, [WebSockets](https://ably.com/topic/websockets) is a communication protocol that enables clients  and servers to communicate with one another

Unlike HTTP with its request-response model, WebSockets are specifically designed to enable realtime bidirectional communication between the server and client. 

#### What are they used for?

They are used to **create communication in realtime.** This means the server can push realtime updates as soon as they become available without waiting for the client to issue a request.

What’s more, WebSockets is a full-duplex protocol. 

In simple terms, this means data can flow in both directions over the same connection simultaneously, making WebSockets the go-to choice for applications where the client and server are equally “chatty” and require high throughput. We’re talking about things like chat, collaborative editing, and more.


-----------------------------------------------------------------------

## HTTP or Websockets?

So far, looks great, but, which are the benefits of Websockets and HTTP?

Well, there are certains cases where Websockets are better than traditional HTTP protocol:

1. **Realtime updates:** When a client needs to be notified when new information becomes available, WebSockets are generally a good fit. 
    
2. **Bidirectional communication:** WebSockets provide low latency bidirectional communication, allowing instant data transfer between the client and server. Unlike HTTP, which requires a new request for every server response, WebSockets maintain a persistent connection, making them ideal for realtime applications like chat, gaming, and live updates.
    
3. **Low latency updates:** WebSockets have less overhead compared to HTTP, as they don't require the headers and handshakes for each request-response cycle. This efficiency leads to lower data transfer costs and improved performance for realtime situations.


But as you can imagine, Websockets are not used in the majority of apps. The reason for this, is because HTTP protocol it is still useful in various scenarios.

For example. Through HTTP **we can create cacheable resources**, something that is unavailable in websockets.

**When we are implementing a REST API**, HTTP methods such as POST, GET, and UPDATE align perfect with REST principles.

Also, the request-response pattern is well-suited to operations that require synchronization or need to execute in a specific order. This is because HTTP requests are always accompanied by a response that tells you the result of the operation (be that “200 OK” or not). By comparison, WebSockets offer no guarantee that a message will be acknowledged in any form out of the box.

Finally, **HTTP is ubiquitous and widely-supported**. In increasingly rare situations, misconfigured our outdated enterprise firewalls can interfere with the WebSocket upgrade handshake, preventing a connection from being established. In such cases, a fallback to HTTP streaming or long polling is required.


You will see in a second that implementing Websockets is much more simple than you can expect.


----------------------------------------------------------------------------------------

# 2. Implementing Socket.IO

## Creating a server with Node.js
### Initializing 

First, let's begin creating a basic server with `http` module provided by Node.js.

So, after initializing a node.js project, installing ``socket.io`` library through ``npm i socket.io``, we do the following:

---> ``./index.js``

```
import { createServer } from "http";``
import { Server } from "socket.io";``

const httpServer = createServer( (request, response) => {    
    response.write('{"body": "This is a server example!"}');
    response.end();``
});

const io = new Server(httpServer, {   
    cors:{
		origin:"*",
	}});
```


Until now, we are just creating a server instance by ``createServer`` method from ``http`` module. After that, we do the same with socket.IO library. 

As you can see, to create a new server instance with socket.IO, we have to pass a previusly HTTP server instance created. But you can do a standalone initialization. Also, we are using tools provided by Node.js, but if you want, you can use external libraries like express and work with it.

The second parameters are options, for this example we are disabling cors-policy to allow any client to connect our server.


### Waiting for events

Whith those few lines, we can now start to listening events. The syntax is the following:

```
io.on("connection", (socket) => {
  ...
});
```


- ``on``: is a method used for listening events.
    
- ``"connection"``: is the name of the event we are listening. In this case, we are listening for every client that connects with our server.
    
- ``callback function``: what should happen when this events occurs.


Here you have a full docs of ``io`` instance: https://socket.io/docs/v4/server-instance/


--------------------------------------------------------------------------------------------
### Using socket events

There are cases when using global events is useful. But, if we want our app to react certain events executed by client, we need to do the following

```
io.on("connection", (socket) => {
    socket.on('client:join-room', (data) => {
	    ...
    })
});
```


We are now listening to ``"client:joint-room"`` event, that i create for demostration, but you can create as many random events name as you want.

Finally, let's create another event to detect user disconnection. This is the syntax

```
io.on("connection", (socket) => {

	socket.on('client:join-room', (data) => {
	    ...
    })
        
	socket.on("disconnect", () => {
        console.log(socket.id, "disconnected");
    });
        
});
```

### Working with Next.js
### Initializing from client

For this demo, we will be using Next.js to demonstrate how to connect our React app with this basic server.

We need to install ``socket.io-client`` to start connecting our Node.js server.

And, let's create a component to initialize our socket.io instance from client.

---> ``./components/SocketController.js``

```
"use client"

import { io } from 'socket.io-client';
import {useEffect,useState} from "react"
import {useSocketStore} from "../store/useSocketStore"

export default function SocketController({token,id,URL}){
	if(!token) return
	const [isConnected, setIsConnected] = useState(false);
	const [socket,setSocket] = useState( io(URL,{auth:{token},autoConnect: false}));

	useEffect(() => {
		if(isConnected) return
		socket.connect()
		setIsConnected(socket.connected)
		return () => {
			socket.disconnect()
		}
	},[isConnected])
	
	#### We don't need to return anything, so we just put null here
	return null
}
```

In this example, we are creating a state and passing a instance of io. You will see in a moment why we do this way.

### Using with state manager library

What if we want to use our socket.io instance in all our app, we can use libraries like zustand to maintain the state.

So, we create a store first

---> ``./store/useCurrentSocket.js``

```
import {create} from "zustand";

export const useSocketStore = create((set) => ({
  currentSocket:null,
  setCurrentSocket:(socket) => set((state) => ({socket:socket})) 
}));
```


And importing it, inside our component.
```
"use client"

import { io } from 'socket.io-client';
import {useEffect,useState} from "react"
import {useSocketStore} from "../store/useSocketStore"

export default function SocketController({token,id,URL}){
	if(!token) return
	const [isConnected, setIsConnected] = useState(false);
	const [socket,setSocket] = useState( io(URL,{auth:{token},autoConnect: false}));

	useEffect(() => {
        useSocketStore.setState({currentSocket:socket})
	},[socket])
	
	useEffect(() => {
		if(isConnected) return
		socket.connect()
		setIsConnected(socket.connected)
		return () => {
			socket.disconnect()
		}
	},[isConnected])
	
	return null
``}
```

Here we are creating a new useEffect for listening socket changes, so we can set our currentSocket global state to this.

Finally, to sending events we do the following

---> ``./page.jsx``

```
import dynamic from 'next/dynamic'
import {useSocketStore} from "./store/useSocketStore"
const DynamicSocketInit = dynamic(() => import("./components/SocketInitializer"), {
  ssr:false
})


export default function Home() {
  const {currentSocket} = useSocketStore()
  let room = "room1"
  
  useEffect(() => {
	currentSocket?.emit("client:join-room",room)
    
    return () => {
      currentSocket?.off("client:join-room","room1")
    }
  },[currentSocket])

return (
	<div> 
	    <DynamicSocketInit URL={"https://backend-spike.onrender.com"} token="123"/>
		<h4>Hello world!</h4>
	</div>)
}
```

Here, we are putting a emit method inside a useEffect and emiting a event with it's name and in the second parameter, any data we want. In this case, we will be pasing a string called room. 

It's important to add socket.off in our useEffect cleanup function. 

Also, importing dynamically our component without ``ssr`` will prevent multiple connections from the same client caused by Next.js SSR.


### Returning to backend

In the backend, we listen to this event ``'client:join-room'``:

```
socket.on('client:join-room', async (data) => {
   if(socket.handshake.auth.token !== "123") return
	    let room = data.toString()
	    socket.join(room)
})
```

We get the data from client and convert it to string with ``toString()`` method. But before, you can see we validate something from socket headers.

If you remember, when we initialized our socket io instance we did this:

``` 
const [socket,setSocket] = useState( io(URL,{auth:{token},autoConnect: false}));
```

The object of the second parameter contains an auth prop with a token inside. So, we can pass any auth data to validate with backend. 

After that, we use ``socket.join`` method to join socket to specific room.

We can think in room as **places where only the users inside it can communicate each other.**

Official docs: https://socket.io/docs/v4/rooms/

#### Broadcasting events


So far, we have joined our client to a room. But what if we want this user to send a message with all the people inside the room?.

First, let's create two events. One in the client, and other in the backend.

#### Backend 

Following the Socket.io docs, we have this emit options:

```
io.on("connection", (socket) => {  
  
// basic emit
socket.emit(/* ... */);  
  
// to all clients in the current namespace except the sender  
socket.broadcast.emit(/* ... */);  
  
// to all clients in room1 except the sender  
socket.to("room1").emit(/* ... */);  
  
// to all clients in room1 and/or room2 except the sender  
socket.to("room1").to("room2").emit(/* ... */);  
  
// to all clients in room1  
io.in("room1").emit(/* ... */);  
  
// to all clients in namespace "myNamespace"  
io.of("myNamespace").emit(/* ... */);  
  
// to all clients in room1 in namespace "myNamespace"  
io.of("myNamespace").to("room1").emit(/* ... */);  
  
// to individual socketid (private message)  
io.to(socketId).emit(/* ... */);  
  
// to all clients on this node (when using multiple nodes)  
io.local.emit(/* ... */);  
  
// to all connected clients  
io.emit(/* ... */);  
  
// WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room  
// named `socket.id` but the sender. Please use the classic `socket.emit()` instead.  
  
// with acknowledgement  
socket.emit("question", (answer) => {  
// ...  
});  
  
// without compression  
socket.compress(false).emit(/* ... */);  
  
// a message that might be dropped if the low-level transport is not writable  
socket.volatile.emit(/* ... */);  
  
});
```

**Emit cheatseet**:  https://socket.io/docs/v3/emit-cheatsheet/

In our case, we want to broadcast a response in our room.

So we do the following:

---> ``index.js``

```
   socket.on('client:send-message',async (data) => {
            if(socket.handshake.auth.token !== "123") return
            let room 
            data.sender = false
            data.author = socket.id
            socket.rooms.forEach(item => {
                if(item !== socket.id) return room = item
            })
            return socket.broadcast.to(room.toString()).emit("server:incoming-message",data);
        })
```

We are getting all the rooms of the socket and filtering it, because we got two:  a room with the ID of the socket and the room (in our case "room1") we want.

After that, we just broadcast the message received from client to all sockets in that particular room. Broadcast doesn't send the response back to the client that made it.

#### Client

We can now send messages from client.

```
"use client"
import {useEffect,useState} from "react"
import dynamic from 'next/dynamic'
import {useSocketStore} from "./store/useSocketStore"
const DynamicSocketInit = dynamic(() => import("./components/SocketInitializer"), {
  ssr:false
})
export default function Home() {
  let room = "room1"
  const {currentSocket} = useSocketStore()
  const [input,setInput] = useState("")
  const [messages,setMessages] = useState([])

  useEffect(() => {
    currentSocket?.emit("client:join-room",room)
    currentSocket?.on("server:incoming-message",(msg) => {
      console.log("new msg!")
      setMessages(prev => [...prev,msg])
    })
    return () => {
      currentSocket?.off("client:join-room","room1")
      currentSocket?.off("server:incoming-message",(msg) => {
        setMessages(prev => [...prev,msg])
    })
    }
  },[currentSocket])

  const handleSubmit = async (e) => {
    e.preventDefault()
    let message = {author:"User",sender:true,content:input,date:moment().format('LT')}
    
    #### Because we are broadcasting from backend, our message will not be returned at 'server:incoming-message event'. So we have to add the message to our messages state.
    
    setMessages(prev => [...prev,message])
    currentSocket?.emit("client:send-message",message)
    return setInput("")
  }

  const handleChange = ({target}) => {
    const {value} = target
    return setInput(value)
  }
  return (
    <main >
    <DynamicSocketInit URL={"https://backend-spike.onrender.com"} token="123"/>
        <div>
          {messages.map(message => <>{JSON.stringify(message)} )}
       </div>
      <form onSubmit={handleSubmit}>
        <input 
          onChange={handleChange} 
          value={input}>
      </form>
    </main>
  )
}

```

# 3. Socket.IO library
## Why Socket.IO?

The reasons why we decide using this library are mainly 3.

1. **Large support and community beyond**: Due to its popularity, Socket.io has a large community beyond that helps and supports another users.
    
2. **Scalable**: It has the advantage to scale to apps with multiple servers.
    
3. **Easy to learn and large community support**: Another important key is its support by the community beyond. This way, whenever we encounter with a question or problem in our code, we will be covered by community.
## Advantages against others

- Socket.IO supports multiplexing through namespaces. Making use of namespaces enables you to minimize the number of TCP connections used, and save socket ports on the server. 
    
- Socket.IO allows the server side to flexibly broadcast events to all the connected clients. You can also broadcast events to a subset of clients via the rooms feature.
    
- Socket.IO offers [HTTP long-polling](https://ably.com/topic/long-polling) as a fallback option, which is useful in environments that don't support WebSockets.
    
- Socket.IO provides a configurable Ping/Pong heartbeat mechanism, allowing you to detect if a connection is alive or not. Additionally, if and when a client gets disconnected, it automatically reconnects.

## Official docs

You can read full Socket.IO docs here: https://socket.io/docs/v4/

