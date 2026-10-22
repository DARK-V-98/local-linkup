import { registrationSchema,safeRedirect,validateUpload } from "@/lib/validation";
import { describe,expect,it } from "vitest";
describe("registration and untrusted input",()=>{
 const valid={name:" Buyer ",email:"BUYER@EXAMPLE.COM",phone:"+94 77 123 4567",password:"LongPassword8",district:"Colombo"};
 it("normalizes contact details and rejects invalid registration",()=>{expect(registrationSchema.parse(valid)).toMatchObject({name:"Buyer",email:"buyer@example.com",phone:"+94771234567"});for(const patch of [{name:" "},{password:"123456"},{email:"bad"},{phone:"1234"},{district:""}])expect(registrationSchema.safeParse({...valid,...patch}).success).toBe(false);});
 it("allows only internal redirects and rejects network paths and backslash bypasses",()=>{expect(safeRedirect("/service/123?x=1")).toBe("/service/123?x=1");for(const value of ["https://evil.test","//evil.test","/\\evil.test","/x\n",null])expect(safeRedirect(value)).toBe("/");});
 it("rejects executable or oversized identity documents",()=>{expect(()=>validateUpload(new File(["svg"],"id.svg",{type:"image/svg+xml"}))).toThrow();expect(()=>validateUpload(new File([new Uint8Array(6*1024*1024)],"large.pdf",{type:"application/pdf"}))).toThrow();expect(()=>validateUpload(new File(["photo"],"id.jpg",{type:"image/jpeg"}))).not.toThrow();});
});
