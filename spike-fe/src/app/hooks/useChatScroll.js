"use client"
import {useRef,useEffect} from "react"

export function useChatScroll(dep) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}