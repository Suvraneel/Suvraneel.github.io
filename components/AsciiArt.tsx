"use client";

import { useEffect } from "react";

const AsciiArt = () => {
    // const cssGrad = "background: -webkit-linear-gradient(180deg, #022DDC -41.94%, #8009C6 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;"
    const cssMono = "color: #8009C6"
    const asciiArt = `
                 #######(##((((##               
            ##((((((*(((///////((               
          (((/////,(((//////////(               
         ((//////.(((///////////(               
        ,(///////                               
         /******///(((((((((*                   
          *******************///###((((####     
            /(((((((((((/(/((((((*((((((((((#   
                &*((((((((((((((((    //////((  
                         /((((((((     ///////  
          (((///////((###(////////%%%((///////  
          (/////////(((*////////#%///////////   
          (///////(((*///////(####((/(((/(((((# 
                         ,########      ((((((((
                         ,########       (((((((
                         *(((((((###%%######### 
                         *(((((((#############  
                         /(((((###########      
        `
    useEffect(() => {
        const storageKey = "portfolio-ascii-easter-egg";
        if (window.sessionStorage.getItem(storageKey)) return;

        window.sessionStorage.setItem(storageKey, "true");
        console.log('%c Well, hello Sherlock... You found an Easter Egg! ', 'background: #222; color: #bada55');
        console.log('%c '+asciiArt+' ', cssMono);
    }, [asciiArt]);

    return (
        <></>
    )
}

export default AsciiArt
