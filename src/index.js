import './global.css';
import App from "./App.svelte";
import { entrypoints } from 'uxp';
//const { entrypoints } = require("uxp");

const app = new App({target:document.body})

entrypoints.setup({
  plugin: { 
    create(e) {},
},
  panels:{
    mainpanel:{
      create(node){        
      },
      show(node,app){
       
      },
      menuItems:[
        {id:"reload",label:"Reload Plugin"}
      ],
      invokeMenu(id){
        switch(id){
          case "reload":
            location.reload();  
          break;
        }
      }
    }
  }
});