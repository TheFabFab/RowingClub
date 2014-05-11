class Tester {
    element: HTMLElement;
    span: HTMLElement;
    counter: HTMLElement;
    _session: Session;
    _bestSchedule: Schedule;
    _timerToken: number;
    _iterationCount: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.counter = document.createElement('span');
        this.element.appendChild(this.counter);
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this._iterationCount = 0;
        this._timerToken = 0;
        this._session = new Session();

        this._session.participants.push(new Person("A", true, true));
        this._session.participants.push(new Person("B", true, true));
        this._session.participants.push(new Person("C", true, true));
        this._session.participants.push(new Person("D", true, true));
        this._session.participants.push(new Person("E", true, true));
        this._session.participants.push(new Person("F", true, true));
        //this._session.participants.push(new Person("G", false, true));
        //this._session.participants.push(new Person("H", false, true));
        //this._session.participants.push(new Person("I", false, true));

        //session.participants.push(new Person("Michael", true, true));
        //session.participants.push(new Person("Annette", false, true));
        //session.participants.push(new Person("Jakob", false, true));
        //session.participants.push(new Person("Carsten", true, true));
        //session.participants.push(new Person("Mogens", false, true));
        //session.participants.push(new Person("Soren", false, true));
        //session.participants.push(new Person("Poul", true, true));
        //session.participants.push(new Person("Klaus", true, true));
        //session.participants.push(new Person("Amin", true, true));

        this._bestSchedule = null;
    }

    start() {
        this.generateNextSchedule();
    }

    stop() {
    }

    generateNextSchedule() {
        if (this._timerToken > 0) {
            clearTimeout(this._timerToken);
            this._timerToken = 0;
        }

        var schedule = this._session.generate(2, 2, 16);
        this._iterationCount++;

        this.counter.innerHTML = "<p>Schedules generated: " + this._iterationCount + "</p>";

        if (this._bestSchedule == null || schedule.standardDeviation < this._bestSchedule.standardDeviation) {
            this._bestSchedule = schedule;
            this.display(this._bestSchedule);
        }

        this._timerToken = setInterval(() => this.generateNextSchedule());
    }

    display(schedule: Schedule) {
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
}

window.onload = () => {
    var el = document.getElementById('content');

    var tester = new Tester(el);

    tester.start();
};  