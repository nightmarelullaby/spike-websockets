"use client"
import {NextUIProvider} from "@nextui-org/react";

export default function NextUILayoutProvider({children}) {

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}