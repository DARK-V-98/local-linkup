import { db,isFirebaseConfigured } from "@/lib/firebase";
import { defaultSettings,type PlatformSettings } from "@/lib/firestore/workflows";
import { doc,onSnapshot } from "firebase/firestore";
import { useEffect,useState } from "react";
export function usePlatformSettings(){
 const [settings,setSettings]=useState<PlatformSettings>(defaultSettings);
 useEffect(()=>{if(!isFirebaseConfigured)return;return onSnapshot(doc(db,"settings","platform"),snap=>setSettings({...defaultSettings,...snap.data()}),()=>{});},[]);
 const number=settings.whatsappNumber.replace(/\D/g,"");
 return {...settings,supportHref:/^\d{10,15}$/.test(number)?`https://wa.me/${number}`:"/contact"};
}
