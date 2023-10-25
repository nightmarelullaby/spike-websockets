"use client"
import moment from "moment"
import {User,Input,Textarea,Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {useEffect,useState} from "react"
import {useChatScroll} from "./hooks/useChatScroll"
import ChatMessage from "./components/ChatMessage"
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
  const ref = useChatScroll(messages)

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
    setMessages(prev => [...prev,{author:"User",sender:true,content:input,date:moment().format('LT')}])
    currentSocket?.emit("client:send-message",{author:"User",sender:true,content:input,date:moment().format('LT')})
    return setInput("")
  }

  const handleChange = ({target}) => {
    const {value} = target
    return setInput(value)
  }
  return (
    <main ref={ref} className="relative h-screen overflow-y-scroll">
    <DynamicSocketInit URL={"http://localhost:3001"} token="123"/>
        <div className="h-fit-content fixed z-30 p-2 w-full top-0 bg-neutral-800">
         <User   
          name="room"
          description="Bienvenido a la sala!"
          avatarProps={{
            src: "https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          }}/>
        </div>
        <div  className="pt-2 px-2 mt-[63px] mb-[48px] flex flex-col gap-2">
          {messages.map(message => <ChatMessage sender={message.sender} author={message.author} date={message.date}content={message.content}/>)}
       </div>
      <form onSubmit={handleSubmit}>
        <Input 
          onChange={handleChange} 
          variant="bordered" 
          value={input}
          className="mt-2 fixed bottom-0"
          classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
              "bg-black py-6 h-8",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent ",
            inputWrapper: [
              "shadow-xl",
              "rounded-b-none",
              "bg-black",
              "dark:bg-default/60",
              "hover:bg-default-200/70",
              "dark:hover:bg-default/70",
              "group-data-[focused=true]:bg-default-200/50",
              "dark:group-data-[focused=true]:bg-default/60",
              "!cursor-text",
            ],
          }}
          placeholder="Paste your paragraph here" 
          type="text" 
          isClearable={true}/ >
      </form>
    </main>
  )
}
