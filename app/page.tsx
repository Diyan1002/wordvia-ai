import Navbar from "@/components/Navbar";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";


export default function Home(){

return(

<div>
<Navbar/>
<section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
<div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
✨ AI Writing Revolution
</div>

<h1 className="text-6xl font-bold max-w-4xl">Humanize AI Text.
<br/>
<span className="text-purple-600">Make Every Word Feel Human.</span>
</h1>
<p className="mt-6 text-xl text-gray-500 max-w-2xl">
Transform robotic AI generated content into
natural, authentic human writing.
</p>

<div className="mt-10 flex gap-5">
<button className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg">
Humanize Now
</button>

<button className="border px-8 py-4 rounded-xl">
View Demo
</button>
</div>

<div className="grid md:grid-cols-3 gap-6 mt-20">

<Card
icon={<Sparkles/>}
title="Natural Writing"
/>

<Card
icon={<ShieldCheck/>}
title="Meaning Preserved"
/>

<Card
icon={<Zap/>}
title="Instant Results"
/>
</div>
</section>

</div>

)

}



function Card({icon,title}:any){

return(

<div className="
p-6
bg-white
rounded-2xl
shadow-sm
border
">

<div className="
text-purple-600
mb-4
">
{icon}
</div>

<h3 className="font-semibold">
{title}
</h3>

</div>

)

}