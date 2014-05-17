var app = null;
var calculation = null;
var savedData = [
    { name: "A", canBeCox: true, canBeRower: true },
    { name: "B", canBeCox: true, canBeRower: true },
    { name: "C", canBeCox: true, canBeRower: true },
    { name: "D", canBeCox: true, canBeRower: true },
    { name: "E", canBeCox: true, canBeRower: true },
    { name: "F", canBeCox: true, canBeRower: true },
];

var globalParams = kendo.observable({
    numOfBoats: 2,
    rowersPerBoat: 2,
    numOfTrips: 4
});

var data = savedData.map(function (x) {
    return kendo.observable(x);
});

var editedMember = null;

window.onload = function () {
    app = new kendo.mobile.Application(document.body, { initial: "#setup-trip" });
};

function addShow(e) {
    editedMember = null;

    if (e.view.params.uid !== undefined) {
        data.forEach(function (x) {
            if (x.uid == e.view.params.uid) {
                editedMember = x;
            }
        });
    }

    if (editedMember === null) {
        editedMember = kendo.observable({ name: "", canBeCox: true, canBeRower: true, isNew: true });
    }

    kendo.bind(e.view.element, editedMember, kendo.mobile.ui);
}

function addInit(e) {
    var view = e.view;
    view.element.find("#done").data("kendoMobileButton").bind("click", function () {
        if (editedMember != null && editedMember.name != "") {
            if (editedMember.isNew) {
                editedMember.isNew = false;
                data.push(editedMember);
            }
            editedMember = null;
            kendo.mobile.application.navigate("#:back");
        }
    });
}

function setupTripShow(e) {
    kendo.bind(e.view.element, globalParams, kendo.mobile.ui);
}

function afterShowSetup() {
    $("#setup-list").kendoMobileListView({
        dataSource: data,
        template: "<a>#=name#</a>",
        click: function (e) {
            kendo.mobile.application.navigate("#add-member?uid=" + e.dataItem.uid);
        }
    });
}

function afterShowCalculation() {
    calculation = new Tester(data, globalParams.numOfBoats, globalParams.rowersPerBoat, globalParams.numOfTrips);
    calculation.start();
}

function beforeHideCalculation() {
    calculation.stop();
}

function afterShowResults() {
    var element = document.getElementById("result-list-view");
    if (element != null) {
        calculation.showResults(element);
        $(element).kendoMobileListView({});
    }
}
