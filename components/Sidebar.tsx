import {
LayoutDashboard,
FileText,
Settings
} from "lucide-react";


export default function Sidebar(){

return(

<aside
className="
w-64
min-h-screen
border-r
p-6
hidden md:block
"
>


<h2 className="
font-bold
text-xl
mb-10
">

Wordvia.ai

</h2>



<div className="space-y-6">


<div className="flex gap-3">
<LayoutDashboard/>
Dashboard
</div>


<div className="flex gap-3">
<FileText/>
Documents
</div>


<div className="flex gap-3">
<Settings/>
Settings
</div>


</div>


</aside>

)

}