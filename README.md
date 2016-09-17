# Admin Report Extension

Currently, the tool can configure witch products to include in **Report settings** menu.

> Note: MVC products should start with `Kendo UI`. For example,  `Kendo UI Editor`.

> Important: Never include `for [suite]`. For example `for ASP.NET AJAX`. This is added automatically. 

## How to Configure 

Using **Tampermonkey**. Similarly to the kendo admin extensions: [https://gitlab.telerik.com/gyoshev/admin-tools](https://gitlab.telerik.com/gyoshev/admin-tools).

Example: 

````
// ==UserScript==
// @name         Admin Report Extension
// @namespace    com.telerik.admin.report
// @version      0.1
// @description  Report for Telerik Admin
// @exclude      https://admin.telerik.com/Popup.aspx
// @match        https://admin.telerik.com/*
// @grant        none

// @require https://da7xgjtj801h2.cloudfront.net/2016.2.714/js/jquery.min.js
// @require https://da7xgjtj801h2.cloudfront.net/2016.2.714/js/kendo.web.min.js
// ==/UserScript==

var s = document.createElement('script');
s.src = '//localhost/admin-report-ext/main.js';
document.getElementsByTagName('head')[0].appendChild(s);
````

> Important: `main.js` should be hosted in SSL-enabled environment.

You can also test by using `//idjemere.bedford.progress.com/admin-report-ext/main.js`.

````
var s = document.createElement('script');
s.src = '//idjemere.bedford.progress.com/admin-report-ext/main.js';
document.getElementsByTagName('head')[0].appendChild(s);
````

> Important: Tool is to be updated.