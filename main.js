
if(!window.adminTools) {
    $("head").append(
            '<link rel="stylesheet" href="//kendo.cdn.telerik.com/2016.2.714/styles/kendo.common.min.css"/>' +
            '<link rel="stylesheet" href="//kendo.cdn.telerik.com/2016.2.714/styles/kendo.silver.min.css"/>'
        );
}

$("head").append(
    `
    <style>
        .k-button.rs-add, 
        .k-button.rs-minus {
            width: 30px;
            height: 23px;
        }
    </style>
    `
)

// Report Settings

var reportSettings = {
    defaultSettings: {
                products:[
                            {
                                "id": 0,
                                "text": "Kendo UI",
                                "items": [
                                    {
                                        "text": "Editor",
                                        "fullText": "Editor for Kendo UI",
                                        "parent": "0"
                                    }
                                ],
                                "expanded": false
                            },
                            {
                                "id": 1,
                                "text": "ASP.NET MVC",
                                "items": [
                                    {
                                        "text": "Editor",
                                        "fullText": "Editor for ASP.NET MVC",
                                        "parent": "1"
                                    }
                                ],
                                "expanded": false
                            },
                            {
                                "id": 2,
                                "text": "ASP.NET AJAX",
                                "items": [
                                    {
                                        "text": "RadEditor",
                                        "fullText": "RadEditor for ASP.NET AJAX",
                                        "parent": "2"
                                    }
                                ],
                                "expanded": false
                            }
                        ]
            },  

           


    reportDialogTemplate: `<div id='rs-treeview'></div></br>
                            <button class='k-button' onclick='reportSettings.restoreDefault();'>Restore Defaults</button>`,

    openReportSettings: function(){
        this.settingsWindow.center().open();
    },

    setupSettingsWindow: function(){
        this.settingsWindow.content(this.reportDialogTemplate);

        $("#rs-treeview").kendoTreeView({
            dataSource: this.settings.products,
            template: `#: item.text # 
                        # if(item.items){ 
                            # <button class='k-button rs-add' value='#= item.id #'><span class='k-font-icon k-i-plus' /></button> #              
                        } else {             
                            # <button class='k-button rs-minus' value='#= item.fullText #'><span class='k-font-icon k-i-minus' /></button> #  
                        } #`          
        }); 

        this.treeView = $("#rs-treeview").data("kendoTreeView");
    },

    setupLocalStorage: function(){
        var settings = localStorage.getItem("reportSettings");

        if(!settings){
            settings = this.defaultSettings;
            localStorage.setItem("reportSettings", JSON.stringify(settings));
            
        }else{
            settings = JSON.parse(settings);
        }

        //Collapse all items.
        for (var key in settings.products) {
            settings.products[key].expanded = false;
        }

        this.settings = settings;
    },

    restoreDefault:function(){
        this.settings = this.defaultSettings;
        this.syncLocalStorage();
    },

    syncLocalStorage: function(){
        localStorage.removeItem("reportSettings");
        localStorage.setItem("reportSettings", JSON.stringify(this.settings));
        this.treeView.dataSource.data(this.settings.products);
    },

    bindEvents: function(){
        var clickHandler = $.proxy(this.clickTreeViewHandler,this);
        $(this.treeView.element).click(clickHandler);
    },

    clickTreeViewHandler: function(ev){
        var button = $(ev.target).closest("button");
        
        if(button.is(".rs-add")){
            this.addProduct(button.val());
        }else if (button.is(".rs-minus")){
            this.removeProduct(button.val());
        }
    },

    addProduct: function(value){
        var index = value;
        var dataItem = this.treeView.dataItems()[index];
        var product = prompt("Type product", "RadEditor");
        if(product){
            var fullText = product + " for " + dataItem.text;
            this.settings.products[index].expanded = true;
            this.settings.products[index].items.push({text: product, fullText: fullText, parent: index});
            this.syncLocalStorage();     
        } 
    },

    removeProduct: function(value){
        var item = null;
        for (var key in this.settings.products) {
            item = this.settings.products[key].items.find(function(obj){
                return obj.fullText == value;
            });

            if(item){
                break;
            }
            
        }
        
        var index = this.settings.products[item.parent].items.indexOf(item);
        this.settings.products[item.parent].items.splice(index, 1);
        this.syncLocalStorage();
    },

    initialize: function(){
        this.settingsWindow = $("#rs-dialog").data("kendoWindow");
        this.setupLocalStorage();
        this.setupSettingsWindow();
        this.bindEvents();
    }
}

$("<button type='button'><span class='k-font-icon k-i-rows' /> Report settings</button>")
    .css({
        position: "absolute",
        zIndex: 10000,
        top: 47,
        right: 10
    })
    .prependTo("body")
    .kendoButton({
        click: function(){reportSettings.openReportSettings()}
        
    });


$("<div id='rs-dialog'></div>").prependTo("body").kendoWindow({
    title: "Report Settings"
});

reportSettings.initialize();



// Send Report

var sendReport = {
    products: [],
    tickets: [],
    groups: {},

    generateReport: function(){
        if(this.tickets.length <= 0) this.filterExpiring();

        var report = "";

        for (var index in this.tickets) {
            var product = this.tickets[index].product;
            if(this.groups[product]){
                this.groups[product] += 1;
            }else{
                this.groups[product] = 1;
            }
        }

        for (var key in this.groups) {
            report = report + key + " : " + this.groups[key] + "</br>";
        }

        radalert(report, 500, null, "Report");

        this.groups = {};
        this.tickets = [];
        this.products = [];
    },

    tomorrow10am: function () {
        var result = new Date();

        result.setDate(result.getDate() + 1);
        result.setHours(10);
        result.setMinutes(0);

        return result;
    },

    filterExpiring: function () {
        var now = new Date();
        var hoursUntilTomorrow = (this.tomorrow10am() - now) / (1000 * 60 * 60);

        if(this.tickets.length <= 0) this.getTickets();

        this.tickets = this.tickets.filter(function(item) {
            var hours = item.dueTime;
            return parseInt(hours, 10) < hoursUntilTomorrow;
        });
    },

    getTickets:function (){
        if(this.products.length <= 0) this.generateProducts();

        var radGrid = $("[id$='datagridMessages']")[0].control;
        var masterTable = radGrid.get_masterTableView();
        var items = masterTable.get_dataItems();

        for (var index in items) {
            var item = items[index];
            var dueTime = masterTable.getCellByColumnUniqueName(item, "TemplateColumn1").innerText;
            var isAssigned = masterTable.getCellByColumnUniqueName(item, "AssignTo").innerText;
            var product = $(".gridImgProductIcon", masterTable.getCellByColumnUniqueName(item, "Product")).attr("title");

            if(this.products.indexOf(product) >= 0){
                this.tickets.push({dueTime: dueTime, isAssigned: isAssigned, product: product});
            }
        }

    },

    generateProducts: function (){
        for (var key in reportSettings.settings.products) {
            var items = reportSettings.settings.products[key].items;
            for (var i in items) {
                this.products.push(items[i].fullText);
            }
        }
        
    }
};


$("<button type='button'><span class='k-font-icon k-i-print' /> Generate Report</button>")
    .css({
        position: "absolute",
        zIndex: 10000,
        top: 47,
        right: 132
    })
    .prependTo("body")
    .kendoButton({
        click: function(){sendReport.generateReport()}
        
    });

// TemplateColumn
// TemplateColumn1
// Priority
// AssignTo
// Product
// TemplateColumn2
// Subject
// MaxSentMessageDate
// TemplateColumn4
// Client
// TemplateColumn5
// Rating
// OwnerTimeZone
// DomainName