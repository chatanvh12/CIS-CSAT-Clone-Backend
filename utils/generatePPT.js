// const pptx = require("pptxgenjs");
import pptxgen from "pptxgenjs";
import {getImage} from "./generateImage.js";
import { json } from "express";

async function generatePPT() {
    // const ppt = new pptx();
    const pptx = new pptxgen();

    let date = new Date().toLocaleDateString();
    pptx.addSlide().addText('AppRely Technologies', {
        x: 0,
        y: 2.56,
        w: 10,
        h: 0.5,
        fontSize: 50,
        color: '000000',
        align: "center"
    })
        .addText(
            "Cybersecurity SaaS Tool",
            {
                x: 0,
                y: 3.59,
                w: 10,
                h: 0.5,
                fontSize: 30,
                color: "000000",
                align: "center"
            }
        )
        .addText(` . . By Apprely Technology`,
            {
                x: 0.5,
                y: 5,
                w: "100%",
                h: 1,
                align: "center",
                fontSize: 12
            });
            let data=await getImage();
            // data=await JSON.parse(data)


            // const data = [
            //     {id:1, name: 'Bananas', qty: 2000 },
            //     {id:2,name: 'Apples', qty: 1500 },
            //     {id:3,name: 'Oranges', qty: 1000 }
            // ];
            // console.log(data);
            try {
                // Add a chart to the slide
                pptx.addSlide().addChart(pptx.ChartType.bar, data, { x: 1, y: 1, w: 5, h: 3 });
            } catch (error) {
                console.error('Error adding chart:', error);
            }
            
    return pptx;
}

// module.exports = generatePPT;
export default generatePPT;
