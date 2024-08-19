import React, { useState } from "react";

export default function ShoppingList() {
  // első körben 1 ugyanolyan system mint eddig.
  // 1 move to gomb, amivel át lehet csoportosítani a tételeket, ahova a felhasználó szeretné. Gomb neve: "Move to..."
  // A move to gomb kattintásával, felajálja a 4 lehetséges csoportot, ahova beszúrhatjuk a tételt.
  // Amint a kiválasztott csoportba helyezzük az adott tételt, ellenőrizni kell, hogy van-e már olyan tétel a kiválasztott csoportban: - ha igen: akkor össze kell vonni a 2 mennyiséget, és nem hozunk létre újabb tételt. -ha nincs: akkor létrehozunk egy új tételt, az elem nevével és mennyiségével.
  // Ha az adott tételt beszúrtuk valahova, akkor a ShoppingList felsorolásból automatikusan el kell távolítani.
  // 1 gomb amivel lehet váltani az adott tétel színét, jelezve a vásárlás sikerességét (esetleg pipa v x)

  // Az összes komponensbe be lehet építeni egy olyan visszajelzőt, hogy jelzi, ha az adott tételből kevés van. Pl 1 db/l vagy más mértékegység. Ha 1 van belőle, a tétel színe pirosra vált, a font-weight: bold-ra. Regex.
  // Itt a regex ami megoldja a kérdést: const regex = /^(1(\.0+)?|0\.[1-9]+)\b.*$/;

  return <h3>Shopping list</h3>;
}
