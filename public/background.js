// background.js
/* eslint-disable no-undef */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapePage") {
    console.log("scraping page");
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: scrapePage
        }, ([result] = []) => {
            sendResponse(result.result);
        });
      }
    });
  }
  return true; // return true to allow async sendResponse
});

function scrapePage() {
  return {
    url: window.location.href,
    data: document.body.innerText,
  };
}
