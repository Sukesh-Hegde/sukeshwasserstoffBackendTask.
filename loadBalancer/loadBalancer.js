const express = require("express");
const axios = require("axios");
const app = express();

// Mock APIs
const apiEndpoints = [
  { url: "http://localhost:3001", weight: 1 },
  { url: "http://localhost:3002", weight: 3 },
];

// Logging and Metrics
const logs = [];
let requestCount = 0;

// Queue Management Strategies
const queue = {
  fifo: [],
  priority: [],
  roundRobinIndex: 0,
};

// Dynamic Routing Function
const routeRequest = async (req, res) => {
  const api = selectAPI();
  const startTime = Date.now();

  try {
    const response = await axios.get(api.url);
    const endTime = Date.now();
    logMetrics(api.url, startTime, endTime);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error forwarding request");
  }
};

// API Selection based on Weighted Round Robin
const selectAPI = () => {
  let totalWeight = apiEndpoints.reduce((acc, api) => acc + api.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);

  for (let api of apiEndpoints) {
    if (random < api.weight) {
      return api;
    }
    random -= api.weight;
  }
  return apiEndpoints[0]; // Default to first API
};

// Log Metrics
const logMetrics = (url, startTime, endTime) => {
  const log = {
    requestNumber: ++requestCount,
    endpoint: url,
    requestTime: new Date(startTime).toISOString(),
    responseTime: endTime - startTime,
  };
  logs.push(log);
  console.log(log);
};

// Queue Management
const manageQueues = (req) => {
  queue.fifo.push(req);
  queue.priority.push({ req, priority: Math.random() }); // Random priority for demonstration
};

// Process Requests from Queue
const processQueue = () => {
  while (queue.fifo.length) {
    const req = queue.fifo.shift();
    routeRequest(req, req.res);
  }

  while (queue.priority.length) {
    const highestPriorityRequest = queue.priority
      .sort((a, b) => b.priority - a.priority)
      .shift();
    routeRequest(highestPriorityRequest.req, highestPriorityRequest.req.res);
  }
};

// Middleware to add request to queue
app.use((req, res, next) => {
  req.res = res; // Attach response object to request
  manageQueues(req);
  processQueue();
  next();
});

// Main Route
app.get("/", (req, res) => {});

// Start Load Balancer
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Load Balancer listening on port ${PORT}`);
});
