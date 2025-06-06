sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/m/MessageBox',
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/m/Dialog",
    "sap/m/BusyIndicator",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Label, Filter, FilterOperator, PersonalizableInfo, MessageBox, exportLibrary, Spreadsheet, MessageToast, CustModels, PDFViewer, Dialog, BusyIndicator, VBox, Text, Fragment) => {
    "use strict";

    return Controller.extend("com.crescent.app.stockoverviewreport.controller.Report", {
        onInit() {

            //this.getView().setModel(this.oModel);
            this.oModel = new JSONModel();
            var oNewModel = this.getOwnerComponent().getModel("ZSB_STOCK_OVERVIEW_REP");

            sap.ui.getCore().setModel(this.oModel, "UIDataModel");
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Visible", true);
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Invisible", false);
            //this.applyData = this.applyData.bind(this);
            //this.fetchData = this.fetchData.bind(this);
            //this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oSmartVariantManagement = this.getView().byId("svm");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oTable = this.getView().byId("table");

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            var oPersInfo = new PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

            this.getPlantF4Data();

        },
        getPlantF4Data: function () {

            var that = this;
            var oModel = this.getOwnerComponent().getModel("ZSB_STOCK_OVERVIEW_REP");
            var pUrl = "/ZR_PLANT_F4"
            oModel.read(pUrl, {
                success: function (response) {
                    var oData = response.results;
                    console.log(oData);

                    var oPlantModel = that.getOwnerComponent().getModel("plantModel");
                    oPlantModel.setData(oData);

                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(error);

                    var errorObject = JSON.parse(error.responseText);
                    sap.m.MessageBox.warning(errorObject.error.message.value);

                }
            });
        },
        onDialogEquipmentNumber: function () {
            new CustModels();
        },

        onExit: function () {
            this.oModel = null;
            this.oSmartVariantManagement = null;
            this.oExpandedLabel = null;
            this.oSnappedLabel = null;
            this.oFilterBar = null;
            this.oTable = null;
        },
        onPressText: function () {
            this.oTable.removeSelections(true);
            var oModel = sap.ui.getCore().getModel("UIDataModel");
            oModel.setProperty('/Visible', !oModel.getProperty('/Visible'));
            oModel.setProperty('/Invisible', !oModel.getProperty('/Invisible'));
        },
        getDateFormatString: function (fullDate) {
            var oDate = fullDate.getDate();
            if (oDate < 10) {
                oDate = "0" + oDate.toString();
            }
            var oMonth = fullDate.getMonth() + 1;
            if (oMonth < 10) {
                oMonth = "0" + oMonth.toString();
            }
            var oYear = fullDate.getFullYear();

            var oDateStr = oYear + "-" + oMonth + "-" + oDate;
            return oDateStr;

        },
        onSearch: function () {
            var that = this;
            var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl instanceof sap.m.DatePicker) {
                    var aSelectedKeys = oControl.getDateValue();
                    if (aSelectedKeys != null) {
                        var oDateStr = that.getDateFormatString(aSelectedKeys);
                        aResult.push(oDateStr);
                    } else {
                        // var arrayOfStrings = oControl.getId().split('-');
                        // var oMessage = "";
                        // var str = ["fromDate", "toDate"];
                        // var found = arrayOfStrings.find(v => str.includes(v));
                        // if (found == "fromDate") {
                        //     oMessage = "Please Fill in the compulsory From-Date Fields";
                        // } else if (found == "toDate") {
                        //     oMessage = "Please Fill in the compulsory To-Date Fields";
                        // }
                        // else {
                        //     oMessage = "Please Fill in the compulsory Fields";
                        // }

                        // MessageBox.error(oMessage);

                        // return;
                    }

                }
                //aSelectedKeys = oControl.getSelectedKeys(),
                /*aFilters = aSelectedKeys.map(function (sSelectedKey) {
                    return new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.Contains,
                        value1: sSelectedKey
                    });
                });
                
            if (oDate.length > 0) {
                aResult.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
*/
                return aResult;
            }, []);
            // var oUrl = "/ZC_METER_READING_REPORT(pa_data_from=" + aTableFilters[0] + ",pa_data_to=" + aTableFilters[1] + ")/Set"

            // var oTableJsonModel = this.getDataFromBackend(oUrl);


            // For extract From and To Date
            this.fromDate = aTableFilters[0];
            this.toDate = aTableFilters[1];
            // End

            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            oGlobalModel.setProperty("/fromDate", this.fromDate);
            oGlobalModel.setProperty("/toDate", this.toDate);

            this.getDataFromBackend2();


            /*this.oTable.bindItems({
                path: oUrl,
                template: that.oTable.getBindingInfo("items").template
            });*/
            //this.oTable.getBinding("items").filter(aTableFilters);
            //this.oTable.setShowOverlay(false);
        },
        _validateInputFields: function () {

            var inputFuncLoct = this.byId("idFunctionalLocationInput");
            var inputfromDate = this.byId("fromDate");
            var inputtoDate = this.byId("toDate");

            var inputFuncLoctValue = inputFuncLoct.getValue();

            var isValid = true;
            var message = '';

            if (!inputfromDate.getValue()) {
                inputfromDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'From Date , ';
            } else {
                inputfromDate.setValueState(sap.ui.core.ValueState.None);
            }
            if (!inputtoDate.getValue()) {
                inputtoDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'To Date , ';
            } else {
                inputtoDate.setValueState(sap.ui.core.ValueState.None);
            }
            if (!inputFuncLoct.getValue()) {
                inputFuncLoct.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'Functional Location , ';
            } else {
                inputFuncLoct.setValueState(sap.ui.core.ValueState.None);
            }

            if (!isValid) {
                // Remove the last comma and space from the message
                // message = message.slice(0, -2);
                // sap.m.MessageBox.error("Please fill up the following fields: " + message);
                return false;
            }

            return true;
        },
        onDateChange: function () {
            var oFromDate = this.getView().byId("fromDate");
            var oToDate = this.getView().byId("toDate");

            var sFromDate = oFromDate.getDateValue();
            var sToDate = oToDate.getDateValue();

            if (sFromDate && sToDate) {
                if (sToDate < sFromDate) {
                    sap.m.MessageBox.error("To Date cannot be earlier than From Date.");
                    oToDate.setValue("");
                }
            }
        },
        getDataFromBackend2: function () {
            // if (!this._validateInputFields()) {
            //     // Validation failed, return without fetching data
            //     return;
            // }
            var that = this;
            var oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();
            var oNewModel = this.getOwnerComponent().getModel("ZSB_STOCK_OVERVIEW_REP");

            var pUrl = "/ZI_STOCK_MOVEMENT_REP_BASE(p_date_low=datetime'" + oGlobalModelData.fromDate + "T00:00:00',p_date_high=datetime'" + oGlobalModelData.toDate + "T00:00:00')/Set";

            sap.ui.core.BusyIndicator.show();
            oNewModel.read(pUrl, {
                // filters: aFilters,
                success: function (response) {
                    var oData = response.results;
                    console.log(oData);
                    if (!oData || oData.length == 0) {
                        sap.m.MessageBox.warning("No Data Available!");
                    }
                    // Format MaterialGroup field
                    oData.forEach(function (item) {
                        item.MaterialGroupCombined = item.MaterialGroup_Text + " (" + item.MaterialGroup + ")";
                    });
                    // Set Table Data
                    var oTableDataModel = that.getView().getModel("TableDataModel");
                    oTableDataModel.setData(oData);

                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(error);

                    var errorObject = JSON.parse(error.responseText);
                    sap.m.MessageBox.warning(errorObject.error.message.value);

                }
            });
        },
        onPressRow: function (oEvent) {
            // Extract the binding context of the pressed row
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("TableDataModel");
            var sMaterialGroup = oContext.getProperty("MaterialGroup");
            var sPlant = oContext.getProperty("Plant");

            // Navigate to "detail" route, passing both keys
            this.getOwnerComponent().getRouter().navTo("detail", {
                MaterialGroup: encodeURIComponent(sMaterialGroup),
                Plant: encodeURIComponent(sPlant)
            });
        },
        onOpenPlantDialog: function () {
            var oView = this.getView();
            if (!oView.byId("idPlantDialog")) {
                sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.crescent.app.stockoverviewreport.Fragment.PlantInput",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog)
                    oDialog.open();
                })
            } else {
                oView.byId("idPlantDialog").open();
            }
        },
        onClosePlantDialog: function () {
            this.byId("idPlantDialog").close();
        },
        // onSelectFunctionalLocation: function () {
        //     var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
        //     var oList = this.byId("idFunctionalLocationList");
        //     var aSelectedItems = oList.getSelectedItems();
        //     var aSelectedValues = [];
        //     var aSelectedID = [];

        //     // Extract selected Functional Locations
        //     aSelectedItems.forEach(function (oItem) {
        //         aSelectedValues.push(oItem.getTitle()); // FunctionalLocation Name
        //         aSelectedID.push(oItem.getDescription()); // FunctionalLocation ID
        //     });


        //     // Show selected values in Input field
        //     var sValue = aSelectedValues.join(", ");
        //     this.byId("idFunctionalLocationInput").setValue(sValue);

        //     oGlobalModel.setProperty("/selectedFunctionalLocationsID", aSelectedID);   // Store Array Functional Location Id

        //     /// Get Functional Location Input Value
        //     var sFunctionalLocationValues = this.byId("idFunctionalLocationInput").getValue(); // Comma-separated values

        //     var aFunctionalLocationArray = sFunctionalLocationValues.split(", "); // Convert to array
        //     // Store Functional Locations Name in Global Model
        //     oGlobalModel.setProperty("/selectedFunctionalLocations", aFunctionalLocationArray);  // Store Array Functional Location Name

        //     var oSearchField = this.byId("idFunctionalLocationSearchField");  // Remove Search Field
        //     oSearchField.setValue("");
        //     var oBinding = oList.getBinding("items");
        //     if (oBinding) {
        //         oBinding.filter([]); // Remove filters
        //     }

        //     oList.removeSelections(true); // Removes all List selections

        //     var oSelectAllCheckBox = this.byId("selectAllCheckBoxFunctionalLocation");
        //     if (oSelectAllCheckBox) {
        //         oSelectAllCheckBox.setSelected(false);
        //     }

        //     // Close the dialog
        //     this.byId("idFunctionalLocationDialog").close();
        // },

        // onFunctionalLocationClear: function (oEvent) {
        //     var sValue = oEvent.getParameter("value"); // Get the input value
        //     var oList = this.byId("idFunctionalLocationList"); // Get the list
        //     var oGlobalModel = this.getOwnerComponent().getModel("globalModel");

        //     if (!sValue) {    // If input is empty, clear selection
        //         oList.removeSelections(true); // Deselect all items
        //         oGlobalModel.setProperty("/selectedFunctionalLocationsID", "");
        //         oGlobalModel.setProperty("/selectedFunctionalLocations", "");
        //     }
        // },
        // onSearchFunctionalLocation: function (oEvent) {
        //     var sQuery = oEvent.getParameter("newValue"); // Get search input
        //     var oList = this.byId("idFunctionalLocationList");
        //     if (!oList) {
        //         console.error("List not found!");
        //         return;
        //     }

        //     var oBinding = oList.getBinding("items"); // Get binding of the List
        //     if (!oBinding) {
        //         console.error("List binding not found!");
        //         return;
        //     }

        //     var aFilters = [];
        //     if (sQuery && sQuery.length > 0) {
        //         var oFilter1 = new sap.ui.model.Filter("FunctionalLocationName", sap.ui.model.FilterOperator.Contains, sQuery);
        //         var oFilter2 = new sap.ui.model.Filter("FunctionalLocation", sap.ui.model.FilterOperator.Contains, sQuery);
        //         aFilters.push(new sap.ui.model.Filter({
        //             filters: [oFilter1, oFilter2],
        //             and: false // Match either FunctionalLocationName or FunctionalLocation
        //         }));
        //     }

        //     // Apply the filters to the list binding
        //     oBinding.filter(aFilters);
        // },
        // onSelectAllChange: function (oEvent) {
        //     var bSelected = oEvent.getParameter("selected"); // CheckBox state
        //     var oList = this.byId("idFunctionalLocationList");
        //     if (!oList) {
        //         console.error("List not found!");
        //         return;
        //     }

        //     var aItems = oList.getItems(); // Get all list items

        //     // Select or Deselect all list items based on CheckBox state
        //     aItems.forEach(function (oItem) {
        //         oItem.setSelected(bSelected);
        //     });;
        // }
    });
});