"use client"
import { io } from 'socket.io-client';
import {useEffect,useState} from "react"
import {useSocketStore} from "../store/useSocketStore"
export default function SocketController({token,id,URL}){
	const {setCurrentSocket} = useSocketStore()
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
}