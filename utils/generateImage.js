// const { CdataUrlhartJSNodeCanvas } = require('chartjs-node-canvas');
// const Chart = require('chart.js');
// const fs = require('fs');
import fs from 'fs';
// import { Chart } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { createCanvas, loadImage } from 'canvas';
export async function getImage(){
    const width = 800;
    const height = 400;
    const chartCallback = (ChartJS) => {
        ChartJS.defaults.color = "000000";
        ChartJS.defaults.font.size = 16;
    };

    const chartNode = new ChartJSNodeCanvas({ width: 800, height: 600, chartCallback });
    const DATA_COUNT = 7;
   
    const data = {
        labels: ['CISC01', 'CISC02', 'CISC03', 'CISC04', 'CISC05', 'CISC06','CISC07','CISC08','CISC09','CISC10','CISC11','CISC12','CISC13','CISC14','CISC15','CISC16','CISC17','CISC18'],
            datasets: [{
              label: 'My First Dataset',
              data: [65, 59, 90, 81, 56, 55, 40],
              fill: true,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgb(255, 99, 132)',
              pointBackgroundColor: 'rgb(255, 99, 132)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgb(255, 99, 132)'
            }, {
              label: 'My Second Dataset',
              data: [28, 48, 40, 19, 96, 27, 100],
              fill: true,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgb(54, 162, 235)',
              pointBackgroundColor: 'rgb(54, 162, 235)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgb(54, 162, 235)'
            }]
          };
          

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart'
            }
        }
    };
    let dataUrl = '';
    //   (async () => {
    const configuration = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Chart.js Radar Chart'
                }
            }
            ,
            elements: {
                line: {
                  borderWidth: 3
                }
              },
              r: {
                ticks: {
                    color: 'white', // Set the color of the scale ticks to white
                    backgroundColor: 'black' // Set the background color of the scale ticks to black
                }
            }

        }
    };
    console.log(configuration);

    // const image = await chartNode.renderToBuffer(configuration);
    // const image = await chartNode.renderToDataURL(configuration);
     const image = chartNode.renderToStream(configuration);
    //console.log(dataUrl);
    //    const a=atob(image.data);
    // console.log();
    
    // const base64Data = image.toString().split(';base64,').pop();
    // // console.log(base64Data);
    // const buf = Buffer.from(base64Data, 'base64');
    //  console.log("asdfas",buf);
    // // console.log(image.toString());
    return image.toString();
}

//   export default getImage ;