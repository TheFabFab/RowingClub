﻿var app = null;
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

var observable = kendo.observable({
    savedData: savedData
});

var data = observable.savedData;

var editedMember = null;

window.onload = function () {
    app = new kendo.mobile.Application(document.body, { initial: "#setup-trip" });
};

function addShow(e) {
    var view = e.view;

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

    view.element.find("#add-member-done").data("kendoMobileButton").bind("click", function () {
        if (editedMember != null && editedMember.name != "") {
            if (editedMember.isNew) {
                editedMember.isNew = false;
                data.push(editedMember);
            }
            editedMember = null;
            kendo.mobile.application.navigate("#:back");
        }
    });

    view.element.find("#add-member-delete").data("kendoMobileButton").bind("click", function () {
        if (editedMember != null) {
            if (!editedMember.isNew) {
                var index = -1;
                var memberIndex = -1;
                data.forEach(function (x) {
                    index++;
                    if (memberIndex == -1 && x.uid == editedMember.uid) {
                        memberIndex = index;
                    }
                });

                if (memberIndex > -1) {
                    data.splice(memberIndex, 1);
                }
            }

            editedMember = null;
            kendo.mobile.application.navigate("#:back");
        }
    });
}

function afterShowAddOrEdit(e) {
    var view = e.view;

    if (view.params.uid !== undefined) {
        var navbar = app.view()
          .header
          .find(".km-navbar")
          .data("kendoMobileNavBar");

        navbar.title("Edit member");
    }
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

function initResults(e) {
    var view = e.view;
    $("#show-results-prev").bind("click", function () {
        var tripNo = parseInt(view.params.trip);

        if (tripNo > 0) {
            kendo.mobile.application.navigate("#show-results?trip=" + (tripNo - 1));
        }
    });

    $("#show-results-next").bind("click", function () {
        var tripNo = parseInt(view.params.trip);

        if (tripNo < calculation.numberOfTrips) {
            kendo.mobile.application.navigate("#show-results?trip=" + (tripNo + 1));
        }
    });
}

function showResults(e) {
    var view = e.view;
    var tripNo = parseInt(view.params.trip);

    $("#show-results-prev").toggle(tripNo > 0);
    $("#show-results-next").toggle(tripNo < calculation.numberOfTrips - 1);

    var element = document.getElementById("result-list-view");
    if (element != null) {
        element.innerHTML = "";
        calculation.showResults(tripNo, element);
        $(element).kendoMobileListView({ type: 'group', style: 'inset'});
    }
}

function afterShowResults(e) {
    var view = e.view;
    var tripNo = parseInt(view.params.trip);

    var navbar = app.view()
      .header
      .find(".km-navbar")
      .data("kendoMobileNavBar");

    navbar.title("Trip #" + (tripNo + 1));
}
