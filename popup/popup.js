const rowTemplate = document.getElementById("table_row_template");
const tableHeaderTemplate = document.getElementById("table_header_template");
const tableTitle = document.getElementById("table_title");
const marketStatus = document.getElementById("market_status");
const statusTime = document.getElementById("status_time");

const typeSelector = document.getElementById("select_type");
const trackerType = document.getElementById("tracker_type");

const elements = new Set();
let elementType = 'Gainers';

//const liveMint = document.getElementById("LM");
//const moneyControl = document.getElementById("MC");
const etButton = document.getElementById("ET");
const liveMintButton = document.getElementById("Livemint");
const growwButton = document.getElementById("Groww");
//const hinduBusinessLine = document.getElementById("HBL");

const saveButton = document.getElementById("Save");

const message = document.getElementById("status_message");

//liveMint.addEventListener("click", openRssLink.bind(null, 'https://www.livemint.com/rss/markets'));  
///moneyControl.addEventListener('click', openRssLink.bind(null, 'https://www.livemint.com/rss/money'));
etButton.addEventListener('click', openETTopGainersLink.bind(null, 'https://economictimes.indiatimes.com/stocks/marketstats/top-gainers', 20));
liveMintButton.addEventListener('click', openLiveMintTopGainers.bind(null, 'https://www.livemint.com/market/nse-top-gainers', 20));
growwButton.addEventListener('click', openGrowwTopGainers.bind(null, 'https://groww.in/markets/top-gainers?index=GIDXNIFTYTOTALMCAP', 20)); // Fetching Groww RSS feed
saveButton.addEventListener('click', saveTopGainers.bind(null)); // Save the top gainers to the database
typeSelector.addEventListener('change', changeTrackerType); // Change the tracker type based on the selection
//NSE.addEventListener('click', openNSETopGainers.bind(null, 'https://www.nseindia.com/market-data/top-gainers-losers', 20)); // Fetching Nifty option chain data
//hinduBusinessLine.addEventListener('click', openRssLink.bind(null, 'https://www.thehindubusinessline.com/rss/stock-market/'));

function openETTopGainersLink(url, topCount) {
  //Captures Top Gainers from ET
  if(trackerType.innerText === 'Losers') {
    url = 'https://economictimes.indiatimes.com/stocks/marketstats/top-losers'; // Change the URL to top losers if the tracker type is Losers
  }
  message.textContent = "Loading..."; // Show loading message
  saveButton.disabled = true; // Disable the save button while loading

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(htmlText => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlText, 'text/html');
      const mainTable = htmlDoc.querySelector('table'); // Find the first table in the document, If this fails someday, use the names given below
      const items = mainTable.querySelectorAll('tbody tr'); // Select all rows in the table body
      const mktStatus = htmlDoc.getElementsByClassName("MarketStatus_marketStatus__T2ZE3  MarketStatus_withSpace__aszhh"); // Get the market status element
      const statTime = htmlDoc.getElementsByClassName("numberFonts MarketStatus_updatetime__PBNo9");
      //const items = htmlDoc.querySelectorAll('.MarketTable_marketsCustomTable__4OuKq tbody tr');

      if (items.length === 0) {
        message.textContent = "No Top " + trackerType.innerText + " found"; // Show no top gainers message
        return;
      }

      //console.log("Items found:", items);
      if(elements.size === 0) {
        //Add these elements only if the set is empty 
        message.textContent = ""; // Clear loading message
        tableTitle.textContent = 'Today\'s top ' + trackerType.innerText + ':'; // Set the table title based on the tracker type
        //console.log("Market Status:", mktStatus, "Status Time:", statTime);
        marketStatus.textContent = mktStatus ? mktStatus.innerText : 'Market Status Unknown'; // Set market status text
        statusTime.textContent = statTime ? statTime[0].innerText: 'Time Not Known'; // Set the market read time

        let thead = tableHeaderTemplate.content.firstElementChild.cloneNode(true); // Clone the header template to actually make the elements
        thead.children[0].innerText = 'Sl.';
        thead.children[1].innerText = 'Website';
        thead.children[2].innerText = 'Company';
        thead.children[3].innerText = 'Price';
        thead.children[4].innerText = 'Change';
        thead.children[5].innerText = '% Change';
        thead.children[6].innerText = 'Saved?'; // Add time column
        document.querySelector("thead").append(thead);
      }

      for (let i = 0; i < topCount; i++) {  //Only we want to show top 10 gainers 
        let item = items[i];
        let company = item.cells[0].innerText.trim();
        let companyLink = 'https://economictimes.indiatimes.com' + new URL(item.cells[0].querySelector('a').href).pathname; // Get the link from the first cell
        let price = item.cells[1].innerText.trim();
        let priceVal = parseFloat(price.replace(/,/g, ''));
        let change = item.cells[2].innerText.trim(); 
        let changeVal = parseFloat(change.replace(/,/g, '')); // Remove commas for parsing
        let pct_change = changeVal/(priceVal-changeVal) * 100; // Assuming the link is the price for this example

        let element = rowTemplate.content.firstElementChild.cloneNode(true);
        element.children[0].innerText = elements.size + 1;
        element.children[1].innerText = 'ET';
        element.children[2].appendChild(document.createElement('a')); // Create a new anchor element for the company url
        element.children[2].querySelector('a').href = companyLink; // Set the link for the company name
        element.children[2].querySelector('a').innerText = company; // Set the company name
        element.children[3].innerText = price;
        element.children[4].innerText = change;
        element.children[5].innerText = pct_change.toFixed(2) + '%'; // Format percentage change to 2 decimal places
        elements.add(element);
      }
      
      document.querySelector("tbody").append(...elements);
      message.textContent = ""; // Clear loading message
      saveButton.disabled = false; // Enable the save button after loading
    })
    .catch(error => {
      console.error('Error fetching or parsing HTML:', error);
    });

}

function openNSETopGainers(url, topCount) {
    //Captures Top Gainers from ET
  message.textContent = "Loading..."; // Show loading message

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(htmlText => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlText, 'text/html');
      //console.log("HTML Document:", htmlDoc); // Log the HTML document for debugging
      const mainTable = htmlDoc.getElementById('topgainer-Table'); // Find the first table in the document, If this fails someday, use the names given below
      const items = mainTable.querySelectorAll('tbody tr'); // Select all rows in the table body
      const mktStatus = htmlDoc.getElementsByClassName("MarketStatus_marketStatus__T2ZE3  MarketStatus_withSpace__aszhh"); // Get the market status element
      const statTime = htmlDoc.getElementsByClassName("asondate");
      //const items = htmlDoc.querySelectorAll('.MarketTable_marketsCustomTable__4OuKq tbody tr');

      if (items.length === 0) {
        message.textContent = "No Top Gainers found"; // Show no top gainers message
        return;
      }

      //console.log("Items found:", items);

      if (elements.size > 0) {
          document.querySelector("table_row_template").innerHTML = ''; // Clear previous elements
          elements.clear(); // Clear the Set to avoid duplicates
      }

      message.textContent = ""; // Clear loading message
      tableTitle.textContent = 'Today\'s top gainers:' ;
      console.log("Market Status:", mktStatus, "Status Time:", statTime);
      marketStatus.textContent = mktStatus ? mktStatus.innerText : 'Market Status Unknown'; // Set market status text
      statusTime.textContent = statTime ? statTime.innerText: 'Time Not Known'; // Set the market read time

      let thead = tableHeaderTemplate.content.firstElementChild.cloneNode(true); // Clone the header template to actually make the elements
      thead.children[0].innerText = 'Sl.';
      thead.children[1].innerText = 'Website';
      thead.children[2].innerText = 'Company';
      thead.children[3].innerText = 'Price';
      thead.children[4].innerText = 'Change';
      thead.children[5].innerText = '% Change';
      thead.children[6].innerText = 'Saved?'; 
      document.querySelector("thead").append(thead);

      for (let i = 0; i < topCount; i++) {  //Only we want to show top 10 gainers 
        let item = items[i];
        let company = item.cells[0].innerText.trim();
        let companyLink = 'https://www.nseindia.com' + new URL(item.cells[0].querySelector('a').href).pathname; // Get the link from the first cell
        let price = item.cells[5].innerText.trim();
        let priceVal = parseFloat(price.replace(/,/g, ''));
        let open = item.cells[1].innerText.trim(); 
        let openVal = parseFloat(open.replace(/,/g, '')); // Remove commas for parsing
        let changeVal = priceVal - openVal;
        let pct_change = changeVal/openVal * 100; // Assuming the link is the price for this example

        let element = rowTemplate.content.firstElementChild.cloneNode(true);
        element.children[0].innerText = i+1;
        element.children[1].innerText = 'NSE';
        element.children[2].appendChild(document.createElement('a')); // Create a new anchor element for the company url
        element.children[2].querySelector('a').href = companyLink; // Set the link for the company name
        element.children[2].querySelector('a').innerText = company; // Set the company name
        element.children[3].innerText = price;
        element.children[4].innerText = change;
        element.children[5].innerText = pct_change.toFixed(2) + '%'; // Format percentage change to 2 decimal places
        elements.add(element);
      }
      
      document.querySelector("tbody").append(...elements);
    })
    .catch(error => {
      console.error('Error fetching or parsing HTML:', error);
    });
}

function openLiveMintTopGainers(url, topCount) {
  //Captures Top Gainers from LiveMint
  if(trackerType.innerText === 'Losers') {
    url = 'https://www.livemint.com/market/nse-top-losers'; // Change the URL to top losers if the tracker type is Losers
  }
  message.textContent = "Loading..."; // Show loading message
  saveButton.disabled = true; // Disable the save button while loading

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(htmlText => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlText, 'text/html');
      const mainTable = htmlDoc.querySelector('table'); // Find the first table in the document, If this fails someday, use the names given below
      const items = mainTable.querySelectorAll('tbody tr'); // Select all rows in the table body
      // const mktStatus = htmlDoc.getElementsByClassName("dateew"); No status in LiveMint
      const statTime = htmlDoc.getElementsByClassName("dateNew");
      //const items = htmlDoc.querySelectorAll('.MarketTable_marketsCustomTable__4OuKq tbody tr');
      //console.log(statTime.innerText)

      if (items.length === 0) {
        message.textContent = "No Top " + trackerType.innerText + " found"; // Show no top gainers message
        return;
      }

      //console.log("Items found:", items);
      if (elements.size === 0) {
        message.textContent = ""; // Clear loading message
        tableTitle.textContent = 'Today\'s top ' + trackerType.innerText + ':' ;
        //console.log("Market Status:", mktStatus, "Status Time:", statTime);
        //marketStatus.textContent = mktStatus ? mktStatus.innerText : 'Market Status Unknown'; 
        statusTime.textContent = statTime ? statTime[0].innerText: 'Time Not Known'; // Set the market read time

        let thead = tableHeaderTemplate.content.firstElementChild.cloneNode(true); // Clone the header template to actually make the elements
        thead.children[0].innerText = 'Sl.';
        thead.children[1].innerText = 'Website';
        thead.children[2].innerText = 'Company';
        thead.children[3].innerText = 'Price';
        thead.children[4].innerText = 'Change';
        thead.children[5].innerText = '% Change';
        thead.children[6].innerText = 'Saved?'; 
        document.querySelector("thead").append(thead);
      }

      for (let i = 0; i < topCount; i++) {  //Only we want to show top 10 gainers 
        let item = items[i];
        let company = item.cells[0].innerText.trim();
        let companyLink = 'https://www.livemint.com'+ new URL(item.cells[0].querySelector('a').href).pathname; // Get the link from the first cell
        let price = item.cells[1].innerText.trim();
        let priceVal = parseFloat(price.replace(/,/g, ''));
        let change = item.cells[2].innerText.trim(); 
        let changeVal = parseFloat(change.replace(/,/g, '')); // Remove commas for parsing
        let pct_change = changeVal/(priceVal-changeVal) * 100; // Assuming the link is the price for this example

        let element = rowTemplate.content.firstElementChild.cloneNode(true);
        element.children[0].innerText = elements.size + 1;
        element.children[1].innerText = 'Mint';
        element.children[2].appendChild(document.createElement('a')); // Create a new anchor element for the company url
        element.children[2].querySelector('a').href = companyLink; // Set the link for the company name
        element.children[2].querySelector('a').innerText = company.substring(0, Math.min(company.length-2, 20)); // Set the company name
        element.children[3].innerText = price;
        element.children[4].innerText = change;
        element.children[5].innerText = pct_change.toFixed(2) + '%'; // Format percentage change to 2 decimal places
        elements.add(element);
      }
      
      document.querySelector("tbody").append(...elements);
      message.textContent = ""; // Clear loading message
      saveButton.disabled = false; // Enable the save button after loading
    })
    .catch(error => {
      console.error('Error fetching or parsing HTML:', error);
    });

}

function openGrowwTopGainers(url, topCount) {
    //Captures Top Gainers from Groww
  if(trackerType.innerText === 'Losers') {
    url = 'https://groww.in/markets/top-losers?index=GIDXNIFTYTOTALMCAP'; // Change the URL to top losers if the tracker type is Losers
  }
  message.textContent = "Loading..."; // Show loading message
  saveButton.disabled = true; // Disable the save button while loading

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(htmlText => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlText, 'text/html');
      const mainTable = htmlDoc.querySelector('table'); // Find the first table in the document, If this fails someday, use the names given below
      const items = mainTable.querySelectorAll('tbody tr'); // Select all rows in the table body
      // const mktStatus = htmlDoc.getElementsByClassName("dateew"); No status in LiveMint
      const statTime = htmlDoc.getElementsByClassName("dateNew");
      //const items = htmlDoc.querySelectorAll('.MarketTable_marketsCustomTable__4OuKq tbody tr');

      if (items.length === 0) {
        message.textContent = "No Top " + typeSelector.innerText + " found"; // Show no top gainers message
        return;
      }

      //console.log("Items found:", items);
      if (elements.size === 0) {
        message.textContent = ""; // Clear loading message
        tableTitle.textContent = 'Today\'s top ' + trackerType.innerText + ':' ;
        //console.log("Market Status:", mktStatus, "Status Time:", statTime);
        //marketStatus.textContent = mktStatus ? mktStatus.innerText : 'Market Status Unknown'; 
        statusTime.textContent = statTime ? statTime.innerText: 'Time Not Known'; // Set the market read time

        let thead = tableHeaderTemplate.content.firstElementChild.cloneNode(true); // Clone the header template to actually make the elements
        thead.children[0].innerText = 'Sl.';
        thead.children[1].innerText = 'Website';
        thead.children[2].innerText = 'Company';
        thead.children[3].innerText = 'Price';
        thead.children[4].innerText = 'Change';
        thead.children[5].innerText = '% Change';
        thead.children[6].innerText = 'Saved?';
        document.querySelector("thead").append(thead);
      }

      for (let i = 0; i < topCount; i++) {  //Only we want to show top 10 gainers 
        let item = items[i];
        let company = item.cells[0].innerText.trim();
        let companyLink = 'https://groww.in'+ new URL(item.cells[0].querySelector('a').href).pathname; // Get the link from the first cell
        let allPriceInfo = item.cells[2].innerText; // Get the price and other info from the second cell, which contains the company name and other details
        let other_info = item.cells[2].querySelector('div').innerText; // Get the other info from the second cell, which contains the company name and other details
        let price = allPriceInfo.substring(0, allPriceInfo.length - other_info.length); // Get the price from the second cell, which is a div with a rupee symbol and commas
        let priceVal = parseFloat(price.substring(1, price.length-1).replace(/,/g, '')); //give amiss to commas and the rupee symbol
        let change = other_info.split(' ')[0];   //need to find the value in the div smaller in this cell
        let changeVal = parseFloat(change.replace(/,/g, '')); // Remove commas for parsing
        let pct_change = changeVal/(priceVal-changeVal) * 100; // Assuming the link is the price for this example

        let element = rowTemplate.content.firstElementChild.cloneNode(true);
        element.children[0].innerText = elements.size + 1;
        element.children[1].innerText = 'Groww';
        element.children[2].appendChild(document.createElement('a')); // Create a new anchor element for the company url
        element.children[2].querySelector('a').href = companyLink; // Set the link for the company name
        element.children[2].querySelector('a').innerText = company.substring(0, Math.min(company.length-2, 20)); // Set the company name
        element.children[3].innerText = price.substring(1, price.length); // Remove the rupee symbol
        element.children[4].innerText = change;
        element.children[5].innerText = pct_change.toFixed(2) + '%'; // Format percentage change to 2 decimal places
        elements.add(element);
        console.log('Checkbox', element.children[6]);
        
      }
      
      document.querySelector("tbody").append(...elements);
      message.textContent = ""; // Clear loading message
      saveButton.disabled = false; // Enable the save button after loading
    })
    .catch(error => {
      console.error('Error fetching or parsing HTML:', error);
    });

}

function saveTopGainers() {
  let  data = []; // Initialize an array to hold the data rows
  for (let element of elements) {
    //if(element.children[6].checked) {
      let type = trackerType.innerText; // Get the tracker type from the text
      let site = element.children[1].innerText;
      let company = element.children[2].innerText;
      let link = element.children[2].querySelector("a").href;
      let price = element.children[3].innerText;
      let change = element.children[4].innerText;
      let pctChange = element.children[5].innerText;

      // Prepare the data to be sent to the server
      let data_row = {
        date: statusTime ? getdatetime(statusTime.innerText) : new Date().toISOString().split('T')[0], // Use current date in YYYY-MM-DD format`
        type: type,
        site: site, 
        stock_name: company,
        link: link,
        end_price: parseFloat(price.replace(/,/g, '')),
        change_price: parseFloat(change.replace(/,/g, '')),
        pct_change: parseFloat(pctChange)/100
      };

      data.push(data_row); // Add the data row to the array
    }
      // Send the data to the server
  
      fetch('http://localhost:3010/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data }), // Wrap in an array
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        message.textContent = "Top Gainers saved successfully!";
      })
      .catch((error) => {
        console.error('Error:', error);
        message.textContent = "Error saving Top Gainers.";
      });
    //}  
  //}
}

function getdatetime(dateString) {
  if(dateString[0]==='A') { //starts with As on for ET
    let datePart = dateString.substring(6, 24).replace(',', ''); 
    let dt = new Date(datePart);
    return dt.toISOString().split('T')[0] + ' ' + dt.toTimeString().split(' ')[0];// Extract the date part from the string
  }
  else if (dateString[0]==='L') { //start wityh Last Updated for Livemint
    let datePart = dateString.substring(18).replace(',', '').replace('|', '')
    let dt = new Date(datePart);
    return dt.toISOString().split('T')[0] + ' ' + dt.toTimeString().split(' ')[0]; // Convert to YYYY-MM-DD format
  }  
  return new Date().toISOString().slice(0, 19).replace('T', ' '); // Convert to YYYY-MM-DD format
}

function changeTrackerType(event) {
  // Change the tracker type based on the selection 
  trackerType.innerText = typeSelector.checked ? "Gainers":"Losers"; // Update the tracker type text
  trackerType.style.color = typeSelector.checked ? "green" : "red"; // Change the color based on the selection
  elementType = trackerType.innerText; // Update the element type to the new tracker type 
  if (elements.size > 0) {
    document.querySelector("thead").innerHTML = ''; // Clear previous header elements 
    document.querySelector("tbody").innerHTML = ''; // Clear previous elements
    elements.clear(); // Clear the Set to avoid duplicates
    tableTitle.textContent = 'Today\'s top ' + trackerType.innerText + ':';
  }
}

function openRssLink(url) { 
    if (elements.size > 0) {
        document.querySelector("ul").innerHTML = ''; // Clear previous elements
        elements.clear(); // Clear the Set to avoid duplicates
    }

    message.textContent = "Loading..."; // Show loading message

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      for (let i = 0; i < items.length; i++) {
          const title = items[i].getElementsByTagName('title')[0].textContent;
          const link = items[i].getElementsByTagName('link')[0].textContent;
          //console.log(title, link);
          
          const element = template.content.firstElementChild.cloneNode(true);
          element.querySelector(".title").textContent = title;
          element.querySelector(".pathname").textContent = link;
          
          elements.add(element);
        }

      message.textContent = "";
      document.querySelector("ul").append(...elements);
      })
      .catch(error => {
            console.error('Error fetching or parsing RSS feed:', error);
      });
}

async function cleanRecommendations() {
    if (elements.size > 0) {
        // call the server function to clean recommendations
        const responses = JSON.parse(await generateContent());

        if (!responses || responses.length === 0) { 
            message.textContent = "No Recommendations found"; // Show no recommendations message
            return;
        }  
        
        let idx =  0;
        
        for (const response of responses) {
            console.log("Response:", response);
            if (!response.has_stock_recommendation) {
              //#TODO:
              // Some error perisists here which causes insufficient deletion of elements
                elements.delete(document.querySelectorAll("li")[idx]);
                document.querySelectorAll("li")[idx].remove(); // Remove the element from the DOM  
                //Don't reverse the order of this execution, as it will cause issues with the index
                //elements.delete(idx);
            }
            idx += 1;
        }
        return;
    }
    else {  
        message.textContent = "No Recommendations to clean"; // Show no recommendations message
        return;
    }    
}

async function generateContent() {
  console.log("Finding relevant recommendations...");
  let link_titles =[];

  for (const element of elements) {
     link_titles.push({
        title: element.querySelector(".title").textContent
      });
      // Uncomment the line below to log each title   
    //console.log("Element:", element.querySelector(".title").textContent);
  }

  const prompt = `You are given a list of titles from RSS feeds.
  For each of title, determine if the title contains recommendations to buy or sell stocks.
  Give your response as a JSON array with the following format:
  
  Response = { "title": string, "has_stock_recommendation": boolean }
  Return: array<Response>`;

  try {
      // Send message to the server and get response
      const response = await fetch('http://localhost:3000/chat', {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ prompt: prompt, data: link_titles }),
                    });

                  if (!response.ok) {
                    throw new Error('Network response was not ok.' + response.statusText);
                  }

      const data = await response.json();
      const botResponse = data.response;
      
      return botResponse; // Return the response from the server

  } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., display an error message to the user)
  } 
}