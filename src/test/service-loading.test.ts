import { useService } from "@/hooks/useService";
import { act,renderHook,waitFor } from "@testing-library/react";
import { describe,expect,it,vi } from "vitest";
const mocked=vi.hoisted(()=>({fetch:vi.fn()}));
vi.mock("@/lib/firebase",()=>({isFirebaseConfigured:true}));
vi.mock("@/lib/firestore/services",()=>({fetchServiceById:mocked.fetch}));
vi.mock("@/lib/firestore/reviews",()=>({subscribeToServiceReviews:()=>()=>{},getReviewsBySeller:vi.fn()}));
describe("service navigation",()=>{it("clears the previous listing while loading another service",async()=>{const listing={id:"one",title:"First",category:"Home",district:"Colombo",price:100,sellerName:"Seller",createdAt:"2026-10-22"};mocked.fetch.mockResolvedValueOnce(listing);let resolve!:(value:unknown)=>void;mocked.fetch.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));const {result,rerender}=renderHook(({id})=>useService(id),{initialProps:{id:"one"}});await waitFor(()=>expect(result.current.service?.id).toBe("one"));rerender({id:"two"});expect(result.current.loading).toBe(true);expect(result.current.service).toBeNull();await act(async()=>resolve({...listing,id:"two"}));await waitFor(()=>expect(result.current.service?.id).toBe("two"));});});
