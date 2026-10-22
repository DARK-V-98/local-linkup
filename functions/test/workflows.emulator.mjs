import {before,beforeEach,after,test} from "node:test";
import assert from "node:assert/strict";
// This suite is hard-wired to the isolated emulator. It cannot select production.
process.env.FIRESTORE_EMULATOR_HOST="127.0.0.1:8085";
process.env.GCLOUD_PROJECT="demo-needly-audit";
process.env.PAYHERE_MERCHANT_ID="TEST_MERCHANT";
process.env.PAYHERE_MERCHANT_SECRET="TEST_SECRET_NOT_A_LIVE_CREDENTIAL";
process.env.PAYHERE_SANDBOX="true";
process.env.SITE_ORIGIN="https://example.test";
const functions=await import("../index.js");
const {getFirestore}=await import("firebase-admin/firestore");
const {getApps,deleteApp}=await import("firebase-admin/app");
const db=getFirestore("needlyy");
const request=(uid,data={},token={})=>({auth:{uid,token},data});
beforeEach(async()=>{
 for(const name of ["users","bookings","payments","balances","payouts","disputes"]){const docs=await db.collection(name).get();const batch=db.batch();docs.docs.forEach(doc=>batch.delete(doc.ref));await batch.commit();}
 for(const [uid,role] of [["buyer","buyer"],["seller","seller"],["other","buyer"],["admin","admin"]])await db.doc(`users/${uid}`).set({name:uid,email:`${uid}@example.com`,role,verified:role==="seller"});
 await db.doc("bookings/order").set({id:"order",buyerId:"buyer",sellerId:"seller",status:"completed",price:1500,serviceTitle:"Plumbing",customerPhone:"0771234567",district:"Colombo"});
});
after(async()=>{await Promise.all(getApps().map(app=>deleteApp(app)));});
test("checkout ignores browser amount and uses canonical booking price",async()=>{const result=await functions.createCheckout.run(request("buyer",{bookingId:"order",amount:1}));assert.equal(result.amount,"1500.00");assert.equal(result.sandbox,true);assert.ok(result.hash);const record=await db.doc("payments/order").get();assert.equal(record.data().amountMinor,150000);assert.equal(record.data().test,true);});
test("checkout rejects unrelated users and unsigned requests",async()=>{await assert.rejects(()=>functions.createCheckout.run(request("other",{bookingId:"order"})));await assert.rejects(()=>functions.createCheckout.run({data:{bookingId:"order"}}));});
test("seller can record direct cash once, buyer cannot mark themselves paid",async()=>{await assert.rejects(()=>functions.confirmCashPayment.run(request("buyer",{bookingId:"order"})));await functions.confirmCashPayment.run(request("seller",{bookingId:"order"}));assert.equal((await db.doc("payments/order").get()).data().method,"cash");await assert.rejects(()=>functions.confirmCashPayment.run(request("seller",{bookingId:"order"})));assert.equal((await db.doc("balances/seller").get()).exists,false);});
test("sandbox payments and unapproved work never create withdrawable money",async()=>{await db.doc("payments/order").set({status:"paid",method:"payhere",test:true,released:false,amountMinor:150000});await functions.approveCompletion.run(request("buyer",{bookingId:"order"}));assert.equal((await db.doc("balances/seller").get()).exists,false);});
test("buyer approval releases a verified live payment exactly once",async()=>{await db.doc("payments/order").set({buyerId:"buyer",sellerId:"seller",status:"paid",method:"payhere",test:false,released:false,amountMinor:150000});await assert.rejects(()=>functions.approveCompletion.run(request("seller",{bookingId:"order"})));await functions.approveCompletion.run(request("buyer",{bookingId:"order"}));await functions.approveCompletion.run(request("buyer",{bookingId:"order"}));assert.equal((await db.doc("balances/seller").get()).data().availableMinor,150000);});
const payoutData={requestId:"request-one",amount:1000,bank:"Test Bank",accountNo:"12345",accountName:"Test Seller",branch:"Colombo"};
test("payout reservation is idempotent and prevents concurrent overspending",async()=>{await db.doc("balances/seller").set({availableMinor:150000,reservedMinor:0});await functions.requestPayout.run(request("seller",payoutData));await functions.requestPayout.run(request("seller",payoutData));await assert.rejects(()=>functions.requestPayout.run(request("seller",{...payoutData,requestId:"request-two"})));const balance=(await db.doc("balances/seller").get()).data();assert.equal(balance.availableMinor,50000);assert.equal(balance.reservedMinor,100000);});
test("payout rejection returns held funds once and needs an admin",async()=>{await db.doc("balances/seller").set({availableMinor:150000,reservedMinor:0});const result=await functions.requestPayout.run(request("seller",payoutData));const data={id:result.id,status:"rejected",reference:"Incorrect bank details"};await assert.rejects(()=>functions.resolvePayout.run(request("seller",data)));await functions.resolvePayout.run(request("admin",data));await assert.rejects(()=>functions.resolvePayout.run(request("admin",data)));const balance=(await db.doc("balances/seller").get()).data();assert.equal(balance.availableMinor,150000);assert.equal(balance.reservedMinor,0);});
test("suspended sellers and disputed balances cannot request payouts",async()=>{await db.doc("balances/seller").set({availableMinor:150000,payoutHold:true});await assert.rejects(()=>functions.requestPayout.run(request("seller",payoutData)));await db.doc("balances/seller").update({payoutHold:false});await db.doc("users/seller").update({status:"suspended"});await assert.rejects(()=>functions.requestPayout.run(request("seller",payoutData)));});

test("open disputes block payouts before the asynchronous hold trigger runs",async()=>{await db.doc("balances/seller").set({availableMinor:150000});await db.doc("disputes/open").set({sellerId:"seller",status:"open"});await assert.rejects(()=>functions.requestPayout.run(request("seller",payoutData)));});
