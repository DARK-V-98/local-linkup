import { test } from "node:test";
import assert from "node:assert/strict";
import { stayPrice } from "../hotel-pricing.js";
const room = { active: true, capacity: 3, units: 2, minNights: 1, maxNights: 30, priceMinor: 100000 };
const selection = { arrival: "2026-12-01", departure: "2026-12-03", rooms: 2, adults: 3, children: 1, roomId: "room", addonIds: ["breakfast"] };
const addons = [{ id: "breakfast", name: "Breakfast", active: true, basis: "person_night", priceMinor: 2000 }];
test("stay pricing uses departure-exclusive nights, room counts and all guests", () => { const price = stayPrice(selection, room, addons); assert.equal(price.nights, 2); assert.equal(price.totalMinor, 416000); });
test("package is per room per stay and included extras are not charged twice", () => { const price = stayPrice(selection, room, addons, { name: "Family stay", active: true, roomId: "room", nights: 2, priceMinor: 180000, includedAddonIds: ["breakfast"] }); assert.equal(price.totalMinor, 360000); });
test("invalid dates, occupancy, units, night limits and duplicate extras are rejected", () => { for (const patch of [{ departure: "2026-12-01" }, { arrival: "2026-02-30" }, { rooms: 3 }, { adults: 8 }, { adults: 1.5 }, { addonIds: ["breakfast", "breakfast"] }])
    assert.throws(() => stayPrice({ ...selection, ...patch }, room, addons)); assert.throws(() => stayPrice(selection, { ...room, minNights: 3 }, addons)); });
test("paused or incompatible catalog items cannot be priced", () => { assert.throws(() => stayPrice(selection, { ...room, active: false }, addons)); assert.throws(() => stayPrice(selection, room, [{ ...addons[0], active: false }])); assert.throws(() => stayPrice(selection, room, addons, { active: true, roomId: "other", nights: 2, priceMinor: 1 })); });
test("negative and fractional minor-unit prices are rejected", () => { for (const priceMinor of [-1, 1.5, Number.MAX_SAFE_INTEGER])
    assert.throws(() => stayPrice(selection, { ...room, priceMinor }, addons)); });
