class Tester {
    element: HTMLElement;
    span: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);

        var session = new Session();

        session.participants.push(new Person("A", true, true));
        session.participants.push(new Person("B", true, true));
        session.participants.push(new Person("C", true, true));
        session.participants.push(new Person("D", true, true));
        session.participants.push(new Person("E", true, true));
        session.participants.push(new Person("F", false, true));
        session.participants.push(new Person("G", false, true));
        session.participants.push(new Person("H", false, true));
        session.participants.push(new Person("I", false, true));

        //session.participants.push(new Person("Michael", true, true));
        //session.participants.push(new Person("Annette", false, true));
        //session.participants.push(new Person("Jakob", false, true));
        //session.participants.push(new Person("Carsten", true, true));
        //session.participants.push(new Person("Mogens", false, true));
        //session.participants.push(new Person("Soren", false, true));
        //session.participants.push(new Person("Poul", true, true));
        //session.participants.push(new Person("Klaus", true, true));
        //session.participants.push(new Person("Amin", true, true));

        var trips = session.generate(3, 2, 6);

        //var nonIdenticalPermutation = CombinatoricsEx.permute([1, 2, 3, 4]);
        //var identicalPermutation = CombinatoricsEx.permute([0, 0, 1, 2]);
        //var grouping = CombinatoricsEx.group([10, 20, 30, 40, 50, 60], 2, 2);

        var list = document.createElement('ol');
        trips.forEach(trip => {
            list.innerHTML += "<li>" + trip.toString() + "</li>";
        });

        this.span.appendChild(list);

        var coxes = Enumerable
            .from(session.participants)
            .where(p => (<Person>p).canBeCox)
            .toArray();

        var rowers = Enumerable
            .from(session.participants)
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

        //var c = Combinatorics.C(10, 3);
        //var p = Combinatorics.P(4, 2);
        //var permutationGenerator = Combinatorics.permutation(session.participants, 2);
        //var count = permutationGenerator.length;
        //var first = permutationGenerator.next();
    }

    start() {
    }

    stop() {
    }

}

window.onload = () => {
    var el = document.getElementById('content');

    var tester = new Tester(el);

    tester.start();
};  