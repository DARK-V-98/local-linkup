import {beforeEach,describe,expect,it,vi} from "vitest";
import {submitVerification} from "@/lib/firestore/workflows";
const mocks=vi.hoisted(()=>({upload:vi.fn(),save:vi.fn(),auth:{currentUser:{uid:"seller"} as {uid:string}|null}}));
vi.mock("@/lib/auth",()=>({getUser:()=>({id:"seller",name:"Seller"})}));
vi.mock("@/lib/firebase",()=>({isFirebaseConfigured:true,auth:mocks.auth,db:{},storage:{}}));
vi.mock("firebase/storage",()=>({ref:(_storage:unknown,path:string)=>path,uploadBytes:mocks.upload}));
vi.mock("firebase/firestore",async importOriginal=>({...await importOriginal<typeof import("firebase/firestore")>(),doc:vi.fn(()=>({})),setDoc:mocks.save,serverTimestamp:()=>"server-time"}));
function documents(){const data=new FormData();data.set("tin","TEST-TAX");for(const key of ["brnDoc","ownerId"])data.set(key,new File(["test file"],key+".pdf",{type:"application/pdf"}));return data;}
describe("private verification upload recovery",()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.auth.currentUser={uid:"seller"};mocks.upload.mockResolvedValue({});mocks.save.mockResolvedValue(undefined);});
 it("rejects a changed authentication session before uploading identity documents",async()=>{mocks.auth.currentUser={uid:"other"};await expect(submitVerification(documents(),{sellerType:"business"})).rejects.toThrow("sign-in session changed");expect(mocks.upload).not.toHaveBeenCalled();});
 it("explains that the account is saved when Storage denies access, without submitting a complete application",async()=>{mocks.upload.mockRejectedValue({code:"storage/unauthorized"});await expect(submitVerification(documents(),{sellerType:"business"})).rejects.toThrow("Your account is saved");expect(mocks.save).not.toHaveBeenCalled();});
 it("saves pending verification only after private owner-scoped uploads complete",async()=>{await submitVerification(documents(),{sellerType:"business"});expect(mocks.upload).toHaveBeenCalledTimes(2);expect(mocks.upload.mock.calls.every(call=>(call[0] as string).startsWith("verifications/seller/"))).toBe(true);expect(mocks.save).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({status:"pending",documents:expect.arrayContaining([expect.objectContaining({name:"brnDoc"}),expect.objectContaining({name:"ownerId"})])}),{merge:true});});
});
