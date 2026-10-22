import { clearUser,getUser,signUpBuyer,signUpSeller } from "@/lib/auth";
import { beforeEach,describe,expect,it,vi } from "vitest";
const mocks=vi.hoisted(()=>({create:vi.fn(),profile:vi.fn(),update:vi.fn(),verify:vi.fn(),remove:vi.fn(),signOut:vi.fn()}));
vi.mock("@/lib/firebase",()=>({isFirebaseConfigured:true,auth:{},db:{}}));
vi.mock("firebase/auth",()=>({createUserWithEmailAndPassword:mocks.create,updateProfile:mocks.update,sendEmailVerification:mocks.verify,deleteUser:mocks.remove,signOut:mocks.signOut}));
vi.mock("@/lib/firestore/users",()=>({createUserProfile:mocks.profile,ensureUserProfile:vi.fn(),updateUserProfile:vi.fn()}));
const valid={name:"Test Buyer",email:"BUYER@EXAMPLE.COM",phone:"0771234567",password:"password-eight",district:"Colombo"};
describe("registration persistence and failure handling",()=>{
 beforeEach(()=>{vi.resetAllMocks();clearUser();mocks.create.mockResolvedValue({user:{uid:"real-uid",emailVerified:false}});mocks.update.mockResolvedValue(undefined);mocks.profile.mockResolvedValue(undefined);mocks.verify.mockResolvedValue(undefined);mocks.remove.mockResolvedValue(undefined);});
 it("uses the Firebase UID, persists role and sends ownership verification",async()=>{const user=await signUpSeller({...valid,sellerCategory:"Home Services"});expect(user.id).toBe("real-uid");expect(user.role).toBe("seller");expect(mocks.profile).toHaveBeenCalledWith("real-uid",expect.objectContaining({role:"seller",email:"buyer@example.com",verified:false}));expect(mocks.verify).toHaveBeenCalledOnce();expect(getUser()?.id).toBe("real-uid");});
 it("does not create a successful local account when the profile write fails",async()=>{mocks.profile.mockRejectedValue(new Error("Database denied"));await expect(signUpBuyer(valid)).rejects.toThrow("Database denied");expect(mocks.remove).toHaveBeenCalledOnce();expect(getUser()).toBeNull();});
 it("rejects invalid fields before creating an Auth account",async()=>{await expect(signUpBuyer({...valid,password:"123"})).rejects.toThrow();expect(mocks.create).not.toHaveBeenCalled();expect(mocks.profile).not.toHaveBeenCalled();});
});
