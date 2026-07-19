import { APP_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log(`${APP_CONFIG.APP_NAME} starting...`);

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js");
    }
});
