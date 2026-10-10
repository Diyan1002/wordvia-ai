import "./globals.css";
import {
ClerkProvider
} from "@clerk/nextjs";


export const metadata = {
title:"Wordvia.ai",
description:"AI Humanizer SaaS",
};


export default function RootLayout({
children,
}:{
children:React.ReactNode;
}){


return(

<html lang="en">

<body>

<ClerkProvider>

{children}

</ClerkProvider>


</body>

</html>

)

}