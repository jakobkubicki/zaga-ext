/* eslint-disable no-undef */
document.getElementById("analyze-product-button").onclick = async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let result;
  try {
    [{result}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => getSelection().toString(),
    });
  } catch (e) { // getSelection() is not available in some tabs
    return;
  }
  document.body.append('Selection: ' + result);
};
