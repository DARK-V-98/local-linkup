export function stayPrice(selection, room, addons, pack = null) {
    const date = value => { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw Error("Choose valid stay dates."); const parsed = new Date(value + "T00:00:00Z"); if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== value)
        throw Error("Choose valid stay dates."); return +parsed; };
    const nights = (date(selection.departure) - date(selection.arrival)) / 86400000;
    const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
    if (!integer(nights, 1, 90) || !integer(selection.adults, 1, 100) || !integer(selection.children, 0, 100) || !integer(selection.rooms, 1, 20))
        throw Error("Check nights, rooms and guest counts.");
    if (!room?.active || selection.adults + selection.children > room.capacity * selection.rooms || selection.rooms > room.units)
        throw Error("Choose a room suitable for your group.");
    if (nights < room.minNights || nights > room.maxNights)
        throw Error("The stay does not meet this room’s night limits.");
    if (pack && (!pack.active || pack.roomId !== selection.roomId || pack.nights !== nights))
        throw Error("The package does not match your room or number of nights.");
    const amount = value => { if (!integer(value, 0, 100000000))
        throw Error("A catalog price is invalid."); return value; };
    const lines = [{ name: pack ? pack.name : room.name, quantity: pack ? selection.rooms : nights * selection.rooms, unitMinor: amount(pack ? pack.priceMinor : room.priceMinor) }];
    const chosen = new Set(selection.addonIds);
    if (chosen.size !== selection.addonIds.length || chosen.size > 20)
        throw Error("Check selected extras.");
    for (const addonId of chosen) {
        const addon = addons.find(item => item.id === addonId);
        if (!addon?.active)
            throw Error("An extra is no longer available.");
        if (pack?.includedAddonIds?.includes(addonId))
            continue;
        const quantity = addon.basis === "night" ? nights * selection.rooms : addon.basis === "person" ? selection.adults + selection.children : addon.basis === "person_night" ? (selection.adults + selection.children) * nights : 1;
        lines.push({ name: addon.name, quantity, unitMinor: amount(addon.priceMinor) });
    }
    const totalMinor = lines.reduce((sum, line) => sum + line.quantity * line.unitMinor, 0);
    if (!Number.isSafeInteger(totalMinor) || totalMinor > 1000000000)
        throw Error("This request exceeds supported limits.");
    return { nights, totalMinor, lines, currency: "LKR" };
}
