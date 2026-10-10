"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import {
  UserButton,
  SignInButton,
  useAuth
} from "@clerk/nextjs";

export default function Navbar(){
const { isSignedIn } = useAuth();

return(

<nav className="
sticky top-0
z-50
bg-white/80
backdrop-blur
border-b
px-6 md:px-12
py-5
flex
items-center
justify-between
">


<Link
href="/"
className="
flex
items-center
gap-2
text-2xl
font-bold
"
>

<Sparkles
className="text-purple-600"
/>

Wordvia.ai

</Link>



<div className="
flex
items-center
gap-6
">


<Link href="/humanizer">
Humanizer
</Link>


<Link href="/pricing">
Pricing
</Link>




{
!isSignedIn && (

<SignInButton>

<button
className="
border
px-5
py-2
rounded-xl
">

Login

</button>

</SignInButton>

)
}



{
isSignedIn && (

<>

<Link href="/dashboard">

Dashboard

</Link>


<UserButton/>

</>

)
}





<Link href="/dashboard">

Dashboard

</Link>


<UserButton/>




</div>


</nav>


)

}