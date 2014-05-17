class Tester {
    _generatedCount: HTMLInputElement;
    _deviationValue: HTMLInputElement;
    _heatMap: HTMLElement;

    private _numOfBoats: number;
    private _rowersPerBoat: number;
    private _numOfTrips: number;

    _session: Session;
    _bestSchedule: Schedule;
    _timerToken: number;
    _iterationCount: number;
    _stopRequested: boolean;

    constructor(participants: Array<any>, numOfBoats: number, rowersPerBoat: number, numOfTrips: number) {
        this._numOfBoats = numOfBoats;
        this._numOfTrips = numOfTrips;
        this._rowersPerBoat = rowersPerBoat;

        this._generatedCount = <HTMLInputElement>document.getElementById("generated-count");
        this._deviationValue = <HTMLInputElement>document.getElementById("deviation-value");
        this._heatMap = document.getElementById("heat-map");

        this._iterationCount = 0;
        this._timerToken = 0;
        this._session = new Session();

        participants.forEach(x => {
            this._session.participants.push(new Person(x.name, x.canBeCox, x.canBeRower));
        });

        this._bestSchedule = null;
    }

    get numberOfTrips(): number {
        return this._numOfTrips;
    }

    start() {
        this.generateNextSchedule();
    }

    stop() {
        this._stopRequested = true;
    }

    generateNextSchedule() {
        if (this._timerToken > 0) {
            clearTimeout(this._timerToken);
            this._timerToken = 0;
        }

        if (!this._stopRequested) {
            var schedule = this._session.generate(this._numOfBoats, this._rowersPerBoat, this._numOfTrips);
            this._iterationCount++;

            this._generatedCount.value = this._iterationCount.toString();

            if (this._bestSchedule == null || schedule.standardDeviation < this._bestSchedule.standardDeviation) {
                this._bestSchedule = schedule;
                this.display(this._bestSchedule);
            }

            this._timerToken = setInterval(() => this.generateNextSchedule());
        }
    }

    display(schedule: Schedule) {
        this._deviationValue.value = schedule.standardDeviation.toFixed(2);
        schedule.drawDistributionMap(this._heatMap);
    }

    showResults(tripNo: number, element: HTMLUListElement) {
        var trip = this._bestSchedule.trips[tripNo];

        trip.Boats.forEach(boat => {
            var boatHeader = document.createElement("li");
            element.appendChild(boatHeader);
            boatHeader.appendChild(document.createTextNode("(C) " + boat.cox.name));
            var boatList = document.createElement("ul");
            boatHeader.appendChild(boatList);
            boat.rowers.forEach(rower => {
                var rowerLine = document.createElement("li");
                boatList.appendChild(rowerLine);
                rowerLine.innerHTML = rower.name;
            });
        });
    }
}

