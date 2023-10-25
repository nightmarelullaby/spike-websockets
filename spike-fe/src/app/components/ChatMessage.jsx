"use client"
import {User,Input,Textarea,Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {useState} from "react"
export default function ChatMessage ({sender,content,author,date}){
	const [textContent,setTextContent] = useState(content.length > 200 ? content.slice(0,200):content)
	const handleExtend = () => {
		return setRestTextVisible(true)
	}
	return <>
		{!sender && <Card className="max-w-[400px] rounded-ss-none bg-blue-500">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md text-white font-medium">id: {author}</p>
              <small className="text-xs text-gray-300">Recibido {date}</small>
            </div>
          </CardHeader>
          <Divider className="bg-blue-300"/>
          <CardBody className="px-4 py-2">
          	 <p className="text-sm">{textContent}</p>
          </CardBody>
        	</Card>}
        	{sender && <Card className="self-end rounded-tr-none">
          <CardHeader className="flex gap-3">
          	<div className="flex flex-col items-end ml-auto">
              <p className="text-md text-white font-medium">{author}</p>
              <small className="text-xs text-gray-300">Enviado {date}</small>
            </div>
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
              width={40}
            />
            
          </CardHeader>
          <CardBody className="px-4 py-2" >
          	<p className="text-sm text-end">{textContent}</p>
          </CardBody>
          <Divider/>     
        	</Card>}
        </>
}