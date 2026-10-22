import { getUser,setUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/firestore/users";
import { useState } from "react";
import { toast } from "sonner";
export default function NotificationSettings(){
 const user=getUser();const [saving,setSaving]=useState(false);const [preferences,setPreferences]=useState({bookingUpdates:user?.notificationPreferences?.bookingUpdates??true,messages:user?.notificationPreferences?.messages??true,reviews:user?.notificationPreferences?.reviews??true});
 return <form className="max-w-xl bg-white border rounded-3xl p-6 space-y-5" onSubmit={async e=>{e.preventDefault();if(!user)return;setSaving(true);try{await updateUserProfile(user.id,{notificationPreferences:preferences});setUser({...user,notificationPreferences:preferences});toast.success("Notification preferences saved.");}catch{toast.error("Could not save notification preferences.");}finally{setSaving(false);}}}><h2 className="text-xl font-black">In-app notifications</h2><p className="text-sm text-slate-500">Choose which updates appear in your notification inbox.</p>{([{key:"bookingUpdates",label:"Booking status updates"},{key:"messages",label:"New messages"},{key:"reviews",label:"New reviews"}] as const).map(item=><label key={item.key} className="flex justify-between gap-4 font-semibold"><span>{item.label}</span><input type="checkbox" checked={preferences[item.key]} onChange={e=>setPreferences({...preferences,[item.key]:e.target.checked})}/></label>)}<button disabled={saving} className="rounded-xl p-3 bg-slate-900 text-white font-bold">Save preferences</button></form>;
}
