class Tester {
    element: HTMLElement;
    span: HTMLElement;

    _generatedCount: HTMLInputElement;
    _deviationValue: HTMLInputElement;
    _heatMap: HTMLElement;

    _session: Session;
    _bestSchedule: Schedule;
    _timerToken: number;
    _iterationCount: number;
    _stopRequested: boolean;

    constructor(element: HTMLElement) {
        this._generatedCount = <HTMLInputElement>document.getElementById("generated-count");
        this._deviationValue = <HTMLInputElement>document.getElementById("deviation-value");
        this._heatMap = document.getElementById("heat-map");

        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this._iterationCount = 0;
        this._timerToken = 0;
        this._session = new Session();

        //this._session.participants.push(new Person("A", true, true));
        //this._session.participants.push(new Person("B", true, true));
        //this._session.participants.push(new Person("C", true, true));
        //this._session.participants.push(new Person("D", true, true));
        //this._session.participants.push(new Person("E", true, true));
        //this._session.participants.push(new Person("F", true, true));
        //this._session.participants.push(new Person("G", false, true));
        //this._session.participants.push(new Person("H", false, true));
        //this._session.participants.push(new Person("I", false, true));

        this._session.participants.push(new Person("Michael", true, true));
        this._session.participants.push(new Person("Annette", false, true));
        this._session.participants.push(new Person("Jakob", false, true));
        this._session.participants.push(new Person("Carsten", true, true));
        this._session.participants.push(new Person("Mogens", false, true));
        this._session.participants.push(new Person("Soren", false, true));
        this._session.participants.push(new Person("Poul", true, true));
        this._session.participants.push(new Person("Klaus", true, true));
        this._session.participants.push(new Person("Amin", true, true));

        this._bestSchedule = null;
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
            var schedule = this._session.generate(2, 2, 16);
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

        this.span.innerHTML = "";

        this.span.innerHTML = "<p>Current deviation: " + schedule.standardDeviation + "</p>";

        var trips = schedule.trips;

        var list = document.createElement('ol');
        trips.forEach(trip => {
            list.innerHTML += "<li>" + trip.toString() + "</li>";
        });

        this.span.appendChild(list);

        var coxes = Enumerable
            .from(schedule.participants)
            .where(p => (<Person>p).canBeCox)
            .toArray();

        var rowers = Enumerable
            .from(schedule.participants)
            .where(p => (<Person>p).canBeRower)
            .toArray();

        var coxRowerTable = document.createElement('table');

        var tableHtml = "<tr><td>\</td>";
        rowers.forEach(x => {
            var rower = <Person>x;
            tableHtml += "<td>" + rower.name + "</td>";
        });

        tableHtml += "</tr>";

        coxes.forEach(x => {
            var cox = <Person>x;

            var coxCount = Enumerable
                .from(trips)
                .selectMany(t => (<Trip>t).Boats)
                .where(b => (<Boat>b).cox === cox)
                .count();

            tableHtml += "<tr><td>" + cox.name + "(" + coxCount + "x)</td>";

            rowers.forEach(y => {
                var rower = <Person>y;

                var count = Enumerable
                    .from(trips)
                    .selectMany(t => (<Trip>t).Boats)
                    .where(b => Enumerable.from((<Boat>b).rowers).any(r => r === rower))
                    .where(b => (<Boat>b).cox === cox)
                    .count();

                tableHtml += "<td>" + count + "</td>";
            });

            tableHtml += "</tr>";
        });

        coxRowerTable.innerHTML = tableHtml;

        this.span.appendChild(coxRowerTable);
    }

    showResults(element: HTMLUListElement) {
        this._bestSchedule.trips.forEach((trip, tripIndex) => {
            var tripHeader = document.createElement("li");
            tripHeader.setAttribute("data-icon", "globe");
            element.appendChild(tripHeader);
            //tripHeader.innerText = "Trip #" + (tripIndex + 1);
            tripHeader.appendChild(document.createTextNode("Trip #" + (tripIndex + 1)));
            var tripList = document.createElement("ul");
            tripHeader.appendChild(tripList);

            trip.Boats.forEach(boat => {
                var boatHeader = document.createElement("li");
                boatHeader.setAttribute("data-icon", "globe");
                tripList.appendChild(boatHeader);
                boatHeader.appendChild(document.createTextNode("(C) " + boat.cox.name));
                var boatList = document.createElement("ul");
                boatHeader.appendChild(boatList);
                boat.rowers.forEach(rower => {
                    var rowerLine = document.createElement("li");
                    boatList.appendChild(rowerLine);
                    rowerLine.innerHTML = "<a>" + rower.name + "</a>";
                });
            });
        });
    }
}

