const express = require('express');
const cors = require('cors');
const app = express();
const host = 'localhost';
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

let stations = [
    {
        id: 1,
        address: "690 Collins Avenue. Worthington",
        status: true
    },
    {
        id: 2,
        address: "1234 Elm Street. Springfield",
        status: false
    },
    {
        id: 3,
        address: "777 Pine Avenue. Lakeside",
        status: true
    },
    {
        id: 4,
        address: "456 Oak Lane. Riverdale",
        status: false
    },
    {
        id: 5,
        address: "1010 Maple Road. Hillcrest",
        status: true
    },
    {
        id: 6,
        address: "2345 Cedar Court. Brookside",
        status: false
    },
    {
        id: 7,
        address: "891 Birch Street. Lakeview",
        status: true
    },
    {
        id: 8,
        address: "333 Pine Avenue. Sunset Hills",
        status: false
    },
    {
        id: 9,
        address: "678 Walnut Drive. Green Valley",
        status: true
    },
    {
        id: 10,
        address: "444 Ash Street. Riverside",
        status: false
    }
];
let lastTemperatureValue = 36;
let lastDoseRateValue = 5;
let lastHumidityValue = 75;

// Routes
app.get('/stations', (req, res) => {
    res.send(stations);
});

app.get('/stations/:id', (req, res) => {
    const station = stations.find(st => st.id == req.params.id);
    res.send(station);
});

app.post('/stations', (req, res) => {
    const station = req.body;
    const stationId = stations[stations.length - 1] 
                        ? stations[stations.length - 1].id + 1 : 1;
    const newStation = {...station, id: stationId};
    stations.push(newStation);
    res.send(newStation);
});

app.delete('/stations/:id', (req, res) => {
    stations = stations.filter(st => st.id != req.params.id);
    res.send("Station " + req.params.id + " has deleted");
})

app.put('/stations/:id', (req, res) => {
    const index = stations.findIndex(st => st.id == req.params.id);
    stations[index] = {
        ...stations[index],
        ...req.body
    };
    res.send(stations[index]);
})

app.get('/stations/:id/metrics', (req, res) => {
    const station = stations.find(st => st.id == req.params.id);
    if(!station.status){
        res.send({
            temperature: 0,
            dose_rate: 0,
            humidity: 0
        })
    } else {
        lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
        lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
        lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);

        res.send({
            temoerature: lastTemperatureValue,
            dose_rate: lastDoseRateValue,
            humidity: lastHumidityValue
        })
    }
})


// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

function generateRandomNumbers(min, max, lastValue){
    if (lastValue === null) {
        // Generate a random number across the full range if no last value is provided
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        // Calculate possible lower and upper bounds considering the last known value
        const low = Math.max(min, lastValue - 1);
        const high = Math.min(max, lastValue + 1);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }
}

