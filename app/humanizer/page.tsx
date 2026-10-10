import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import HumanizerClient from "../humanizer/└── HumanizerClient";


export default async function HumanizerPage(){

  const { userId } = await auth();


  if(!userId){

    redirect("/sign-in");

  }


  return (

    <HumanizerClient />

  );

}