const endpoint = process.argv[2];
const ws = new WebSocket(endpoint);
const evaluate = () => ws.send(JSON.stringify({
  id: 2,
  method: "Runtime.evaluate",
  params: {
    expression: `JSON.stringify({
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      containers: [...document.querySelectorAll('.container-x')].map((e, i) => ({ i, scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, ...e.getBoundingClientRect().toJSON() })),
      wide: [...document.querySelectorAll('*')].map(e => ({ tag: e.tagName, cls: String(e.className), scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, ...e.getBoundingClientRect().toJSON() })).filter(x => x.right > innerWidth + 1 || x.left < -1).slice(0, 40)
    })`,
    returnByValue: true,
  },
}));
ws.onopen = () => ws.send(JSON.stringify({
  id: 1,
  method: "Emulation.setDeviceMetricsOverride",
  params: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
}));
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id === 1) {
    setTimeout(evaluate, 500);
  } else if (message.id === 2) {
    console.log(message.result.result.value);
    process.exit(0);
  }
};
