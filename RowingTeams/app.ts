﻿/// <reference path="Scripts/typings/linq/linq.3.0.3-Beta4.d.ts" />
/// <reference path="Scripts/typings/combinatorics/combinatorics.d.ts" />

class Session {
    private _participants: Person[];

    constructor(participants?: Person[]) {
        if (participants === undefined) {
            this._participants = [];
        }
        else {
            this._participants = participants;
        }
    }

    get participants(): Person[]{
        return this._participants;
    }

    generate(numOfBoats: number, rowersPerBoat: number, numOfTrips: number): Trip[] {
        var participants =
            Enumerable
                .from(this._participants);

        var coxes =
            participants
                .where(x => (<Person>x).canBeCox);

        var rowers =
            participants
                .where(x => (<Person>x).canBeRower);

        if (coxes.count() < numOfBoats) throw "Not enough coxes for the number of boats.";

        var possibleTripCount = 0;

        Combinatorics.combination(coxes.toArray(), numOfBoats).forEach(selectedCoxes => {
            var availableRowers = rowers.except(selectedCoxes).toArray();

            if (availableRowers.length >= rowersPerBoat * numOfBoats) {
                CombinatoricsEx.group(availableRowers, numOfBoats, rowersPerBoat).forEach(rowerGrouping => {
                    console.assert(rowerGrouping.length == selectedCoxes.length);

                    possibleTripCount++;
                });
            }
        });

        var tripIndex = 0;
        var trips = [];

        var selectedTripIndices = Enumerable
            .range(1, numOfTrips, possibleTripCount / (numOfTrips - 1))
            .select(x => Math.floor(x))
            .select(x => x - 1 < possibleTripCount - 1 ? x - 1 : possibleTripCount - 1);

        Combinatorics.combination(coxes.toArray(), numOfBoats).forEach(selectedCoxes => {
            var availableRowers = rowers.except(selectedCoxes).toArray();

            if (availableRowers.length >= rowersPerBoat * numOfBoats) {
                CombinatoricsEx.group(availableRowers, numOfBoats, rowersPerBoat).forEach(rowerGrouping => {
                    console.assert(rowerGrouping.length == selectedCoxes.length);

                    if (selectedTripIndices.contains(tripIndex)) {
                        var boats = [];

                        selectedCoxes.forEach((y, idx) => {
                            var cox = <Person>y;
                            var rowers = rowerGrouping[idx];
                            var boat = new Boat(cox, rowers);
                            boats.push(boat);
                        });

                        trips.push(new Trip(boats));
                    }

                    tripIndex++;
                });
            }
        });

        return trips;
    }
}

class Trip {
    private _boats: Boat[];

    constructor(boats: Boat[]) {
        this._boats = boats;
    }

    get Boats(): Boat[]{
        return this._boats;
    }

    toString(): string {
        var text = "{ ";
        var isFirst = true;
        this._boats.forEach(boat => {
            text += isFirst ? "" : ", ";
            text += boat.toString();
            isFirst = false;
        });
        text += " }";
        return text;
    }
}

class Boat {
    private _cox: Person;
    private _rowers: Person[];

    constructor(cox: Person, rowers: Person[]) {
        this._cox = cox;
        this._rowers = rowers;
    }

    get cox(): Person {
        return this._cox;
    }

    get rowers(): Person[] {
        return this._rowers;
    }

    toString(): string {
        var text = "{ (C)" + this._cox.toString();

        this._rowers.forEach(rower => {
            text += ", ";
            text += rower.toString();
        });

        text += " }";
        return text;
    }
}

class Person {
    private _name: string;
    private _canBeCox: boolean;
    private _canBeRower: boolean;

    constructor(name: string, canBeCox: boolean, canBeRower: boolean) {
        this._name = name;
        this._canBeCox = canBeCox;
        this._canBeRower = canBeRower;
    }

    get name(): string {
        return this._name;
    }

    get canBeCox(): boolean {
        return this._canBeCox;
    }

    get canBeRower(): boolean {
        return this._canBeRower;
    }

    toString(): string {
        return this._name;
    }
}

class CombinatoricsEx {
    private static swap(array: any[], pos1: number, pos2: number): boolean {
        if (array[pos1] !== array[pos2]) {
            var temp = array[pos1];
            array[pos1] = array[pos2];
            array[pos2] = temp;
            return true;
        }

        return pos1 === pos2;
    }

    private static heapPermute(array: any[], results: any[], n: number) {
        if (n == 1)
            results.push(array);
        else {
            for (var i = 0; i < n; i++) {
                CombinatoricsEx.heapPermute(array.map(x => x), results, n - 1);
                if (n % 2 == 1) {  // if n is odd
                    if (!CombinatoricsEx.swap(array, 0, n - 1)) return;
                }
                else {            // if n is even
                    if (!CombinatoricsEx.swap(array, i, n - 1)) return;
                }
            }
        }
    }

    static permute(array: any[]): any[][]{
        var result = [];
        CombinatoricsEx.heapPermute(array, result, array.length);
        return result;
    }

    static group(array: any[], groupCount: number, groupSize: number): any[][]{
        console.assert(array.length >= groupCount * groupSize);

        var result = [];

        var groupPositions = Enumerable
            .range(0, groupCount)
            .selectMany(x => Enumerable.repeat(x, groupSize));

        Combinatorics.combination(array, groupCount * groupSize).forEach(combination => {
            CombinatoricsEx.permute(groupPositions.toArray()).forEach(posPerm => {
                var grouping = Enumerable
                    .range(0, groupCount)
                    .select(
                        groupIndex =>
                            Enumerable
                                .from(posPerm)
                                .select((x, idx) => x == groupIndex ? combination[idx] : undefined)
                                .where(x => x !== undefined)
                                .toArray())
                    .toArray();

                result.push(grouping);
            });
        });

        return result;
    }
}