mwls = {
  lib: 'xui', //or 'jquery' this is the library to use
  storeName: 'mwls', // default name of the localstorage to use
  identifier: window.location.href.split("/")[window.location.href.split("/").length-1], // how to identify the item in the store. can be replaced with some other function.
  capturedMetaData: { "access-date": new Date().getTime(), "page-url": window.location.href},
  storeData: {},
  pruneAttributes: ["data-ur-set", "data-ur-zoom-component"],
  completed: {},
  debugMode: true,

  //Debug utility (only writes to the console if debugMode is set to true)
  
  debug: function(log) {
    if(this.debugMode === true) {
      console.log(log);
    }
  },

  /******************************
  Capturing the stuff for storage
  ******************************/
  // ^ wow this looks like barbed wire

  // function specialized for xui
  capture_xui: function(selector) {
    // return an object containing 
    var pageData={};
    x$(selector).each(function(e, i, x){
      // e: current element
      // i: index in the list
      // x: xui collection
      // console.log(e);
      pageData[e.attributes['data-mwls-local'].value] = e.innerHTML.replace("\t", "").replace(/\n+/, "");
      
      // Meta data (stuff that isn't present in the DOM)
      pageData["metadata"]= mwls.capturedMetaData;
    });
    this.debug(pageData);
    if(pageData.metadata) {
      return pageData;
    }
    
  },

  // function specialized for jquery
  capture_jquery: function(selector) {
    // return an object containing 
    var pageData={};
    $(selector).each(function(e, i){
      // e: current element
      // i: index in the list
      // console.log(e);
      pageData[e.attributes['data-mwls-local'].value] = e.innerHTML.replace("\t", "").replace(/\n+/, "");
      
      // Meta data (stuff that isn't present in the DOM)
      pageData["metadata"]= mwls.capturedMetaData;
    });
    this.debug(pageData);
    if(pageData.metadata) {
      return pageData;
    }
  },

  // Generalized function
  capture: function(selector) {
    // put the capture into the database
    //var capturedData = {}; //
    
    if (this.lib=="xui") {
      mwls.debug(this.store);
      // console.log(this.capture_xui(selector));
      mwls.debug(mwls.identifier);
      // Check that there is 
      if(x$("[data-mwls-local]").length>0) {
        mwls.debug("local storage tags found");
        mwls.storeData[mwls.identifier] = mwls.capture_xui(selector);
        mwls.debug("mwls storeData after capture_xui");
        mwls.debug(mwls.storeData);
      } else {
        mwls.debug("no local storage tags found");
      }

    } else if (this.lib=="jquery") {
      this.store[this.identifier] = this.capture_jquery(selector);
    }
    else {
      this.debug("No sutible DOM library found");
    }

    this.save();
  },

  save: function() {
    // stringify the information and place into storage
    mwls.debug("storing data");
    mwls.debug(mwls.storeData)
    //localStorage[mwls.storeName] = JSON.stringify(mwls.storeData);
    window.localStorage.setItem('mwls', JSON.stringify(mwls.storeData));
    mwls.debug("data saved");
  },

  /************************
  Template reading function
  ************************/

  readTemplate_xui: function() {
    // Load the template data
    var mwlsTemplate = x$("[data-mwls-component=template]");
    var wrapper = document.createElement("div");
    var sortData = [];

    //Allow for preprocessing of the data
    for (var j in mwls.storeData) {
      sortData.push(mwls.storeData[j]);
      console.log(j);
    }
    console.log("sortData");
    console.log(sortData);
    console.log("-------");

    for (j in mwls.storeData) {
      // Get the template, fill it with the data from the local storage
      console.log("j in soreData");
      console.log(j);
      console.log("-------");
      var b = mwlsTemplate[0].cloneNode(true);
      b.removeAttribute("data-mwls-component"); // Remove the Template tag
      x$(b).find("[data-mwls-template-component]").each(function(e, i, x){
        // wrapper = document.createElement("div");
        // a.appendChild(wrapper)
        // e: current element
        // i: index in the list
        // x: xui collection
        
        //console.log("e");
        //console.log(e);
        //console.log("e.attributes['data-mwls-template-component'].value");
        //console.log(e.attributes['data-mwls-template-component'].value);
        //console.log("mwls.storeData[j]");
        //console.log(mwls.storeData[j]);
        e.innerHTML = mwls.storeData[j][e.attributes['data-mwls-template-component'].value];
        //console.log("e.innerHTML");
        //console.log(e.innerHTML);
        //console.log(e.cloneNode());
        //b.appendChild(e.cloneNode());
        e.removeAttribute("data-mwls-template-component"); // Remove component tag

        // Remove any vestigial uranium
        /*for (iii in mwls.pruneAttributes) {
          x$(e).find(iii).each(function(ee, ii ,xx) {
              ee.removeAttribute(iii);
          });
        }*/
        
      });
      // Apply attribute Metadata as necessary
      x$(b).find("[data-mwls-template-metadata-attribute]").each(function(e, i, x){
        e.setAttribute(e.attributes["data-mwls-template-metadata-attribute"].value,mwls.storeData[j]['metadata'][e.attributes["data-mwls-template-metadata-data"].value]);
        e.removeAttribute("data-mwls-template-metadata-attribute"); e.removeAttribute("data-mwls-template-metadata-data");
      });

      // Apply innerText Metadata as necessary
      /*x$(b).find("[data-mwls-template-metadata=attribute]").each(function(e, i, x){

      });*/
      wrapper.appendChild(b);
    }
    //console.log(a);
    x$("[data-mwls-component='template-container']")[0].appendChild(wrapper);
  },

  readTemplate_jquery: function() {

  },

  readTemplate: function() {
    if (this.lib=="xui") {
      this.debug("using uxi");
      mwls.readTemplate_xui();
    } else if (this.lib=="jquery") {
      this.debug("using jquery");

    } else {
      this.debug("No sutible DOM library found");
    }
  },


  // Check if the store with the current identifier exists in the database
  // checkStore: function(identifier) {
  //   return (localStorage[this.storeName][this.identifier]);
  // },

  // Setup utility
  setup: function() {
    // check if jQuery is available or default to xui?
    if(typeof(xui)=="function") {
      this.lib = 'xui';
    }
    // if(typeof(jQuery)=="function") {
    //   this.lib = 'jquery';
    // }
    this.debug("Current library is: "+ this.lib);

    if(!localStorage[this.storeName]) {
      // If we do not have any previous storage, set one up
      localStorage[this.storeName] = JSON.stringify([]);
      this.debug("No storage found, created one");
    } else {
      // there is a previous store, retrieve the items.
      // mwls.storeData = JSON.parse(localStorage[mwls.storeName]);
      mwls.storeData = JSON.parse(window.localStorage.getItem(mwls.storeName));
      this.debug("Storage found, parsing data");
    }

    // Capture data from the DOM
    this.capture("[data-mwls-local]");
    this.readTemplate();
    this.completed;
  }
}