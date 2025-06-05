sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, History, JSONModel) {
    "use strict";

    return Controller.extend("com.crescent.app.stockoverviewreport.controller.StockDetails", {
        onInit: function () {
            // Attach a route-matched handler so that when "/detail/:MaterialGroup/:Plant" is hit, we bind the view.
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // Extract MaterialGroup & Plant from route parameters
            var sMaterialGroup  = decodeURIComponent(oEvent.getParameter("arguments").MaterialGroup);
            var sPlant  = decodeURIComponent(oEvent.getParameter("arguments").Plant);

            // Get the full table data model
            var oTableModel = this.getOwnerComponent().getModel("TableDataModel");
            var aData = oTableModel.getData();

            // Find the selected object based on MaterialGroup and Plant
            var oMatchedData = aData.find(function (item) {
                return item.MaterialGroup.trim() === sMaterialGroup.trim() &&
                       item.Plant.trim() === sPlant.trim();
            });
        
            if (oMatchedData) {
                // Set to new model
                var oDetailModel = new JSONModel(oMatchedData);
                this.getView().setModel(oDetailModel, "DetailModel");
        
                // Bind the whole view to the root of DetailModel
                this.getView().bindElement({
                    path: "/",
                    model: "DetailModel"
                });
            } else {
                sap.m.MessageToast.show("Detail not found for the selected item.");
            }

        },

        onNavBack: function () {
            // Simple back navigation
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // If no history, go to master
                this.getOwnerComponent().getRouter().navTo("RouteReport", {}, true);
            }
        }
    });
});
